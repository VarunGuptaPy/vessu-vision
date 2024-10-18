import React from "react";
import { Check } from "lucide-react";
import { RazorpayOrderOptions, useRazorpay } from "react-razorpay";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Navigate, useNavigate } from "react-router-dom";

const PricingPage: React.FC = () => {
  // 8Pszyfg7UR4ENTgF4WFgCoU08Pszyfg7UR4ENTgF4WFgCoU0
  // key: "rzp_test_8E8gTsOFoIAMLY",
  const getDateAfter28Days = () => {
    const today = new Date();

    // Add 28 days to the current date
    today.setDate(today.getDate() + 28);

    const day = String(today.getDate()).padStart(2, "0"); // Get day and add leading 0 if necessary
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Get month (0-indexed) and add leading 0
    const year = today.getFullYear(); // Get full year

    return `${day}-${month}-${year}`;
  };
  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get("uid") || "";
  const navigate = useNavigate();
  const handlePayment = (amt: Number, isLifeTime: boolean) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY, // Replace with your Razorpay key_id
      amount: amt, // Amount is in paise (50000 paise = 500 INR)
      currency: "USD",
      name: "Vessu Vision",
      description: "Transaction for purchase of pro plan",
      handler: function (response: any) {
        // This function will handle payment success
        const docRef = doc(db, "users", uid);
        if (isLifeTime) {
          updateDoc(docRef, { isPro: true, expiry: "30-12-2109" });
        } else {
          updateDoc(docRef, { isPro: true, expiry: getDateAfter28Days() });
        }
        alert(
          `Payment successful! Payment ID: ${response.razorpay_payment_id}`
        );
        navigate("/");
        console.log(response); // Handle the response in production
      },
      theme: {
        color: "#F37254",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();

    rzp1.on("payment.failed", function (response) {
      // This function will handle payment failure
      alert(`Payment failed! Reason: ${response.error.description}`);
      console.log(response);
    });
  };
  const plans = [
    {
      name: "monthly",
      price: "$3.99",
      features: [
        "Unlimited access to llama search",
        "No boundation on usage",
        "A 28 days subscription",
      ],
    },
    {
      name: "Lifetime",
      price: "$39.99",
      features: [
        "Unlimited access to llama search",
        "No boundation on usage",
        "A Life time purchase",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-sky-400">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {plans.map((plan, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-6 flex flex-col">
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <p className="text-3xl font-bold mb-6 text-sky-400">{plan.price}</p>
            <ul className="flex-grow mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center mb-2">
                  <Check size={20} className="text-green-500 mr-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              className="w-full py-2 px-4 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
              onClick={() =>
                handlePayment(
                  index == 0 ? 399 : 3999,
                  index == 0 ? false : true
                )
              }
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
