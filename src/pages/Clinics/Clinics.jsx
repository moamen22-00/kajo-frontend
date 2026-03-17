import React, { useEffect, useMemo, useState } from "react";
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaSearch,
  FaEnvelope,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { api } from "../../api/apiClient";

import fallbackClinicImg from "../../assets/man.svg";

const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function resolveClinicAvatar(c) {
  const raw =
    c?.avatar_url ||
    c?.avatar ||
    c?.image ||
    c?.avatar_path ||
    c?.avatarPath ||
    null;

  if (!raw) return null;

  // رابط جاهز
  if (typeof raw === "string" && /^https?:\/\//i.test(raw)) return raw;

  // مسار نسبي
  let p = String(raw).replace(/^\/+/, "");

  // لو رجع storage/...
  if (p.startsWith("storage/")) return `${BASE_URL}/${p}`;

  // لو رجع public/...
  if (p.startsWith("public/")) p = p.replace(/^public\//, "");

  // الافتراضي: /storage/...
  return `${BASE_URL}/storage/${p}`;
}

function normalizeClinicsList(res) {
  // Laravel paginator: { data: { data: [...] } } أو { data: [...] } أو { clinics: [...] }
  return (
    res?.data?.data ||
    res?.data ||
    res?.clinics ||
    res?.items ||
    []
  );
}

export default function Clinics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [clinics, setClinics] = useState([]);

  const load = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await api.clinics(1);
      const list = normalizeClinicsList(res);

      setClinics(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل العيادات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return clinics;

    return clinics.filter((c) => {
      const name = String(c?.name || c?.clinic_name || "").toLowerCase();
      const spec = String(c?.specialty || "").toLowerCase();
      const loc = String(c?.location || c?.address || "").toLowerCase();
      return name.includes(s) || spec.includes(s) || loc.includes(s);
    });
  }, [clinics, q]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#101828] font-serif py-20 px-6 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-mainColor text-5xl md:text-6xl font-black mb-8">
            استكشف عياداتنا 🐾
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن اسم عيادة، تخصص، أو مدينة..."
              className="w-full py-5 px-8 pr-14 rounded-full bg-[#FFF1C1]/30 text-mainColor font-bold shadow-sm outline-none border-2 border-transparent focus:border-mainColor transition-all text-right text-xl"
            />
            <FaSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-mainColor text-2xl" />
          </div>

          {error && (
            <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold max-w-2xl mx-auto">
              {error}
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
            <p className="text-xl font-black text-mainColor mb-2">
              لا توجد عيادات حالياً
            </p>
            <p className="text-gray-500 dark:text-gray-300">
              تأكد من إضافة عيادة من setup.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filtered.map((c) => {
              const id = c?.id;
              const img = resolveClinicAvatar(c) || fallbackClinicImg;

              const name = c?.name || c?.clinic_name || "عيادة";
              const specialty = c?.specialty || "—";
              const location = c?.location || c?.address || "—";
              const phone = c?.phone || "—";
              const email = c?.email || c?.user?.email || null;

              const rating = c?.rating ?? 4.8;
              const isOpen = c?.is_open ?? true;

              return (
                <div
                  key={id || name}
                  className="bg-white dark:bg-[#0B1220] rounded-[40px] overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="h-56 relative overflow-hidden">
                    <img
                      src={img}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackClinicImg;
                      }}
                    />

                    <div className="flex justify-between items-center absolute top-4 right-4 left-4">
                      <div className=" bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center justify-center gap-2 shadow-sm ">
                        <FaStar className="text-yellow-500" />
                        <span className="text-mainColor font-black">
                          {Number(rating).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 text-right">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-xs font-black px-4 py-1 rounded-full ${
                          isOpen
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {isOpen ? "متاح الآن" : "مغلق"}
                      </span>

                      <h3 className="text-mainColor text-2xl font-black">
                        {name}
                      </h3>
                    </div>

                    <p className="text-sevenColor dark:text-gray-300 font-bold text-md mb-6 flex items-center justify-end gap-2 italic">
                      {specialty} <FaStethoscope />
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-end gap-3 text-mainColor font-medium opacity-80">
                        <span>{location}</span>
                        <FaMapMarkerAlt className="text-mainColor" />
                      </div>

                      <div className="flex items-center justify-end gap-3 text-mainColor font-medium opacity-80">
                        <span>{phone}</span>
                        <FaPhoneAlt className="text-mainColor" />
                      </div>

                      {email && (
                        <div className="flex items-center justify-end gap-3 text-mainColor font-medium opacity-80">
                          <span>{email}</span>
                          <FaEnvelope className="text-mainColor" />
                        </div>
                      )}
                    </div>

                    {/* ✅ الرابط الصحيح للتفاصيل */}
                    {id ? (
                      <Link
                        to={`/app/clinics/${id}`}
                        className="block w-full text-center cursor-pointer bg-mainColor text-white py-4 rounded-2xl font-black hover:bg-mainColor/90 transition shadow-md text-lg"
                      >
                        عرض التفاصيل والحجز
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 py-4 rounded-2xl font-black cursor-not-allowed"
                      >
                        لا يوجد معرف
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}