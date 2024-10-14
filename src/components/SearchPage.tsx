import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Zap, X, User } from "lucide-react";
import LoginRegister from "./LoginRegister";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { DocumentData, doc, getDoc, updateDoc } from "firebase/firestore";

interface SearchPageProps {
  model: "llama" | "claude";
}

const SearchPage: React.FC<SearchPageProps> = ({ model }) => {
  const [query, setQuery] = useState("");
  const [showProPopup, setShowProPopup] = useState(false);
  const [isProMode, setIsProMode] = useState(false);
  const navigate = useNavigate();
  const [login, setLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  var [user, setUser] = useState<DocumentData | null>(null);
  const convertToDateObject = (dateString: String) => {
    const [day, month, year] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day)); // Create Date object (month is 0-indexed)
  };
  const compareDates = (date1: String, date2: String) => {
    const dateObj1 = convertToDateObject(date1);
    const dateObj2 = convertToDateObject(date2);

    if (dateObj1 < dateObj2) {
      return true;
    } else {
      return false;
    }
  };
  const getCurrentDate = () => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0"); // Get day and add leading 0 if necessary
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed) and add leading 0
    const year = today.getFullYear(); // Get full year

    return `${day}-${month}-${year}`;
  };
  useEffect(() => {
    // Set up the Firebase authentication listener
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is authenticated
        getDoc(doc(db, "users", currentUser.uid)).then((value) => {
          if (value.exists()) {
            if (
              value.data().isPro &&
              compareDates(value.data().expiry, getCurrentDate())
            ) {
              // the subscription has expired
              updateDoc(doc(db, "users", currentUser.uid), {
                isPro: false,
                freeLlama: 5,
                lastLoggedIn: getCurrentDate(),
              });
            } else if (
              !value.data().isPro &&
              compareDates(value.data().lastLoggedIn, getCurrentDate())
            ) {
              updateDoc(doc(db, "users", currentUser.uid), {
                freeLlama: 5,
                lastLoggedIn: getCurrentDate(),
              });
            }

            setUser(value.data());
            setLoggedIn(true);
            setIsProMode(value.data().isPro);
          }
        });
      } else {
        // User is not authenticated
        setUser(null);
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (loggedIn) {
      if (query.trim() && user != null) {
        const searchParams = new URLSearchParams({
          q: query,
          model: model,
          uid: user.uid,
        });
        navigate(
          isProMode
            ? `/pro-results?${searchParams}`
            : `/results?${searchParams}`
        );
      }
    } else {
      setLogin(true);
    }
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false);
      // opening the login dialog
      setLogin(true);
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };
  const toggleProMode = () => {
    if (user != null && !isProMode) {
      navigate(`/pricing-page?uid=${user.uid}`);
    }
  };

  const inspirationTopics = [
    "Latest AI breakthroughs",
    "Gaganyaan mission updates",
    "ChatGPT canvas features",
    "HelpingAI by Abhay Koul",
  ];

  const handleInspirationClick = (topic: string) => {
    setQuery(topic);
    handleSearch({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className=" p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {loggedIn ? (
        <div>
          <div className="flex items-center space-x-2">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-white font-medium">
              {user != null ? user.name : "Varun Gupta"}
            </span>
          </div>
          <button
            onClick={() => handleLogout()}
            className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 pt-3"
          >
            <span>Logout</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setLogin(true)}
          className="flex items-center space-x-1 text-sky-400 hover:text-sky-300"
        >
          <User size={20} />
          <span>Login</span>
        </button>
      )}
      <div className="text-center flex flex-col items-center justify-center  min-h-screen ">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-teal-300 via-blue-400 to-purple-400 text-transparent bg-clip-text animate-gradient">
          Vessu Vision
        </h1>
        <form onSubmit={handleSearch} className="w-3/5 mb-8 relative">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What will you discover today?"
              className="w-full bg-slate-800 text-white border-2 border-slate-700 rounded-full py-4 px-6 pr-32 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition duration-300 group-hover:border-teal-400"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleProMode}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 ${
                  isProMode
                    ? "bg-gradient-to-r from-teal-400 to-blue-500 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-teal-500 hover:text-white"
                }`}
              >
                <Zap size={16} />
                <span>Pro</span>
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 text-white rounded-full p-2 transition duration-300 shadow-lg"
              >
                <Search size={20} />
              </button>
            </div>
          </div>
        </form>
        {showProPopup && (
          <div className="fixed top-4 right-4 bg-gradient-to-r from-teal-400 to-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center">
            <span className="mr-2">Pro mode activated!</span>
            <button
              onClick={() => setShowProPopup(false)}
              className="text-white hover:text-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="mt-8">
          <p className="text-slate-100 mb-4 text-lg font-semibold">
            Need some inspiration? Discover these:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {inspirationTopics.map((topic, index) => (
              <button
                key={index}
                onClick={() => handleInspirationClick(topic)}
                className="bg-gradient-to-r from-teal-400 to-blue-500 text-slate-900 font-medium py-3 px-4 rounded-lg transition duration-300 hover:from-teal-500 hover:to-blue-600 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
      {login && <LoginRegister onClose={() => setLogin(false)} />}
    </div>
  );
};

export default SearchPage;
