import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useParams } from "react-router-dom";
import cat3 from "../../assets/cat3.svg";
import ActionMenu from "../../components/ActionMenu/ActionMenu";
import fallbackProduct from "../../assets/product1.svg";
import DynamicFormModal from "../../components/modals/DynamicFormModal";
import { api } from "../../api/apiClient";

export default function StoreDetails() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadStore = async () => {
    try {
      setLoading(true);
      setError("");

      const [storeRes, productsRes] = await Promise.all([
        api.storeDetails(id),
        api.storeProductsPublic(id),
      ]);

      setStore(storeRes?.store || null);
      setProducts(productsRes?.products || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل المتجر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, [id]);

  return (
    <div className="bg-white dark:bg-[#101828] min-h-screen font-serif text-right pb-20 px-6 relative overflow-hidden transition-colors duration-500" dir="rtl">
      <img
        src={cat3}
        alt="decoration"
        className="absolute -right-16 top-1/2 -translate-y-1/2 w-125 opacity-100 z-0 pointer-events-none"
      />

      <section className="py-20 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-mainColor text-5xl font-black mb-4 italic underline decoration-fourthColor">
            {store?.name || "منتجاتنا المتاحة"} 🛒
          </h2>
          {store?.specialty && (
            <p className="text-sevenColor text-2xl font-bold">{store.specialty}</p>
          )}
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-10 bg-red-100 text-red-700 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center text-mainColor font-black text-2xl">
            جاري تحميل المنتجات...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 items-stretch">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-mainColor rounded-[45px] p-6 shadow-2xl flex flex-col items-center border-b-8 border-fourthColor"
              >
                <ActionMenu dotsColor="text-white" />

                <div className="w-full px-4 mb-4 min-h-18 flex items-center justify-center">
                  <h3 className="text-white font-black text-2xl text-center italic">
                    {product.name}
                  </h3>
                </div>

                <div className="bg-[#FFF4C7] rounded-[40px] p-4 shadow-inner w-full">
                  <div className="rounded-[30px] overflow-hidden shadow-lg h-100 md:h-64">
                    <img
                      src={product.image_url || fallbackProduct}
                      className="w-full h-full object-cover hover:scale-110 transition duration-500"
                      alt={product.name}
                      onError={(e) => {
                        e.currentTarget.src = fallbackProduct;
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 text-center w-full">
                  <p className="text-white font-bold text-lg">
                    الكمية المتوفرة: {product.quantity}
                  </p>
                </div>

                <div className="mt-auto pt-6 w-full text-center">
                  <p className="text-fourthColor text-3xl font-black mb-4 italic">
                    {Number(product.user_price).toLocaleString()} ل.س
                  </p>
                  <Button
                    className="w-full bg-fourthColor text-mainColor font-black rounded-3xl py-7 text-xl shadow-lg hover:bg-white transition cursor-pointer"
                    isDisabled={Number(product.quantity) <= 0}
                    onPress={() => {
                      setSelectedProduct(product);
                      setIsModalOpen(true);
                    }}
                  >
                    {Number(product.quantity) > 0 ? "اطلب الآن" : "غير متوفر"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center text-mainColor font-black text-2xl mt-10">
            لا توجد منتجات حالياً
          </div>
        )}
      </section>

      <DynamicFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(null);
        }}
        title={`طلب المنتج: ${selectedProduct?.name || ""}`}
        fields={[
          { name: "quantity", placeholder: "الكمية المطلوبة" },
          { name: "notes", placeholder: "ملاحظات الطلب (اختياري)" },
        ]}
        buttonText="إرسال الطلب"
        onSubmit={async (data) => {
          try {
            setError("");

            if (!selectedProduct?.id) {
              setError("المنتج غير صالح");
              return;
            }

            await api.createStoreOrder(selectedProduct.id, {
              quantity: Number(data.quantity || 1),
              notes: data.notes || null,
            });

            setIsModalOpen(false);
            setSelectedProduct(null);
            await loadStore();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إرسال الطلب");
          }
        }}
      />
    </div>
  );
}