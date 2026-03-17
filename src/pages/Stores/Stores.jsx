import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStore, FaMapMarkerAlt, FaStar, FaSearch, FaShoppingBag } from "react-icons/fa";
import cat4 from "../../assets/cat4.svg";
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import fallbackImg from "../../assets/kajo.svg";
import { api } from "../../api/apiClient";

export default function Stores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.stores();
        setStores(res?.data || []);
      } catch (e) {
        console.error(e);
        setError(e?.data?.message || e?.message || "فشل تحميل المتاجر");
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stores;

    return stores.filter((store) =>
      [store.name, store.location, store.specialty, store.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [stores, query]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#101828] font-serif py-20 px-6 text-right relative overflow-hidden transition-colors duration-500" dir="rtl">
      <img
        src={cat4}
        alt="background cat"
        className="absolute top-10 -left-16 w-112.5 opacity-100 pointer-events-none select-none z-0 rotate-15"
      />

      <img
        src={cat4}
        alt="background cat 2"
        className="absolute bottom-10 -right-20 w-137.5 opacity-100 pointer-events-none select-none z-0"
        style={{ transform: "scaleX(-1) rotate(-10deg)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <div className="flex justify-center mb-6">
            <div className="bg-fourthColor p-5 rounded-full shadow-2xl animate-bounce">
              <FaStore className="text-mainColor text-5xl" />
            </div>
          </div>

          <h1 className="text-mainColor dark:text-fourthColor text-6xl md:text-7xl font-black mb-8 italic drop-shadow-md">
            متاجر كاجو المعتمدة 🛒
          </h1>

          <div className="relative max-w-2xl mx-auto shadow-2xl rounded-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن متجر قريب منك..."
              className="w-full py-7 px-10 pr-20 rounded-full bg-white font-bold outline-none border-4 border-sevenColor focus:border-mainColor transition-all text-2xl placeholder:text-sevenColor"
            />
            <FaSearch className="absolute right-8 top-1/2 -translate-y-1/2 text-mainColor text-3xl" />
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-10 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-mainColor font-black text-2xl">جاري تحميل المتاجر...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-stretch">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-[60px] overflow-hidden shadow-2xl border-2 border-fourthColor hover:border-mainColor hover:-translate-y-4 transition-all duration-500 group flex flex-col"
              >
                <div className="h-72 relative overflow-hidden shrink-0">
                  <img
                    src={store.avatar_url || fallbackImg}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={store.name}
                    onError={(e) => {
                      e.currentTarget.src = fallbackImg;
                    }}
                  />

                  <div className="flex absolute top-6 left-6 right-6 items-center justify-between">
                    <ActionMenu />
                    <div className="bg-white px-5 py-2 rounded-full flex items-center gap-2 shadow-xl border-2 border-fourthColor">
                      <FaStar className="text-yellow-500 text-xl" />
                      <span className="text-mainColor font-black text-xl">
                        {store.rating || 4.8}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-10 flex flex-col grow">
                  <div className="min-h-20 flex items-start justify-between mb-4">
                    <h3 className="text-mainColor text-4xl font-black italic leading-tight">
                      {store.name}
                    </h3>
                    <FaShoppingBag className="text-fourthColor text-3xl shrink-0" />
                  </div>

                  <p className="text-secondaryColor font-bold mb-8 text-xl leading-relaxed grow">
                    {store.description || "متجر معتمد لمستلزمات الحيوانات الأليفة."}
                  </p>

                  <div className="space-y-4 mb-8 border-t-4 border-dotted border-fourthColor pt-6 mt-auto">
                    <p className="flex items-center justify-start gap-3 text-mainColor font-black text-xl italic">
                      <FaMapMarkerAlt className="text-fourthColor text-2xl" />
                      {store.location || "—"}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/app/stores/${store.id}`)}
                    className="w-full bg-mainColor text-white py-6 rounded-[30px] font-black hover:bg-fourthColor hover:text-mainColor transition-all text-2xl shadow-xl flex items-center justify-center gap-4 cursor-pointer group-hover:gap-6"
                  >
                    تسوق الآن
                    <span className="text-3xl">←</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredStores.length === 0 && (
          <div className="text-center mt-16 text-mainColor text-2xl font-black">
            لا توجد متاجر مطابقة
          </div>
        )}
      </div>
    </div>
  );
}