import React, { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import { api } from "../../api/apiClient";
import fallbackShelter from "../../assets/cat2.svg";

export default function Shelters() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shelters, setShelters] = useState([]);
  const [query, setQuery] = useState("");

  const loadShelters = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.shelters();
      setShelters(res?.data || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل الملاجئ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const filteredShelters = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shelters;

    return shelters.filter((shelter) => {
      return [
        shelter.name,
        shelter.location,
        shelter.phone,
        shelter.specialty,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [shelters, query]);

  return (
    <div
      className="min-h-screen bg-white dark:bg-[#101828] font-serif py-20 px-6 text-right transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-mainColor text-5xl font-black mb-8 italic">
            استكشف الملاجئ الشريكة 🐾
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن ملجأ..."
              className="w-full py-5 px-8 rounded-full bg-[#FFF1C1]/30 text-mainColor font-bold shadow-sm outline-none border-2 border-transparent focus:border-mainColor text-xl"
            />
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-mainColor text-2xl" />
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-mainColor text-2xl font-black">
            جاري تحميل الملاجئ...
          </div>
        ) : filteredShelters.length === 0 ? (
          <div className="text-center text-mainColor text-2xl font-black">
            لا توجد ملاجئ حالياً
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredShelters.map((shelter) => (
              <div
                key={shelter.id}
                className="bg-white dark:bg-[#0B1220] rounded-[40px] overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={shelter.avatar_url || fallbackShelter}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={shelter.name}
                    onError={(e) => {
                      e.currentTarget.src = fallbackShelter;
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <ActionMenu />
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-mainColor text-2xl font-black mb-4 italic">
                    {shelter.name}
                  </h3>

                  <div className="space-y-3 mb-8 opacity-80 font-bold">
                    <p className="flex items-center text-mainColor justify-start gap-2">
                      <FaMapMarkerAlt /> {shelter.location || "—"}
                    </p>
                    <p className="flex items-center text-mainColor justify-start gap-2">
                      <FaPhoneAlt /> {shelter.phone || "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/app/shelters/${shelter.id}`)}
                    className="w-full cursor-pointer bg-mainColor text-white py-4 rounded-2xl font-black hover:bg-mainColor/90 transition text-lg shadow-md"
                  >
                    زيارة الملجأ والتبني
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}