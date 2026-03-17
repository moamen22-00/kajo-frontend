import img1 from '../../assets/kajo.svg'
import { Button, Link } from '@heroui/react';

export default function LandingPage() {
  return (
    <section dir="rtl" className='w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500'>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          
        <div className="flex flex-col items-center text-center order-2 md:order-1 w-full">
        <h1 className=" text-[48px] w-[374] h-[66] font-bold text-mainColor mb-2 leading-tight">
          أهلاً وسهلاً بكم في
        </h1>
        
        <h2 className="text-[48px] w-[796] h[64] font-semibold text-mainColor mb-4 leading-tight">
          أول منصة عربية متكاملة لرعاية الحيوانات
        </h2>
        
        <p className=" text-secondaryColor text-[33px] w[512] h[44]  mb-8 font-medium">
          أبحث .... تبنى .... تسوق من مكان واحد
        </p>

        <div className="flex flex-row flex-wrap justify-center gap-4">
          <Button as={Link} href='/login' variant="bordered" className="bg-mainColor text-white px-8 py-6 rounded-full text-lg font-bold shadow-md">
            تسجيل الدخول
          </Button>
          <Button variant="bordered" as={Link} href='/information' className="border-[#E8A34D] text-white bg-mainColor px-8 py-6 rounded-full text-lg font-bold">
            المزيد حول كاجو
          </Button>
        </div>
      </div>

          {/* الصورة: order-1 بالموبايل (يعني فوق) و md:order-2 بالشاشة الكبيرة (يعني يسار) */}
          <div className="flex justify-center order-1 md:order-2">
            <img 
              src={img1} 
              alt="Kajo Logo" 
              className="w-full max-w-87.5 md:max-w-125 h-auto object-contain" 
            />
          </div>

        </div>
      </div>
    </section>
  );
}