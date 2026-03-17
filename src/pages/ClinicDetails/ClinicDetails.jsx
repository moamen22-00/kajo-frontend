import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import {
  FaStethoscope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import DynamicFormModal from "../../components/modals/DynamicFormModal";
import GenericTable from "../../components/table/GenericTable";
import { api } from "../../api/apiClient";
import fallbackClinicImg from "../../assets/man.svg";

const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function normalizeClinicResponse(resp) {
  return resp?.clinic || resp?.data?.clinic || resp?.data || resp;
}

function normalizeSlotsResponse(resp) {
  if (Array.isArray(resp)) return resp;
  if (Array.isArray(resp?.slots)) return resp.slots;
  if (Array.isArray(resp?.data?.slots)) return resp.data.slots;
  if (Array.isArray(resp?.data)) return resp.data;
  return [];
}

function resolveClinicImage(clinic) {
  const raw =
    clinic?.avatar_url ||
    clinic?.avatar_path ||
    clinic?.image ||
    clinic?.avatar ||
    "";

  if (!raw) return fallbackClinicImg;
  if (typeof raw === "string" && raw.startsWith("http")) return raw;

  return `${BASE_URL}${String(raw).startsWith("/") ? "" : "/"}${raw}`;
}

function formatStatus(status) {
  const s = String(status || "available").toLowerCase();

  if (s === "booked") return "محجوز";
  if (s === "pending") return "قيد المراجعة";
  if (s === "approved") return "مقبول";
  if (s === "rejected") return "مرفوض";
  return "متاح";
}

function isAvailable(status) {
  return String(status || "available").toLowerCase() === "available";
}

function getDayName(dateString) {
  if (!dateString) return "—";

  const days = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";

  return days[d.getDay()];
}

export default function ClinicDetails() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [clinicInfo, setClinicInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const load = async () => {
    try {
      setError("");
      setLoading(true);

      if (!id) {
        setClinicInfo(null);
        setAvailableSlots([]);
        setError("معرّف العيادة غير موجود بالرابط");
        return;
      }

      const [clinicRes, slotsRes] = await Promise.all([
        api.clinicDetails(id),
        api.clinicSlotsPublic(id),
      ]);

      const c = normalizeClinicResponse(clinicRes);
      const slots = normalizeSlotsResponse(slotsRes);

      setClinicInfo({
        id: c?.id ?? id,
        name: c?.name || "عيادة",
        specialty: c?.specialty || "—",
        address: c?.location || "—",
        phone: c?.phone || "—",
        email: c?.email || c?.user?.email || "—",
        avatar_url: c?.avatar_url || "",
        avatar_path: c?.avatar_path || "",
      });

      setAvailableSlots(Array.isArray(slots) ? slots : []);
    } catch (e) {
      console.error("ClinicDetails load error:", e);
      setError(e?.data?.message || e?.message || "فشل تحميل بيانات العيادة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const clinicImage = useMemo(() => resolveClinicImage(clinicInfo), [clinicInfo]);

  const headers = ["اليوم", "التاريخ", "التوقيت", "الحالة", "حجز"];

  const tableData = useMemo(() => {
    return (availableSlots || []).map((slot) => {
      const available = isAvailable(slot?.status);

      return {
        day: getDayName(slot?.date),
        date: slot?.date || "—",
        time: slot?.time || "—",
        status: formatStatus(slot?.status),
        action: (
          <button
            onClick={() => {
              if (!available) return;
              setSelectedSlot(slot);
              setIsModalOpen(true);
            }}
            disabled={!available}
            className={`px-5 py-2 rounded-full text-sm font-bold transition ${
              available
                ? "bg-mainColor text-white hover:opacity-90 cursor-pointer"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
          >
            {available ? "احجز الآن" : "غير متاح"}
          </button>
        ),
      };
    });
  }, [availableSlots]);

  const bookingFields = [
    {
      name: "animal_type",
      placeholder: "نوع الحيوان (قط، كلب، طائر...)",
    },
    {
      name: "date",
      placeholder: "تاريخ الموعد",
      disabled: true,
      defaultValue: selectedSlot?.date || "",
    },
    {
      name: "time",
      placeholder: "التوقيت",
      disabled: true,
      defaultValue: selectedSlot?.time || "",
    },
    {
      name: "status",
      placeholder: "حالة الحجز",
      disabled: true,
      defaultValue: "pending",
    },
    {
      name: "notes",
      placeholder: "ملاحظات عن الحالة (اختياري)",
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#F8F8F8] dark:bg-[#101828]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen bg-[#F8F8F8] dark:bg-[#101828] pb-20 pt-10 px-4 transition-colors duration-500"
      dir="rtl"
    >
      {error && (
        <div className="max-w-5xl mx-auto mb-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold">
          {error}
        </div>
      )}

      <section className="max-w-4xl mx-auto bg-white dark:bg-[#0B1220] rounded-[40px] shadow-xl border border-[#f0f0f0] dark:border-gray-800 overflow-hidden mb-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] items-center">
          <div className="p-8 md:p-12 text-center md:text-right order-2 md:order-1">
            <h1 className="text-mainColor text-3xl md:text-5xl font-black mb-5">
              {clinicInfo?.name || "عيادة"}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 dark:text-gray-300 mb-4 font-semibold">
              <FaMapMarkerAlt className="text-mainColor" />
              <span>{clinicInfo?.address || "—"}</span>
            </div>

            <p className="text-gray-500 dark:text-gray-300 leading-8 max-w-2xl mx-auto md:mx-0 mb-6">
              أهلاً بك في صفحة الحجز الرسمية، يرجى اختيار الموعد المناسب لك من
              الجدول أدناه، وسنقوم بتأكيد الحجز بعد إرسال الطلب.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <div className="bg-[#FFF7E8] dark:bg-[#1E293B] text-mainColor px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                <FaStethoscope />
                <span>{clinicInfo?.specialty || "—"}</span>
              </div>

              <div className="bg-[#FFF7E8] dark:bg-[#1E293B] text-mainColor px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                <FaPhoneAlt />
                <span>{clinicInfo?.phone || "—"}</span>
              </div>

              {clinicInfo?.email && clinicInfo?.email !== "—" && (
                <div className="bg-[#FFF7E8] dark:bg-[#1E293B] text-mainColor px-4 py-2 rounded-2xl font-bold flex items-center gap-2">
                  <FaEnvelope />
                  <span>{clinicInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="order-1 md:order-2 p-6 md:p-8 flex justify-center">
            <div className="w-[220px] h-[280px] md:w-[250px] md:h-[320px] rounded-[28px] overflow-hidden bg-mainColor/10 shadow-md">
              <img
                src={clinicImage}
                alt={clinicInfo?.name || "clinic"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallbackClinicImg;
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto text-center mb-8">
        <h2 className="text-mainColor text-3xl md:text-4xl font-black">
          جدول المواعيد
        </h2>
        <div className="w-24 h-1.5 bg-mainColor rounded-full mx-auto mt-3" />
      </div>

      <div className="max-w-4xl mx-auto">
        {tableData.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1220] rounded-[30px] p-10 text-center shadow border border-[#f0f0f0] dark:border-gray-800">
            <p className="text-mainColor text-2xl font-black mb-2">
              لا توجد أوقات متاحة حالياً
            </p>
            <p className="text-gray-500 dark:text-gray-300">يرجى المحاولة لاحقاً.</p>
          </div>
        ) : (
          <div className="rounded-[30px] overflow-hidden">
            <GenericTable headers={headers} data={tableData} />
          </div>
        )}
      </div>

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlot(null);
        }}
        title="تأكيد حجز موعد"
        fields={bookingFields}
        buttonText="إرسال طلب الحجز"
        onSubmit={async (data) => {
          try {
            setError("");

            if (!selectedSlot?.id) {
              setError("الوقت غير صالح");
              return;
            }

            await api.createBooking({
              slot_id: selectedSlot.id,
              animal_type: data.animal_type,
              notes: data.notes || null,
            });

            setIsModalOpen(false);
            setSelectedSlot(null);
            await load();
          } catch (e) {
            console.error("createBooking error:", e);
            setError(e?.data?.message || e?.message || "فشل إرسال طلب الحجز");
          }
        }}
      />
    </div>
  );
}