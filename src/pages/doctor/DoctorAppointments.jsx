import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "@heroui/react";
import { api } from "../../api/apiClient";

function translateStatus(status) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "تم التأكيد";
  if (status === "rejected") return "مرفوض";
  return status || "—";
}

function statusClasses(status) {
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "approved") return "bg-green-100 text-green-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadAppointments = async (status = "") => {
    try {
      setLoading(true);
      setError("");

      const res = await api.doctorAppointments(status || undefined);
      const data = res?.appointments || res?.data?.appointments || [];

      setAppointments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل الحجوزات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments(statusFilter);
  }, [statusFilter]);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      setActionLoadingId(appointmentId);
      setError("");

      await api.updateAppointmentStatus(appointmentId, status);
      await loadAppointments(statusFilter);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحديث حالة الحجز");
    } finally {
      setActionLoadingId(null);
    }
  };

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      approved: appointments.filter((a) => a.status === "approved").length,
      rejected: appointments.filter((a) => a.status === "rejected").length,
    };
  }, [appointments]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center bg-[#F9FAFB] dark:bg-[#101828]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F9FAFB] dark:bg-[#101828] px-4 py-10"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-mainColor text-4xl md:text-5xl font-black mb-3">
            حجوزات المرضى
          </h1>
          <p className="text-gray-500 dark:text-gray-300 text-lg">
            راجع الطلبات وقم بتأكيدها أو رفضها
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-[#0B1220] rounded-3xl p-5 shadow border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-300 mb-2">الكل</p>
            <p className="text-3xl font-black text-mainColor">{counts.all}</p>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-3xl p-5 shadow border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-300 mb-2">قيد المراجعة</p>
            <p className="text-3xl font-black text-yellow-600">{counts.pending}</p>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-3xl p-5 shadow border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-300 mb-2">مؤكدة</p>
            <p className="text-3xl font-black text-green-600">{counts.approved}</p>
          </div>

          <div className="bg-white dark:bg-[#0B1220] rounded-3xl p-5 shadow border border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-300 mb-2">مرفوضة</p>
            <p className="text-3xl font-black text-red-600">{counts.rejected}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button
            onClick={() => setStatusFilter("")}
            className={`px-5 py-2 rounded-full font-bold transition ${
              statusFilter === ""
                ? "bg-mainColor text-white"
                : "bg-white dark:bg-[#0B1220] text-mainColor border border-gray-200 dark:border-gray-700"
            }`}
          >
            الكل
          </button>

          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-5 py-2 rounded-full font-bold transition ${
              statusFilter === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-white dark:bg-[#0B1220] text-yellow-600 border border-gray-200 dark:border-gray-700"
            }`}
          >
            قيد المراجعة
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-5 py-2 rounded-full font-bold transition ${
              statusFilter === "approved"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-[#0B1220] text-green-600 border border-gray-200 dark:border-gray-700"
            }`}
          >
            المؤكدة
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-5 py-2 rounded-full font-bold transition ${
              statusFilter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-[#0B1220] text-red-600 border border-gray-200 dark:border-gray-700"
            }`}
          >
            المرفوضة
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1220] rounded-[30px] p-10 text-center shadow border border-gray-100 dark:border-gray-800">
            <p className="text-mainColor text-2xl font-black mb-2">
              لا توجد حجوزات حالياً
            </p>
            <p className="text-gray-500 dark:text-gray-300">
              ستظهر هنا طلبات المرضى عند الحجز
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white dark:bg-[#0B1220] rounded-[30px] p-6 shadow border border-gray-100 dark:border-gray-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      اسم المستخدم
                    </p>
                    <p className="font-black text-lg text-mainColor">
                      {appointment.owner_name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      البريد الإلكتروني
                    </p>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {appointment.owner_email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      نوع الحيوان
                    </p>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {appointment.animal_type || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      الحالة
                    </p>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusClasses(
                        appointment.status
                      )}`}
                    >
                      {translateStatus(appointment.status)}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      التاريخ
                    </p>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {appointment.date || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      الوقت
                    </p>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {appointment.time || "—"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-gray-500 dark:text-gray-300 text-sm mb-1">
                      الملاحظات
                    </p>
                    <p className="font-bold text-gray-700 dark:text-gray-200">
                      {appointment.notes || "لا توجد ملاحظات"}
                    </p>
                  </div>
                </div>

                {appointment.status === "pending" && (
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "approved")
                      }
                      disabled={actionLoadingId === appointment.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-full font-bold hover:opacity-90 disabled:opacity-60"
                    >
                      {actionLoadingId === appointment.id
                        ? "جارٍ المعالجة..."
                        : "تأكيد"}
                    </button>

                    <button
                      onClick={() =>
                        handleUpdateStatus(appointment.id, "rejected")
                      }
                      disabled={actionLoadingId === appointment.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-full font-bold hover:opacity-90 disabled:opacity-60"
                    >
                      {actionLoadingId === appointment.id
                        ? "جارٍ المعالجة..."
                        : "رفض"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}