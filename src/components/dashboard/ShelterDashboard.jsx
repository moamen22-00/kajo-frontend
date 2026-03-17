import React, { useEffect, useMemo, useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import GenericTable from "../table/GenericTable";
import DynamicFormModal from "../modals/DynamicFormModal";
import { FaEdit, FaPlus, FaTrash, FaCheck, FaTimes } from "react-icons/fa";
import { api } from "../../api/apiClient";
import img5 from "../../assets/cat2.svg";

function translateStatus(status) {
  if (status === "pending") return "قيد الدراسة";
  if (status === "approved") return "تم القبول";
  if (status === "rejected") return "مرفوض";
  return status || "—";
}

export default function ShelterDashboard() {
  const animalModal = useDisclosure();
  const donationModal = useDisclosure();
  const editAdoptionModal = useDisclosure();

  const [dashboardData, setDashboardData] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [donationSubmissions, setDonationSubmissions] = useState([]);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await api.getShelterDashboard();
      setDashboardData(res);
      setAnimals(res?.animals || []);
      setAdoptions(res?.adoptions || []);
      setDonationRequests(res?.donation_requests || []);
      setDonationSubmissions(res?.donation_submissions || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل لوحة الملجأ");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const profile = dashboardData?.profile ?? null;
  const statistics = dashboardData?.statistics ?? {
    animals: 0,
    pending_adoptions: 0,
    donation_requests: 0,
    pending_donations: 0,
  };

  const animalHeaders = ["الاسم", "النوع", "العمر", "الحالة الصحية", "الجنس", "اللقاحات", "ملاحظة"];
  const animalData = useMemo(
    () =>
      animals.map((animal) => ({
        name: animal.name || "—",
        type: animal.type || "—",
        age: animal.age || "—",
        healthStatus: animal.health_status || "—",
        gender: animal.gender || "—",
        vaccines: animal.vaccines || "—",
        note: animal.note || "—",
      })),
    [animals]
  );

  const adoptionHeaders = [
    "اسم المتبني",
    "الحيوان",
    "رقم المتبني",
    "هل سبق له التبني",
    "حالة التبني",
    "تاريخ التسليم",
    "ملاحظة",
    "تعديل",
  ];

  const adoptionData = useMemo(
    () =>
      adoptions.map((item) => ({
        name: item.customer_name || "—",
        animal: item.animal_name || "—",
        adopterPhone: item.phone || "—",
        hasAdoptedBefore: item.has_adopted_before ? "نعم" : "لا",
        status: translateStatus(item.status),
        deliveryDate: item.delivery_date || "—",
        note: item.note || "—",
        edit:
          item.status === "pending" ? (
            <Button
              isIconOnly
              onPress={() => {
                setSelectedAdoption(item);
                editAdoptionModal.onOpen();
              }}
              className="bg-transparent text-mainColor text-2xl hover:scale-110 transition cursor-pointer"
            >
              <FaEdit />
            </Button>
          ) : (
            <span className="text-gray-500 font-bold">تمت المعالجة</span>
          ),
      })),
    [adoptions, editAdoptionModal]
  );

  const donationHeaders = ["المستلزم", "الأولوية", "الكمية", "التاريخ", "حالة الطلب", "حذف"];
  const donationData = useMemo(
    () =>
      donationRequests.map((item) => ({
        item: item.item || "—",
        priority: item.priority || "—",
        quantity: item.quantity || "—",
        date: item.date || "—",
        status: item.status || "—",
        del: (
          <Button
            isIconOnly
            className="bg-transparent text-red-500 text-xl"
            onClick={async () => {
              try {
                setError("");
                await api.deleteShelterDonationRequest(item.id);
                await loadAll();
              } catch (e) {
                console.error(e);
                setError(e?.data?.message || e?.message || "فشل حذف طلب التبرع");
              }
            }}
          >
            <FaTrash />
          </Button>
        ),
      })),
    [donationRequests]
  );

  const donationSubmissionHeaders = [
    "اسم المتبرع",
    "البريد",
    "المستلزم",
    "الهاتف",
    "نوع التبرع",
    "المبلغ / المستلزم",
    "الحالة",
    "إجراء",
  ];

  const donationSubmissionData = useMemo(
    () =>
      donationSubmissions.map((item) => ({
        donor: item.customer_name || item.donor_name || "—",
        email: item.customer_email || "—",
        requestItem: item.request_item || "—",
        phone: item.phone || "—",
        type: item.donation_type || "—",
        amount: item.amount_or_item || "—",
        status: translateStatus(item.status),
        action:
          item.status === "pending" ? (
            <div className="flex gap-2 justify-center">
              <Button
                className="bg-green-600 text-white"
                onClick={async () => {
                  try {
                    setError("");
                    await api.updateShelterDonationSubmissionStatus(item.id, "approved");
                    await loadAll();
                  } catch (e) {
                    console.error(e);
                    setError(e?.data?.message || e?.message || "فشل قبول التبرع");
                  }
                }}
              >
                <FaCheck /> قبول
              </Button>

              <Button
                className="bg-red-600 text-white"
                onClick={async () => {
                  try {
                    setError("");
                    await api.updateShelterDonationSubmissionStatus(item.id, "rejected");
                    await loadAll();
                  } catch (e) {
                    console.error(e);
                    setError(e?.data?.message || e?.message || "فشل رفض التبرع");
                  }
                }}
              >
                <FaTimes /> رفض
              </Button>
            </div>
          ) : (
            <span className="text-gray-500 font-bold">تمت المعالجة</span>
          ),
      })),
    [donationSubmissions]
  );

  return (
    <div
      className="w-full bg-white dark:bg-[#101828] font-serif pb-20 text-right px-6 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-24 pt-10">
        <section className="relative flex flex-col items-center pt-10 pb-10 px-4">
          <div className="text-center z-20 mb-10 md:mb-0">
            <p className="text-mainColor dark:text-fourthColor text-xl font-medium">
              أهلاً وسهلاً بك
            </p>
            <h1 className="text-mainColor dark:text-white text-xl md:text-2xl mt-2 leading-relaxed">
              مع كاجو ستكون قادرًا على إدارة ملجئك بسهولة واحترافية
            </h1>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-40 w-full max-w-6xl mt-10">
            <div className="bg-mainColor dark:bg-fourthColor order-2 p-8 rounded-[40px] text-sixColor dark:text-mainColor w-72 min-h-48 flex flex-col justify-center items-center shadow-lg relative z-20 md:-mr-16 text-center">
              <h2 className="text-3xl font-black mb-2 leading-tight">
                {profile?.name || "الملجأ"}
              </h2>
              <p className="text-sm opacity-90">{profile?.location || "—"}</p>
              <div className="flex gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFF1C1] dark:text-mainColor">★</span>
                ))}
              </div>
            </div>
            <img src={img5} alt="Cat" className="w-112.5 md:w-137.5 z-10 order-1 drop-shadow-2xl" />
          </div>
        </section>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-mainColor text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">الحيوانات</h3>
            <p className="text-3xl font-black mt-2">{statistics.animals ?? 0}</p>
          </div>

          <div className="bg-green-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">طلبات تبني بانتظارك</h3>
            <p className="text-3xl font-black mt-2">{statistics.pending_adoptions ?? 0}</p>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">طلبات التبرع المنشورة</h3>
            <p className="text-3xl font-black mt-2">{statistics.donation_requests ?? 0}</p>
          </div>

          <div className="bg-blue-600 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">تبرعات بانتظارك</h3>
            <p className="text-3xl font-black mt-2">{statistics.pending_donations ?? 0}</p>
          </div>
        </div>

        <section className="flex flex-col items-center">
          <h2 className="text-mainColor dark:text-fourthColor text-4xl font-black mb-10 italic">
            الحيوانات المتاحة للتبني
          </h2>
          <div className="w-full rounded-[30px] overflow-hidden shadow-2xl">
            <GenericTable headers={animalHeaders} data={animalData} />
          </div>

          <Button
            onPress={animalModal.onOpen}
            className="bg-mainColor text-white rounded-full px-12 py-6 text-xl font-black mt-10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            إضافة حيوان جديد +
          </Button>
        </section>

        <section className="flex flex-col items-center">
          <h2 className="text-sevenColor dark:text-fourthColor text-4xl font-black mb-10 italic">
            طلبات التبني والتحكم بالحالات
          </h2>
          <div className="w-full rounded-[30px] overflow-hidden shadow-2xl">
            <GenericTable headers={adoptionHeaders} data={adoptionData} />
          </div>
        </section>

        <section className="flex flex-col items-center">
          <h2 className="text-mainColor dark:text-fourthColor text-4xl font-black mb-10 italic">
            طلبات التبرع المعروضة
          </h2>
          <div className="w-full rounded-[30px] overflow-hidden shadow-2xl">
            <GenericTable headers={donationHeaders} data={donationData} />
          </div>

          <Button
            onPress={donationModal.onOpen}
            className="bg-mainColor dark:bg-fourthColor text-white dark:text-mainColor rounded-full px-12 py-6 text-xl font-black mt-10 shadow-lg cursor-pointer hover:scale-105 transition-transform"
          >
            إضافة طلب تبرع جديد +
          </Button>
        </section>

        <section className="flex flex-col items-center">
          <h2 className="text-sevenColor dark:text-fourthColor text-4xl font-black mb-10 italic">
            طلبات التبرع الواردة
          </h2>
          <div className="w-full rounded-[30px] overflow-hidden shadow-2xl">
            <GenericTable headers={donationSubmissionHeaders} data={donationSubmissionData} />
          </div>
        </section>
      </div>

      <DynamicFormModal
        isOpen={animalModal.isOpen}
        onClose={animalModal.onClose}
        title="إضافة حيوان للملجأ"
        fields={[
          { name: "name", placeholder: "اسم الحيوان" },
          { name: "type", placeholder: "نوع الحيوان" },
          { name: "age", placeholder: "عمر الحيوان" },
          { name: "health_status", placeholder: "الحالة الصحية" },
          { name: "gender", placeholder: "الجنس" },
          { name: "vaccines", placeholder: "اللقاحات" },
          { name: "note", placeholder: "ملاحظة" },
          { name: "image", placeholder: "صورة الحيوان", type: "file", accept: "image/*" },
        ]}
        buttonText="إضافة الحيوان"
        onSubmit={async (data) => {
          try {
            setError("");

            const fd = new FormData();
            fd.append("name", data.name || "");
            fd.append("type", data.type || "");
            fd.append("age", data.age || "");
            fd.append("health_status", data.health_status || "");
            fd.append("gender", data.gender || "");
            fd.append("vaccines", data.vaccines || "");
            fd.append("note", data.note || "");

            if (data.image && data.image[0]) {
              fd.append("image", data.image[0]);
            }

            await api.createShelterAnimal(fd);
            animalModal.onClose();
            await loadAll();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إضافة الحيوان");
          }
        }}
      />

      <DynamicFormModal
        isOpen={donationModal.isOpen}
        onClose={donationModal.onClose}
        title="إضافة طلب تبرع"
        fields={[
          { name: "item", placeholder: "اسم المستلزم" },
          { name: "priority", placeholder: "الأولوية" },
          { name: "quantity", placeholder: "الكمية" },
          { name: "date", placeholder: "التاريخ", type: "date" },
          { name: "status", placeholder: "حالة الطلب" },
        ]}
        buttonText="نشر الطلب"
        onSubmit={async (data) => {
          try {
            setError("");

            await api.createShelterDonationRequest({
              item: data.item || "",
              priority: data.priority || "",
              quantity: data.quantity || "",
              date: data.date || null,
              status: data.status || "active",
            });

            donationModal.onClose();
            await loadAll();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إضافة طلب التبرع");
          }
        }}
      />

      <DynamicFormModal
        isOpen={editAdoptionModal.isOpen}
        onClose={() => {
          setSelectedAdoption(null);
          editAdoptionModal.onClose();
        }}
        title="تحديث حالة التبني"
        fields={[
          { name: "status", placeholder: "approved أو rejected" },
        ]}
        buttonText="تحديث"
        onSubmit={async (data) => {
          try {
            setError("");

            if (!selectedAdoption?.id) {
              setError("طلب التبني غير صالح");
              return;
            }

            await api.updateShelterAdoptionRequestStatus(
              selectedAdoption.id,
              String(data.status || "").trim()
            );

            setSelectedAdoption(null);
            editAdoptionModal.onClose();
            await loadAll();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل تحديث حالة التبني");
          }
        }}
      />
    </div>
  );
}