// components/Pric.jsx
import React from "react";
import Link from "next/link";

const Pric = ({ agreed, setAgreed }) => {
  return (
    <div className="flex items-start space-x-2 mt-4">
      <input
        type="checkbox"
        id="terms"
        checked={agreed}
        onChange={() => setAgreed(!agreed)}
        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label htmlFor="terms" className="text-sm text-gray-700">
        I agree to the{" "}
    <Link href="/terms" className="text-blue-600 underline hover:text-blue-800">
          <span className="text-green-600 underline hover:text-blue-800">
            Terms and Conditions
          </span>
          
       </Link>
      </label>
    </div>
  );
};
//hello
export default Pric;
