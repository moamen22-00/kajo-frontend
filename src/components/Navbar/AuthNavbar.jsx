// src/components/Navbar/AuthNavbar.jsx
import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.svg";
// استيراد زر اللمبة (تأكد من صحة المسار حسب مشروعك)
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function AuthNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "تسجيل الدخول", path: "/login" },
    { name: "من نحن", path: "/information" },
    { name: "إنشاء حساب", path: "/register" },
  ];

  return (
    <Navbar 
      // تم إضافة dark:bg-black/80 و backdrop-blur ليعطي جمالية بالدارك مود
      className="z-100000 bg-white/80 dark:bg-[#101828]/80 backdrop-blur-md h-24 shadow-sm transition-colors duration-500"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link to="/" className="cursor-pointer">
            <img src={logo} alt="KAJO Logo" className="h-40 w-full object-contain" />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-4" justify="end">
        
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavbarItem key={index}>
              <Link 
                to={item.path} 
                className={`
                  px-6 py-2 rounded-full font-bold text-lg transition-all
                  ${isActive 
                    ? "bg-mainColor text-white shadow-md" 
                    : "text-mainColor hover:bg-mainColor/10" 
                  }
                `}
              >
                {item.name}
              </Link>
            </NavbarItem>
          );
        })}
        <NavbarItem className="ml-4">
          <ThemeToggle />
        </NavbarItem>

      </NavbarContent>

      <NavbarContent className="md:hidden" justify="end">
        <NavbarItem className="mr-2">
          <ThemeToggle />
        </NavbarItem>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-mainColor"
        />
      </NavbarContent>

      <NavbarMenu className="bg-sevenColor pt-10" dir="rtl">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavbarMenuItem key={`${item.name}-${index}`}>
              <Link
                className={`
                  w-full font-bold text-2xl py-4 px-6 rounded-xl mb-4 flex justify-start
                  ${isActive ? "bg-white text-mainColor" : "text-white opacity-90"}
                `}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </Navbar>
  );
}