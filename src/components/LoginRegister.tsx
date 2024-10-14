import React, { useState } from "react";
import { X } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase.ts";
import { doc, setDoc } from "firebase/firestore";
interface LoginRegisterProps {
  onClose: () => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const getCurrentDate = () => {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0"); // Get day and add leading 0 if necessary
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed) and add leading 0
    const year = today.getFullYear(); // Get full year

    return `${day}-${month}-${year}`;
  };
  const handleSignUp = async () => {
    try {
      createUserWithEmailAndPassword(auth, email, password).then(
        async (value) => {
          await setDoc(doc(db, "users", value.user.uid), {
            uid: value.user.uid,
            name: name,
            email: email,
            isPro: false,
            freeLlama: 5,
            lastLoggedIn: getCurrentDate(),
          });
        }
      );

      onClose();
      alert("User signed up successfully!");
    } catch (error: any) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("User logged in successfully!");
    } catch (error: any) {
      console.error("Error logging in:", error.message);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin && email.trim().length != 0 && password.trim().length != 0) {
      handleLogin();
    } else if (
      !isLogin &&
      email.trim().length != 0 &&
      password.trim().length != 0 &&
      name.trim().length != 0
    ) {
      handleSignUp();
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          {isLogin ? "Login" : "Register"}
        </h2>
        <form onSubmit={onSubmit}>
          {!isLogin && (
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                id="name"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="password"
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-sky-400 hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginRegister;
