import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaMapMarkerAlt,
  FaClipboardList,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import CustomInput from "../../components/CustomInput/CustomInput";
import { profileSchema } from "../../schema/profileSchema";
import { useAuth } from "../../context/AuthContext";
import { api, setAuth, getStoredUser } from "../../api/apiClient";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  // الصورة
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Placeholder حسب الرول الحقيقي
  const getRoleLabels = () => {
    const role = Number(user?.role);

    switch (role) {
      case 5:
        return { namePlaceholder: "اسم الطبيب / العيادة", icon: <FaUser /> };
      case 4:
        return { namePlaceholder: "اسم الملجأ", icon: <FaUser /> };
      case 3:
        return { namePlaceholder: "اسم المتجر", icon: <FaUser /> };
      default:
        return { namePlaceholder: "اسم المستخدم", icon: <FaUser /> };
    }
  };

  const labels = getRoleLabels();

  const getRoleName = () => {
    const role = Number(user?.role);

    switch (role) {
      case 5:
        return "doctor";
      case 4:
        return "shelter";
      case 3:
        return "store";
      case 1:
      default:
        return "user";
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      phone: "",
      address: "",
    },
  });

  const loadProfile = async () => {
    setLoading(true);
    setStatus("");

    try {
      const res = await api.profile();
      const u = res?.user ?? res;

      reset({
        name: u?.name || "",
        email: u?.email || "",
        password: "",
        phone: u?.phone || "",
        address: u?.address || "",
      });

      if (u?.avatar_url) {
        setImagePreview(u.avatar_url);
      }

      const stored = getStoredUser() || {};
      const merged = { ...stored, ...u };
      setAuth({ user: merged });
      setUser?.(merged);
    } catch (e) {
      setStatus(e?.message || "فشل تحميل بيانات البروفايل");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    setSaving(true);
    setStatus("");

    try {
      const fd = new FormData();

      fd.append("name", data.name || "");
      fd.append("email", data.email || "");
      fd.append("phone", data.phone || "");
      fd.append("address", data.address || "");

      if (data.password?.trim()) {
        fd.append("password", data.password.trim());
      }

      if (imageFile) {
        fd.append("avatar", imageFile);
      }

      const res = await api.updateProfile(fd);
      const u = res?.user ?? res;

      if (u?.avatar_url) {
        setImagePreview(u.avatar_url);
        setImageFile(null);
      }

      const stored = getStoredUser() || {};
      const merged = { ...stored, ...u };
      setAuth({ user: merged });
      setUser?.(merged);

      setStatus("✅ تم حفظ التغييرات بنجاح");
    } catch (e) {
      setStatus(e?.message || e?.data?.message || "فشل حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full min-h-screen bg-white dark:bg-[#101828] flex items-center justify-center transition-colors duration-500">
        <div className="text-mainColor font-bold">جاري تحميل البروفايل...</div>
      </section>
    );
  }

  return (
    <section
      className="w-full min-h-screen bg-white dark:bg-[#101828] flex flex-col items-center p-10 transition-colors duration-500"
      dir="rtl"
    >
      {!!status && (
        <div className="w-full max-w-2xl mb-6">
          <div className="bg-mainColor/10 text-mainColor font-bold p-4 rounded-2xl text-right">
            {status}
          </div>
        </div>
      )}

      {/* الصورة */}
      <div className="flex flex-col items-center mb-12">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />

        <div
          onClick={handleImageClick}
          className="w-44 h-44 bg-sevenColor rounded-full border-[6px] border-mainColor flex items-center justify-center overflow-hidden relative group cursor-pointer"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser className="text-white text-7xl opacity-40" />
          )}

          <div className="absolute inset-0 bg-mainColor/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-white text-sm">
            تغيير
          </div>
        </div>

        <h2 className="text-sevenColor text-2xl font-black mt-4">
          {imagePreview ? "تعديل الصورة" : "أضف صورة"}
        </h2>

        <span className="text-mainColor font-bold opacity-60 italic">
          @{getRoleName()}
        </span>
      </div>

      {/* زر نشاطاتي */}
      <div className="w-full max-w-2xl mb-8">
        <Link
          to="/app/my-activities"
          className="w-full flex items-center justify-center gap-3 bg-mainColor text-white py-4 rounded-full font-bold text-xl shadow-lg hover:opacity-90 active:scale-95 transition-transform"
        >
          <FaClipboardList />
          <span>نشاطاتي</span>
        </Link>
      </div>

      {/* الفورم */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        <CustomInput
          name="name"
          placeholder={labels.namePlaceholder}
          register={register}
          error={errors.name}
          style={{ backgroundColor: "sevenColor", cursor: "pointer" }}
          startContent={React.cloneElement(labels.icon, {
            className: "text-white text-xl ml-2",
          })}
        />

        <CustomInput
          name="email"
          placeholder="البريد الالكتروني"
          register={register}
          error={errors.email}
          style={{ backgroundColor: "sevenColor", cursor: "pointer" }}
          startContent={<FaEnvelope className="text-white text-xl ml-2" />}
        />

        <CustomInput
          name="password"
          type="password"
          placeholder="كلمة السر الجديدة (اختياري)"
          register={register}
          error={errors.password}
          style={{ backgroundColor: "sevenColor", cursor: "pointer" }}
          startContent={<FaLock className="text-white text-xl ml-2" />}
        />

        <CustomInput
          name="phone"
          placeholder="رقم الهاتف"
          register={register}
          error={errors.phone}
          style={{ backgroundColor: "sevenColor", cursor: "pointer" }}
          startContent={<FaPhone className="text-white text-xl ml-2" />}
        />

        <CustomInput
          name="address"
          placeholder="العنوان"
          register={register}
          error={errors.address}
          style={{ backgroundColor: "sevenColor", cursor: "pointer" }}
          startContent={<FaMapMarkerAlt className="text-white text-xl ml-2" />}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-mainColor/90 text-white py-4 rounded-full font-bold text-xl mt-4 hover:bg-mainColor shadow-lg active:scale-95 transition-transform cursor-pointer disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </form>
    </section>
  );
}