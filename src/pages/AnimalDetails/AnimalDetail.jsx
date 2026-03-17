import React from 'react';
import { Button, useDisclosure } from "@heroui/react";
import DynamicFormModal from "../../components/modals/DynamicFormModal";
import img1 from "../../assets/cat2.svg";

export default function AnimalDetails() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const animal = {
    name: "لوسي", type: "قط شيرازي", age: "سنة", vaccines: "ملقحة بالكامل", health: "ممتازة",
    image: `${img1}` 
  };

  return (
    /* 1. الخلفية الأساسية: تحولت من bg-white لـ bg-[#101828] بالدارك */
    <div className="min-h-screen bg-white dark:bg-[#101828] py-20 px-6 font-serif text-right transition-colors duration-500" dir="rtl">
      
      {/* 2. البرواز الكبير: غيرنا border-white لـ dark:border-[#1c293e] عشان ما يضل أبيض فاقع */}
      <div className="max-w-6xl mx-auto bg-mainColor rounded-[60px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border-15 border-white dark:border-[#1c293e] transition-all">
        
        <div className="lg:w-[60%] h-full">
          <img src={animal.image} className="w-full h-full object-cover" alt={animal.name} />
        </div>

        <div className="lg:w-[40%] p-12 text-white flex flex-col justify-center">
          <h1 className="text-7xl font-black mb-10 italic">{animal.name}</h1>
          
          <div className="space-y-5 text-2xl">
            {/* 3. الكروت الصغيرة بقلب النافذة: استخدمت bg-white/10 بالجهتين بتبقى حلوة، بس ضفت لمسة للدارك */}
            <div className="bg-white/10 dark:bg-black/20 p-5 rounded-3xl border-r-8 border-fourthColor shadow-inner"><b>النوع:</b> {animal.type}</div>
            <div className="bg-white/10 dark:bg-black/20 p-5 rounded-3xl border-r-8 border-fourthColor shadow-inner"><b>العمر:</b> {animal.age}</div>
            <div className="bg-white/10 dark:bg-black/20 p-5 rounded-3xl border-r-8 border-fourthColor shadow-inner"><b>اللقاحات:</b> {animal.vaccines}</div>
            <div className="bg-white/10 dark:bg-black/20 p-5 rounded-3xl border-r-8 border-fourthColor shadow-inner"><b>الحالة:</b> {animal.health}</div>
          </div>

          <Button onPress={onOpen} className="mt-12 bg-secondColor text-fourthColor h-24 rounded-full text-4xl font-black shadow-2xl hover:scale-105 transition">
            طلب تبني 🐾
          </Button>
        </div>
      </div>

      <DynamicFormModal 
        isOpen={isOpen} onClose={onClose} 
        title="طلب تبني لوسي" 
        fields={[
          {name:"name", placeholder:"اسمك"},
          {name:"animal", placeholder:"الحيوان المَتبنى"}, 
          {name:"phone", placeholder:"رقمك"},
          {name:"previousAdoption", placeholder:"هل سبق لك التبني؟"}, 
          {name:"deliveryDate", placeholder:"تاريخ التسليم"},  
          {name:"note", placeholder:"ملاحظة"}
        ]} 
        buttonText="إرسال الطلب"
      />
    </div>
  );
}