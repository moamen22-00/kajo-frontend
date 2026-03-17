import img2 from '../../assets/cat.svg'
import img3 from '../../assets/Claws.svg'
import notebook from '../../assets/notebook.svg' // استيراد صورة الكروان والمنشور
import { Button, Link } from '@heroui/react';

export default function InformationPage() {
  return (
    <section dir="rtl" className='w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500 relative'>
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center">
          
          <div className="flex flex-col items-center text-center order-2 md:order-1 w-full">
            <p className="text-mainColor dark:text-fourthColor text-[28px] md:text-[33px] mb-8 font-medium leading-relaxed">
              وجهتك الأولى لجميع المعاملات البيطرية، فمن خلال منصتنا
              يمكنك التواصل مع ملاجئ ومتاجر وأطباء بيطريين بأكبر الخبرات
              وأعلى المستويات، لتحصل على كل ما يحتاجه حيوانك في مكان واحد.
              نوفر لك خدمات الحجز الإلكتروني، وخيارات التبنّي، وإمكانية التسوّق
              لمستلزمات الحيوانات الأليفة بسهولة وموثوقية تامة. 
            </p>

            <div className="flex flex-row flex-wrap justify-center gap-4">
              <Button as={Link} href='/login' className="bg-mainColor text-white px-12 py-7 rounded-full text-2xl font-black shadow-lg hover:scale-105 transition-transform cursor-pointer">
                تسجيل الدخول
              </Button>
            </div>
          </div>

          <div className="flex justify-center order-1 relative">
            <div className="z-50">
              <img 
                src={img2} 
                alt="Cat Logo" 
                className="w-full max-w-87.5 max-h-202.5 object-contain" 
              />
            </div>
            <div className="absolute z-0">
              <img 
                src={img3} 
                alt="Claws Logo" 
                className="w-full max-w-239.5 max-h-219.75 object-contain opacity-20 dark:opacity-10" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed  bottom-20 right-10 bg-mainColor p-2 rounded-[40px] flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-100 hover:scale-105 transition-transform duration-300 border-2 border-white/10">
        
        <div className="text-right flex flex-col justify-center order-2">
          <p className="text-white text-lg font-bold opacity-90 mb-1">انضم إلينا الآن</p>
          <div className="flex items-baseline gap-2">
             <span className="text-white text-xl font-black italic tracking-tighter">١,٢٥٠+</span>
             <span className="text-white text-sm font-bold opacity-80 uppercase tracking-widest">عضو</span>
          </div>
        </div>

        <div className="relative order-1">
          <div className="absolute inset-0 bg-white/10 blur-xl "></div> 
          <img 
            src={notebook} 
            alt="Notebook" 
            className="w-40 h-full rounded-4xl object-contain relative z-10 drop-shadow-xl" 
          />
        </div>

      </div>
      
    </section>
  );
}