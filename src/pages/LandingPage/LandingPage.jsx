import { useEffect, useState } from "react";
import img1 from '../../assets/kajo.svg'
import { Button, Link } from '@heroui/react';

export default function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800); // مدة اللودنغ

    return () => clearTimeout(timer);
  }, []);

  // 🔥 شاشة اللودنغ
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-white dark:bg-[#101828]">
        
        <img 
          src={img1} 
          alt="Kajo Logo" 
          className="w-40 mb-6 animate-pulse"
        />

        <p className="text-mainColor text-xl font-bold mb-4">
          Kajo
        </p>

        <div className="w-10 h-10 border-4 border-mainColor border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔥 الصفحة الأساسية
  return (
    <section dir="rtl" className='w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500'>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">

          {/* النص */}
          <div className="flex flex-col items-center text-center order-2 md:order-1 w-full">
            <h1 className="text-[40px] md:text-[48px] font-bold text-mainColor mb-2 leading-tight">
              أهلاً وسهلاً بكم في
            </h1>

            <h2 className="text-[32px] md:text-[48px] font-semibold text-mainColor mb-4 leading-tight">
              أول منصة عربية متكاملة لرعاية الحيوانات
            </h2>

            <p className="text-secondaryColor text-[22px] md:text-[28px] mb-8 font-medium">
              أبحث .... تبنى .... تسوق من مكان واحد
            </p>

            <div className="flex flex-row flex-wrap justify-center gap-4">
              <Button
                as={Link}
                href='/login'
                className="bg-mainColor text-white px-8 py-6 rounded-full text-lg font-bold shadow-md hover:scale-105 transition"
              >
                تسجيل الدخول
              </Button>

              <Button
                as={Link}
                href='/information'
                className="bg-mainColor text-white px-8 py-6 rounded-full text-lg font-bold hover:scale-105 transition"
              >
                المزيد حول كاجو
              </Button>
            </div>
          </div>

          {/* الصورة */}
          <div className="flex justify-center order-1 md:order-2">
            <img
              src={img1}
              alt="Kajo Logo"
              className="w-full max-w-72 md:max-w-96 h-auto object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
}