import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/apiClient";

function translateStatus(status) {
  if (status === "pending") return "قيد الانتظار";
  if (status === "approved") return "تم القبول";
  if (status === "confirmed") return "تم التأكيد";
  if (status === "rejected") return "مرفوض";
  if (status === "cancelled") return "ملغي";
  if (status === "processing") return "قيد المعالجة";
  if (status === "shipped") return "تم الشحن";
  if (status === "delivered") return "تم التوصيل";
  return status || "—";
}

function typeLabel(item) {
  if (item.type === "clinic") return "موعد عيادة";
  if (item.type === "store") return "طلب متجر";

  if (item.type === "shelter" && item.subtype === "adoption") {
    return "طلب تبنّي";
  }

  if (item.type === "shelter" && item.subtype === "donation") {
    return "طلب تبرع";
  }

  if (item.type === "shelter") return "نشاط ملجأ";

  return "نشاط";
}

export default function MyActivities() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState({
    all: [],
    clinics: [],
    stores: [],
    shelters: [],
  });
  const [activeTab, setActiveTab] = useState("all");

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.myActivities();
      setActivities(
        res?.activities || {
          all: [],
          clinics: [],
          stores: [],
          shelters: [],
        }
      );
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل النشاطات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const currentItems = useMemo(() => {
    return activities?.[activeTab] || [];
  }, [activities, activeTab]);

  const tabs = [
    { key: "all", label: `الكل (${activities?.all?.length || 0})` },
    { key: "clinics", label: `العيادات (${activities?.clinics?.length || 0})` },
    { key: "stores", label: `المتاجر (${activities?.stores?.length || 0})` },
    { key: "shelters", label: `الملاجئ (${activities?.shelters?.length || 0})` },
  ];

  return (
    <section
      className="w-full min-h-screen bg-white dark:bg-[#101828] px-6 py-10 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-mainColor text-5xl font-black italic mb-4">
            نشاطاتي
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-lg font-bold">
            هنا تجد جميع طلباتك وتحركاتك داخل المنصة
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-full font-black text-lg transition ${
                activeTab === tab.key
                  ? "bg-mainColor text-white shadow-lg"
                  : "bg-white dark:bg-[#0B1220] text-mainColor border border-mainColor/20 hover:bg-mainColor/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-mainColor text-2xl font-black py-20">
            جاري تحميل النشاطات...
          </div>
        ) : currentItems.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1220] rounded-3xl shadow border border-gray-100 dark:border-gray-800 p-10 text-center">
            <p className="text-mainColor text-2xl font-black mb-2">
              لا توجد نشاطات حالياً
            </p>
            <p className="text-gray-500 dark:text-gray-300">
              عندما تقوم بالحجز أو الطلب أو التبني أو التبرع ستظهر هنا
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {currentItems.map((item) => (
              <div
                key={`${item.type}-${item.subtype || "main"}-${item.id}`}
                className="bg-white dark:bg-[#0B1220] rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="bg-mainColor/10 text-mainColor px-4 py-1 rounded-full font-black">
                        {typeLabel(item)}
                      </span>
                      <span className="bg-gray-100 dark:bg-[#1E293B] text-gray-700 dark:text-gray-200 px-4 py-1 rounded-full font-bold">
                        {translateStatus(item.status)}
                      </span>
                    </div>

                    <h2 className="text-mainColor text-2xl font-black mb-2">
                      {item.title || "—"}
                    </h2>

                    <p className="text-sevenColor text-lg font-bold mb-4">
                      {item.subtitle || "—"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300 font-bold">
                      {item.location && <p>الموقع: {item.location}</p>}
                      {item.phone && <p>الهاتف: {item.phone}</p>}
                      {item.date && <p>التاريخ: {item.date}</p>}
                      {item.time && <p>الوقت: {item.time}</p>}
                      {item.quantity && <p>الكمية: {item.quantity}</p>}
                      {item.animal_type && <p>نوع الحيوان: {item.animal_type}</p>}
                      {item.delivery_date && <p>تاريخ التسليم: {item.delivery_date}</p>}
                      {typeof item.has_adopted_before === "boolean" && (
                        <p>سبق له التبني: {item.has_adopted_before ? "نعم" : "لا"}</p>
                      )}
                      {item.donation_type && <p>نوع التبرع: {item.donation_type}</p>}
                      {item.amount_or_item && <p>التبرع: {item.amount_or_item}</p>}
                      {item.created_at && <p>تاريخ الطلب: {item.created_at}</p>}
                    </div>

                    {item.notes && (
                      <div className="mt-4 bg-mainColor/5 rounded-2xl p-4">
                        <p className="text-mainColor font-black mb-1">ملاحظات</p>
                        <p className="text-gray-700 dark:text-gray-300 font-bold">
                          {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}