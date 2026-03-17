import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useAuth } from "../../context/AuthContext";
import { FaTrash } from "react-icons/fa";

export default function ActionMenu({
  onDelete,
  dotsColor = "text-mainColor",
  adminRoleValue = 1, // إذا أدمن عندك role=1 اتركها، إذا غير هيك عدّلها
}) {
  const { user } = useAuth();

  const isAdmin = Number(user?.role) === Number(adminRoleValue);
  if (!isAdmin) return null;

  return (
    <Dropdown
      placement="bottom-end"
      className="bg-white shadow-xl border-1 border-gray-100"
    >
      <DropdownTrigger>
        <div
          className={`${dotsColor} font-bold text-3xl cursor-pointer hover:opacity-70 transition-opacity px-2 select-none`}
          aria-label="Action menu"
          title="خيارات"
        >
          •••
        </div>
      </DropdownTrigger>

      <DropdownMenu aria-label="خيارات التحكم" variant="flat" className="min-w-30">
        <DropdownItem
          key="delete"
          onClick={onDelete}
          color="danger"
          startContent={<FaTrash className="text-sm" />}
          className="text-right text-danger font-bold"
        >
          حذف
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}