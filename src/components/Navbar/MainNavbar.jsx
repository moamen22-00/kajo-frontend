import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.svg";
import { FaBookmark, FaSignOutAlt } from "react-icons/fa";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

export default function MainNavbar() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const { user, isAdmin, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const forcedAdmin = user?.email === "admin@kajo.com";
  const adminMode = isAdmin || forcedAdmin;

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const isActive = (path) => {
    const current = location.pathname;
    return current === path || current.startsWith(path + "/");
  };

  const getLinks = () => {
    if (loading || !user) return [];

    const role = Number(user?.role);
    const hasSetup = !!(user?.hasSetup ?? user?.has_setup);

    const baseLinks = [
      { name: "الرئيسية", path: "/app/feed" },
      { name: "المتاجر", path: "/app/stores" },
      { name: "الملاجئ", path: "/app/shelters" },
      { name: "العيادات", path: "/app/clinics" },
    ];

    const roleLinks = [];

    if (role === 5) {
      roleLinks.push({
        name: "لوحة العيادة",
        path: hasSetup ? "/app/dashboard" : "/app/setup",
      });
    }

    if (role === 3) {
      roleLinks.push({
        name: "لوحة المتجر",
        path: hasSetup ? "/app/store-dashboard" : "/app/setup",
      });
    }

    if (role === 4) {
      roleLinks.push({
        name: "لوحة الملجأ",
        path: hasSetup ? "/app/shelter-dashboard" : "/app/setup",
      });
    }

    const adminLinks = adminMode
      ? [
          { name: "لوحة تحكم الأدمن", path: "/admin/dashboard" },
          { name: "طلبات الانضمام", path: "/admin/users-requests" },
          { name: "إدارة المستخدمين", path: "/admin/users" },
        ]
      : [];

    return [...baseLinks, ...roleLinks, ...adminLinks];
  };

  const menuItems = getLinks();

  const logoHref = user
    ? adminMode
      ? "/admin/dashboard"
      : "/app/feed"
    : "/login";

  return (
    <Navbar
      className="z-[100000] bg-white/80 dark:bg-[#101828]/80 backdrop-blur-md h-24 shadow-sm transition-colors duration-500"
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
    >
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link to={logoHref} className="cursor-pointer">
            <img src={logo} alt="Logo" className="h-40 w-full" />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden md:flex gap-2" justify="center">
        {menuItems.map((item, index) => (
          <NavbarItem key={index}>
            <Link
              to={item.path}
              className={`px-4 py-2 rounded-full font-bold transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-mainColor text-white shadow-md"
                  : "text-mainColor hover:bg-mainColor/10"
              }`}
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}

        {user && (
          <NavbarItem>
            <Link
              to="/app/profile"
              className={`px-5 py-2 rounded-full font-bold transition-all duration-200 ${
                isActive("/app/profile")
                  ? "bg-mainColor text-white shadow-md"
                  : "bg-mainColor/15 text-mainColor hover:bg-mainColor/25"
              }`}
            >
              البروفايل
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        {user && (
          <NavbarItem>
            <Link
              to="/app/saved"
              className="p-2 text-mainColor text-2xl hover:opacity-70"
              aria-label="Saved"
            >
              <FaBookmark />
            </Link>
          </NavbarItem>
        )}

        {user && (
          <NavbarItem>
            <button
              onClick={handleLogout}
              className="p-2 text-mainColor text-2xl hover:opacity-70"
              aria-label="Logout"
            >
              <FaSignOutAlt />
            </button>
          </NavbarItem>
        )}

        <NavbarItem>
          <ThemeToggle />
        </NavbarItem>

        {menuItems.length > 0 && (
          <NavbarMenuToggle className="md:hidden text-mainColor ml-2" />
        )}
      </NavbarContent>

      <NavbarMenu className="bg-sevenColor pt-10">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={index}>
            <Link
              to={item.path}
              className="text-white text-xl font-bold py-3 block"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}

        {user && (
          <NavbarMenuItem>
            <Link
              to="/app/profile"
              className="text-white text-xl font-bold py-3 block"
              onClick={() => setIsMenuOpen(false)}
            >
              البروفايل
            </Link>
          </NavbarMenuItem>
        )}

        {user && (
          <NavbarMenuItem>
            <Link
              to="/app/saved"
              className="text-white text-xl font-bold py-3 block"
              onClick={() => setIsMenuOpen(false)}
            >
              المحفوظات
            </Link>
          </NavbarMenuItem>
        )}

        {user && (
          <NavbarMenuItem>
            <button
              onClick={async () => {
                setIsMenuOpen(false);
                await handleLogout();
              }}
              className="text-white text-xl font-bold py-3 block w-full text-left"
            >
              تسجيل الخروج
            </button>
          </NavbarMenuItem>
        )}
      </NavbarMenu>
    </Navbar>
  );
}