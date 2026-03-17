import React, { useEffect, useMemo, useState } from "react";
import imgSharlok from "../../assets/sharlok.svg";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
  useDisclosure,
} from "@heroui/react";
import { api } from "../../api/apiClient";

export default function UsersRequests() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("pending");
  const [items, setItems] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  const statusOptions = useMemo(
    () => [
      { label: "قيد المراجعة", value: "pending" },
      { label: "مقبولة", value: "approved" },
      { label: "مرفوضة", value: "rejected" },
    ],
    []
  );

  const roleLabel = (role) => {
    switch (role) {
      case "doctor":
        return "طبيب بيطري";
      case "shop_owner":
        return "صاحب متجر";
      case "shelter_owner":
        return "صاحب ملجأ";
      default:
        return role || "-";
    }
  };

  const statusLabel = (st) => {
    switch (st) {
      case "pending":
        return "قيد المراجعة ⏳";
      case "approved":
        return "مقبول ✅";
      case "rejected":
        return "مرفوض ❌";
      default:
        return st || "-";
    }
  };

  const fetchData = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.adminJoinRequests(statusFilter);
      setItems(res?.data || []);
    } catch (e) {
      const msg = e?.data?.message || e?.message || "تعذر جلب الطلبات";
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openDetails = (req) => {
    setSelectedReq(req);
    onOpen();
  };

  const approve = async (id) => {
    setError("");
    setActionLoadingId(id);
    try {
      await api.adminApproveJoinRequest(id);
      // تحديث سريع: شيل العنصر من القائمة الحالية (لأنه لم يعد pending)
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (selectedReq?.id === id) onClose();
    } catch (e) {
      const msg = e?.data?.message || e?.message || "فشل قبول الطلب";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const reject = async (id) => {
    setError("");
    setActionLoadingId(id);
    try {
      await api.adminRejectJoinRequest(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (selectedReq?.id === id) onClose();
    } catch (e) {
      const msg = e?.data?.message || e?.message || "فشل رفض الطلب";
      setError(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <section
      className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500"
      dir="rtl"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-10 items-center">
          {/* جهة الصورة */}
          <div className="flex justify-center max-w-3xl md:max-w-2xl">
            <img src={imgSharlok} alt="Sharlok" className="w-full" />
          </div>

          {/* جهة الطلبات */}
          <div className="flex flex-col items-center w-full">
            <h1 className="text-mainColor text-[32px] md:text-[48px] font-black mb-5">
              طلبات الانضمام
            </h1>

            {/* فلتر + تحديث */}
            <div className="w-full max-w-125 flex gap-3 items-center mb-5 flex-wrap">
              <Select
                label="فلترة حسب الحالة"
                selectedKeys={[statusFilter]}
                onSelectionChange={(keys) => setStatusFilter([...keys][0])}
                className="min-w-[220px]"
                classNames={{
                  trigger:
                    "rounded-full h-14 px-6 bg-mainColor hover:bg-mainColor/90 text-white",
                  label: "text-white font-black",
                  value: "text-white font-black",
                  popoverContent: "bg-mainColor border-none",
                  listbox: "bg-mainColor",
                }}
              >
                {statusOptions.map((o) => (
                  <SelectItem
                    key={o.value}
                    className="text-white hover:bg-TertiaryColor"
                  >
                    {o.label}
                  </SelectItem>
                ))}
              </Select>

              <Button
                className="bg-fourthColor text-mainColor font-black rounded-full px-8 h-14"
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? "..." : "تحديث"}
              </Button>
            </div>

            {error && (
              <div className="w-full max-w-125 mb-4 bg-red-50 text-red-600 p-3 rounded-2xl">
                {error}
              </div>
            )}

            <div className="w-full max-w-125 flex flex-col gap-5">
              {loading ? (
                <div className="text-center text-gray-500">
                  جاري التحميل...
                </div>
              ) : items.length === 0 ? (
                <div className="text-center text-gray-500">
                  لا توجد طلبات ضمن هذا الفلتر.
                </div>
              ) : (
                items.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => openDetails(req)}
                    className="bg-mainColor hover:bg-mainColor/90 text-white rounded-[30px] p-5 shadow-xl cursor-pointer transition-all border-r-8 border-fourthColor"
                  >
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <p className="text-xl font-black">
                          {req.user?.name || "مستخدم"}
                        </p>
                        <p className="text-sm opacity-80 italic">
                          {roleLabel(req.requested_role)}
                        </p>
                        <p className="text-xs opacity-80 mt-1">
                          {statusLabel(req.status)}
                        </p>
                      </div>

                      {req.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-fourthColor text-mainColor font-black rounded-full px-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              approve(req.id);
                            }}
                            disabled={actionLoadingId === req.id}
                          >
                            {actionLoadingId === req.id ? "..." : "قبول"}
                          </Button>

                          <Button
                            size="sm"
                            className="bg-white text-red-500 font-black rounded-full px-5"
                            onClick={(e) => {
                              e.stopPropagation();
                              reject(req.id);
                            }}
                            disabled={actionLoadingId === req.id}
                          >
                            {actionLoadingId === req.id ? "..." : "رفض"}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-xs opacity-80">
                          تم اتخاذ قرار
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* مودال التفاصيل */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
      >
        <ModalContent className="rounded-[40px] p-4">
          <ModalHeader className="flex flex-col gap-1 text-mainColor text-3xl font-black text-center">
            تفاصيل مرسل الطلب
          </ModalHeader>

          <ModalBody className="pb-8 text-right font-serif" dir="rtl">
            {selectedReq && (
              <div className="space-y-4 text-xl">
                <div className="bg-mainColor/10 p-4 rounded-2xl border-r-4 border-mainColor">
                  <p className="text-sixColor leading-loose">
                    <span className="text-mainColor font-black">الاسم:</span>{" "}
                    {selectedReq.user?.name || "-"}
                    <br />
                    <span className="text-mainColor font-black">البريد:</span>{" "}
                    {selectedReq.user?.email || "-"}
                    <br />
                    <span className="text-mainColor font-black">
                      نوع النشاط:
                    </span>{" "}
                    {roleLabel(selectedReq.requested_role)}
                    <br />
                    <span className="text-mainColor font-black">الحالة:</span>{" "}
                    {statusLabel(selectedReq.status)}
                    <br />
                    <span className="text-mainColor font-black">التاريخ:</span>{" "}
                    {selectedReq.created_at
                      ? new Date(selectedReq.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>

                {selectedReq.status === "pending" && (
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      className="bg-fourthColor text-mainColor font-black rounded-full px-10"
                      onClick={() => approve(selectedReq.id)}
                      disabled={actionLoadingId === selectedReq.id}
                    >
                      {actionLoadingId === selectedReq.id ? "..." : "قبول"}
                    </Button>

                    <Button
                      className="bg-white text-red-500 font-black rounded-full px-10"
                      onClick={() => reject(selectedReq.id)}
                      disabled={actionLoadingId === selectedReq.id}
                    >
                      {actionLoadingId === selectedReq.id ? "..." : "رفض"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
}
