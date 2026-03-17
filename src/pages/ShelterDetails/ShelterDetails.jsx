import React, { useEffect, useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import DynamicFormModal from "../../components/modals/DynamicFormModal";
import GenericTable from "../../components/table/GenericTable";
import { useParams } from "react-router-dom";
import { api } from "../../api/apiClient";
import fallbackAnimal from "../../assets/cat2.svg";

export default function ShelterDetails() {
  const { id } = useParams();
  const adoptModal = useDisclosure();
  const donateModal = useDisclosure();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedDonationRequest, setSelectedDonationRequest] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [shelterRes, animalsRes, donationsRes] = await Promise.all([
        api.shelterDetails(id),
        api.shelterAnimalsPublic(id),
        api.shelterDonationRequestsPublic(id),
      ]);

      setShelter(shelterRes?.shelter || null);
      setAnimals(animalsRes?.animals || []);
      setDonationRequests(donationsRes?.donation_requests || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل بيانات الملجأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const donateHeaders = ["المستلزم", "الأولوية", "الكمية", "التاريخ", "تبرع"];

  const donateData = donationRequests.map((item) => ({
    item: item.item || "—",
    priority: item.priority || "—",
    quantity: item.quantity || "—",
    date: item.date || "—",
    action: (
      <Button
        color="success"
        className="rounded-full font-bold text-white cursor-pointer"
        onPress={() => {
          setSelectedDonationRequest(item);
          donateModal.onOpen();
        }}
      >
        تبرع الآن
      </Button>
    ),
  }));

  return (
    <div
      className="bg-white dark:bg-[#101828] min-h-screen font-serif text-right pb-20 transition-colors duration-500"
      dir="rtl"
    >
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-mainColor text-5xl font-black mb-4 italic">
            {shelter?.name || "الملجأ"} 🐾
          </h2>
          {shelter?.location && (
            <p className="text-sevenColor text-xl font-bold">{shelter.location}</p>
          )}
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-mainColor text-2xl font-black">
            جاري التحميل...
          </div>
        ) : (
          <>
            <h3 className="text-mainColor text-4xl font-black text-center mb-12 italic">
              أصدقاؤنا بانتظاركم 🐾
            </h3>

            {animals.length === 0 ? (
              <div className="text-center text-mainColor text-2xl font-black mb-16">
                لا توجد حيوانات متاحة حالياً
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    className="bg-mainColor rounded-[45px] p-6 shadow-2xl flex flex-col items-center"
                  >
                    <div className="w-full px-4 mb-4 min-h-20 flex items-center justify-center">
                      <h3 className="text-white font-black text-3xl text-center italic leading-tight">
                        {animal.name}
                      </h3>
                    </div>

                    <div className="bg-[#FFF4C7] rounded-[40px] p-4 shadow-inner w-full">
                      <div className="rounded-[30px] overflow-hidden shadow-lg h-80">
                        <img
                          src={animal.image_url || fallbackAnimal}
                          className="w-full h-full object-cover"
                          alt={animal.name}
                          onError={(e) => {
                            e.currentTarget.src = fallbackAnimal;
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-full mt-6 text-white font-bold space-y-2 text-lg">
                      <p>النوع: {animal.type || "—"}</p>
                      <p>العمر: {animal.age || "—"}</p>
                      <p>الحالة الصحية: {animal.health_status || "—"}</p>
                      <p>الجنس: {animal.gender || "—"}</p>
                      <p>اللقاحات: {animal.vaccines || "—"}</p>
                      <p>ملاحظة: {animal.note || "—"}</p>
                    </div>

                    <div className="mt-auto pt-8 w-full px-4">
                      <Button
                        onPress={() => {
                          setSelectedAnimal(animal);
                          adoptModal.onOpen();
                        }}
                        className="w-full bg-fourthColor text-mainColor font-black rounded-3xl py-8 text-xl shadow-lg hover:scale-105 transition border-4 border-white cursor-pointer"
                      >
                        طلب تبني {animal.name}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section className="py-20 bg-[#FFF4C7]/20 border-t-4 border-dashed border-mainColor/10 mt-20 rounded-3xl">
              <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
                <h2 className="text-sevenColor text-5xl font-black mb-12 italic">
                  احتياجاتنا الحالية
                </h2>

                {donateData.length === 0 ? (
                  <div className="text-center text-mainColor text-2xl font-black">
                    لا توجد طلبات تبرع حالياً
                  </div>
                ) : (
                  <GenericTable headers={donateHeaders} data={donateData} />
                )}
              </div>
            </section>
          </>
        )}
      </section>

      <DynamicFormModal
        isOpen={adoptModal.isOpen}
        onClose={() => {
          setSelectedAnimal(null);
          adoptModal.onClose();
        }}
        title={`طلب تبني ${selectedAnimal?.name || ""}`}
        fields={[
          { name: "phone", placeholder: "رقم الهاتف" },
          { name: "has_adopted_before", placeholder: "هل سبق لك التبني؟ (نعم/لا)" },
          { name: "delivery_date", placeholder: "تاريخ التسليم", type: "date" },
          { name: "note", placeholder: "ملاحظة" },
        ]}
        buttonText="إرسال طلب التبني"
        onSubmit={async (data) => {
          try {
            setError("");

            if (!selectedAnimal?.id) {
              setError("الحيوان غير صالح");
              return;
            }

            await api.createShelterAdoptionRequest(selectedAnimal.id, {
              phone: data.phone || "",
              has_adopted_before:
                String(data.has_adopted_before || "").trim() === "نعم",
              delivery_date: data.delivery_date || null,
              note: data.note || null,
            });

            adoptModal.onClose();
            setSelectedAnimal(null);
            await loadData();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إرسال طلب التبني");
          }
        }}
      />

      <DynamicFormModal
        isOpen={donateModal.isOpen}
        onClose={() => {
          setSelectedDonationRequest(null);
          donateModal.onClose();
        }}
        title={`التبرع لـ ${selectedDonationRequest?.item || ""}`}
        fields={[
          { name: "donor_name", placeholder: "اسم المتبرع" },
          { name: "phone", placeholder: "رقم الهاتف" },
          { name: "donation_type", placeholder: "نوع التبرع (نقدي / عيني)" },
          { name: "amount_or_item", placeholder: "المبلغ أو نوع المستلزم" },
          { name: "note", placeholder: "ملاحظة" },
        ]}
        buttonText="إرسال طلب التبرع"
        onSubmit={async (data) => {
          try {
            setError("");

            if (!selectedDonationRequest?.id) {
              setError("طلب التبرع غير صالح");
              return;
            }

            await api.createShelterDonationSubmission(selectedDonationRequest.id, {
              donor_name: data.donor_name || "",
              phone: data.phone || "",
              donation_type: data.donation_type || "",
              amount_or_item: data.amount_or_item || "",
              note: data.note || "",
            });

            donateModal.onClose();
            setSelectedDonationRequest(null);
            await loadData();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إرسال طلب التبرع");
          }
        }}
      />
    </div>
  );
}