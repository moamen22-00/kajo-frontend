import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/apiClient";
import GenericTable from "../table/GenericTable";
import DynamicFormModal from "../modals/DynamicFormModal";
import {
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

// احتياط: لو رجع وقت بصيغة AM/PM
function to24h(timeStr) {
  if (!timeStr) return null;
  const s = String(timeStr).trim();
  if (/^\d{2}:\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;

  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ap = m[3].toUpperCase();

  if (ap === "PM" && hh < 12) hh += 12;
  if (ap === "AM" && hh === 12) hh = 0;

  return String(hh).padStart(2, "0") + ":" + mm;
}

function translateStatus(status) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "تم التأكيد";
  if (status === "rejected") return "مرفوض";
  return status || "—";
}

export default function DoctorDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const addSlotModal = useDisclosure();
  const slotsRef = useRef(null);

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [dashboardData, setDashboardData] = useState(null);
  const [slots, setSlots] = useState([]);

  const isClinic = Number(user?.role) === 5;

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    if (!isClinic) {
      navigate("/app/feed", { replace: true });
      return;
    }

    const hasSetup = !!(user.hasSetup ?? user.has_setup);
    if (!hasSetup) {
      navigate("/app/setup", { replace: true });
      return;
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

  const loadAll = async () => {
    try {
      setError("");
      setFetching(true);

      const [dash, s] = await Promise.all([
        api.getDoctorDashboard(),
        api.doctorSlots(),
      ]);

      setDashboardData(dash);
      setSlots(s?.slots || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل الداشبورد");
    } finally {
      setFetching(false);
    }
  };

  const profile = dashboardData?.profile ?? null;
  const statistics = dashboardData?.statistics ?? {
    today: 0,
    upcoming: 0,
    patients: 0,
  };
  const appointments = dashboardData?.appointments ?? [];

  const avatarSrc =
    profile?.avatar ||
    user?.avatar_url ||
    user?.avatar ||
    "https://via.placeholder.com/150";

  // ----------------- Slots table -----------------
  const slotsHeaders = ["التاريخ", "الوقت", "الحالة", "حذف"];

  const slotsRows = useMemo(() => {
    return (slots || []).map((slot) => ({
      date: slot.date,
      time: slot.time,
      status: translateStatus(slot.status),
      del: (
        <Button
          isIconOnly
          className="bg-transparent text-red-500 text-xl"
          onClick={async () => {
            try {
              setError("");
              await api.deleteDoctorSlot(slot.id);
              setSlots((prev) => prev.filter((x) => x.id !== slot.id));
            } catch (e) {
              setError(e?.data?.message || e?.message || "فشل حذف الوقت");
            }
          }}
        >
          <FaTrash />
        </Button>
      ),
    }));
  }, [slots]);

  // ----------------- Appointments table -----------------
  const apptHeaders = [
    "اسم العميل",
    "نوع الحيوان",
    "التاريخ",
    "الوقت",
    "الحالة",
    "إجراء",
  ];

  const apptRows = useMemo(() => {
    return (appointments || []).map((appointment) => ({
      owner: appointment.owner_name ?? "—",
      animal: appointment.animal_type ?? "—",
      date: appointment.date,
      time: appointment.time,
      status: translateStatus(appointment.status),
      action:
        appointment.status === "pending" ? (
          <div className="flex gap-2 justify-center">
            <Button
              className="bg-green-600 text-white"
              isDisabled={fetching}
              onClick={async () => {
                try {
                  setError("");
                  await api.updateAppointmentStatus(appointment.id, "approved");
                  await loadAll();
                } catch (e) {
                  console.error(e);
                  setError(e?.data?.message || e?.message || "فشل تأكيد الحجز");
                }
              }}
            >
              <FaCheck /> تأكيد
            </Button>

            <Button
              className="bg-red-600 text-white"
              isDisabled={fetching}
              onClick={async () => {
                try {
                  setError("");
                  await api.updateAppointmentStatus(appointment.id, "rejected");
                  await loadAll();
                } catch (e) {
                  console.error(e);
                  setError(e?.data?.message || e?.message || "فشل رفض الحجز");
                }
              }}
            >
              <FaTimes /> رفض
            </Button>
          </div>
        ) : (
          <span className="font-bold text-gray-500 dark:text-gray-300">
            تمت المعالجة
          </span>
        ),
    }));
  }, [appointments, fetching]);

  if (loading || !user) return null;

  return (
    <div
      className="w-full min-h-screen bg-white dark:bg-[#101828] pb-20 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-6 mt-10">
        {/* Header card */}
        <div className="bg-[#FFF7E6] dark:bg-[#1E293B] rounded-3xl shadow-md p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-mainColor bg-white">
            <img
              src={avatarSrc}
              alt="Clinic"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-mainColor mb-2">
              {profile?.name ? `لوحة العيادة - ${profile.name}` : "لوحة العيادة"}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              التخصص: {profile?.specialty || "—"}
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <FaMapMarkerAlt />
                {profile?.location || "لا يوجد عنوان"}
              </span>

              <span className="flex items-center gap-2">
                <FaPhoneAlt />
                {profile?.phone || "لا يوجد رقم"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="bg-mainColor text-white"
              onClick={loadAll}
              isDisabled={fetching}
            >
              {fetching ? "جاري التحديث..." : "تحديث"}
            </Button>

            <Link
              to="/app/dashboard/appointments"
              className="inline-block text-center bg-mainColor text-white px-6 py-3 rounded-full font-bold hover:opacity-90 transition"
            >
              عرض حجوزات المرضى
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold">
            {error}
          </div>
        )}

        {fetching && (
          <div className="mt-8 flex justify-center">
            <Spinner size="lg" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-mainColor text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">مواعيد اليوم</h3>
            <p className="text-3xl font-black mt-2">{statistics.today ?? 0}</p>
          </div>

          <div className="bg-green-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">مواعيد قادمة</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.upcoming ?? 0}
            </p>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">عدد المرضى</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.patients ?? 0}
            </p>
          </div>
        </div>

        {/* Slots section */}
        <div ref={slotsRef} className="mt-16 flex flex-col items-center gap-8">
          <Button
            onPress={addSlotModal.onOpen}
            className="bg-mainColor text-white rounded-full px-10 py-6 text-xl font-bold"
          >
            <FaPlus /> إضافة وقت متاح
          </Button>

          <h2 className="text-mainColor text-3xl md:text-4xl font-black">
            الأوقات المتاحة
          </h2>
          <div className="w-40 h-1.5 bg-mainColor rounded-full" />

          {slotsRows.length === 0 ? (
            <div className="w-full bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
              <p className="text-xl font-black text-mainColor mb-2">
                لا يوجد أوقات متاحة حالياً
              </p>
              <p className="text-gray-500 dark:text-gray-300 mb-6">
                أضف أوقات متاحة ليبدأ المستخدمون بالحجز.
              </p>
              <Button
                onPress={addSlotModal.onOpen}
                className="bg-mainColor text-white rounded-full px-8 py-5 text-lg font-bold"
              >
                <FaPlus /> إضافة أول وقت
              </Button>
            </div>
          ) : (
            <GenericTable headers={slotsHeaders} data={slotsRows} />
          )}
        </div>

        {/* Appointments section */}
        <div className="mt-16 flex flex-col items-center gap-8">
          <h2 className="text-mainColor text-3xl md:text-4xl font-black">
            آخر الحجوزات
          </h2>
          <div className="w-40 h-1.5 bg-mainColor rounded-full" />

          {apptRows.length === 0 ? (
            <div className="w-full bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
              <p className="text-xl font-black text-mainColor mb-2">
                لا يوجد حجوزات حالياً
              </p>
              <p className="text-gray-500 dark:text-gray-300">
                عندما يقوم المستخدمون بالحجز ستظهر الطلبات هنا.
              </p>
            </div>
          ) : (
            <GenericTable headers={apptHeaders} data={apptRows} />
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      <DynamicFormModal
        isOpen={addSlotModal.isOpen}
        onClose={addSlotModal.onClose}
        title="إضافة وقت متاح للعيادة"
        fields={[
          { name: "date", placeholder: "التاريخ", type: "date" },
          { name: "time", placeholder: "الوقت", type: "time" },
          { name: "notes", placeholder: "ملاحظة (اختياري)" },
        ]}
        buttonText="إضافة"
        onSubmit={async (data) => {
          try {
            setError("");

            const date = data.date;
            const time = /^\d{2}:\d{2}$/.test(data.time)
              ? data.time
              : to24h(data.time);

            if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
              setError("اختر تاريخ صحيح");
              return;
            }

            if (!time || !/^\d{2}:\d{2}$/.test(time)) {
              setError("اختر وقت صحيح");
              return;
            }

            await api.createDoctorSlot({
              date,
              time,
              notes: data.notes || null,
            });

            const response = await api.doctorSlots();
            setSlots(response?.slots || []);

            addSlotModal.onClose();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إضافة الوقت");
          }
        }}
      />
    </div>
  );
}