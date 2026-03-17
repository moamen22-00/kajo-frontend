import React from "react";
import { useNavigate } from "react-router-dom";
import notfoundImg from "../../assets/not-found.svg";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-[#101828] flex items-center justify-center">
      
      <img 
        src={notfoundImg} 
        alt="404 Not Found" 
        className="w-full h-full object-contain md:object-cover transition-all duration-500"
      />

      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full flex justify-center px-6">
        <button 
          onClick={() => navigate("/")}
          className="bg-mainColor text-white px-8 md:px-12 py-3 md:py-4 rounded-full font-black text-lg md:text-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
        >
          العودة للرئيسية 🐾
        </button>
      </div>
    </div>
  );
}