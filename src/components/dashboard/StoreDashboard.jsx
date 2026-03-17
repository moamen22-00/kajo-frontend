import React, { useEffect, useMemo, useState } from "react";
import { Button, useDisclosure } from "@heroui/react";
import GenericTable from "../table/GenericTable";
import DynamicFormModal from "../modals/DynamicFormModal";
import { FaPlus, FaTrash, FaBoxOpen, FaCheck, FaTimes } from "react-icons/fa";
import { api } from "../../api/apiClient";

function translateStatus(status) {
  if (status === "pending") return "قيد المراجعة";
  if (status === "approved") return "تم القبول";
  if (status === "rejected") return "مرفوض";
  return status || "—";
}

export default function StoreDashboard() {
  const addProductModal = useDisclosure();

  const [dashboardData, setDashboardData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setFetching(true);
      setError("");

      const res = await api.getStoreDashboard();
      setDashboardData(res);
      setProducts(res?.products || []);
      setOrders(res?.orders || []);
    } catch (e) {
      console.error(e);
      setError(e?.data?.message || e?.message || "فشل تحميل لوحة المتجر");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const profile = dashboardData?.profile ?? null;
  const statistics = dashboardData?.statistics ?? {
    products: 0,
    active_products: 0,
    out_of_stock: 0,
    pending_orders: 0,
  };

  const productHeaders = [
    "اسم المنتج",
    "التصنيف",
    "الكمية",
    "سعر المستهلك",
    "سعر التكلفة",
    "تاريخ الصلاحية",
    "حذف",
  ];

  const productRows = useMemo(() => {
    return (products || []).map((product) => ({
      name: product.name,
      category: product.category || "—",
      quantity: product.quantity,
      userPrice: `${Number(product.user_price).toLocaleString()} ل.س`,
      storePrice: product.store_price
        ? `${Number(product.store_price).toLocaleString()} ل.س`
        : "—",
      expiry: product.expiry || "—",
      del: (
        <Button
          isIconOnly
          className="bg-transparent text-red-500 text-xl"
          onClick={async () => {
            try {
              setError("");
              await api.deleteStoreProduct(product.id);
              await loadAll();
            } catch (e) {
              setError(e?.data?.message || e?.message || "فشل حذف المنتج");
            }
          }}
        >
          <FaTrash />
        </Button>
      ),
    }));
  }, [products]);

  const orderHeaders = [
    "اسم الزبون",
    "البريد",
    "اسم المنتج",
    "الكمية",
    "الحالة",
    "تاريخ الطلب",
    "إجراء",
  ];

  const orderRows = useMemo(() => {
    return (orders || []).map((order) => ({
      customer: order.customer_name || "—",
      email: order.customer_email || "—",
      product: order.product_name || "—",
      quantity: order.quantity,
      status: translateStatus(order.status),
      createdAt: order.created_at || "—",
      action:
        order.status === "pending" ? (
          <div className="flex gap-2 justify-center">
            <Button
              className="bg-green-600 text-white"
              onClick={async () => {
                try {
                  setError("");
                  await api.updateStoreOrderStatus(order.id, "approved");
                  await loadAll();
                } catch (e) {
                  console.error(e);
                  setError(e?.data?.message || e?.message || "فشل قبول الطلب");
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
                  await api.updateStoreOrderStatus(order.id, "rejected");
                  await loadAll();
                } catch (e) {
                  console.error(e);
                  setError(e?.data?.message || e?.message || "فشل رفض الطلب");
                }
              }}
            >
              <FaTimes /> رفض
            </Button>
          </div>
        ) : (
          <span className="font-bold text-gray-500">تمت المعالجة</span>
        ),
    }));
  }, [orders]);

  return (
    <div
      className="w-full bg-white dark:bg-[#101828] font-serif pb-20 text-right px-6 transition-colors duration-500"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-16 pt-10">
        <div className="bg-[#FFF7E6] dark:bg-[#1E293B] rounded-3xl shadow-md p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-mainColor bg-white">
            <img
              src={profile?.avatar_url || "/placeholder.png"}
              alt="Store"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-mainColor mb-2">
              {profile?.name ? `لوحة المتجر - ${profile.name}` : "لوحة المتجر"}
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {profile?.specialty || "—"}
            </p>

            <p className="text-gray-600 dark:text-gray-300">
              {profile?.location || "لا يوجد عنوان"}
            </p>
          </div>

          <Button
            className="bg-mainColor text-white"
            onClick={loadAll}
            isDisabled={fetching}
          >
            {fetching ? "جاري التحديث..." : "تحديث"}
          </Button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-2xl font-bold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-mainColor text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">كل المنتجات</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.products ?? 0}
            </p>
          </div>

          <div className="bg-green-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">المنتجات النشطة</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.active_products ?? 0}
            </p>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">نفدت الكمية</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.out_of_stock ?? 0}
            </p>
          </div>

          <div className="bg-blue-600 text-white rounded-2xl p-6 text-center shadow">
            <h3 className="text-lg font-bold">طلبات بانتظارك</h3>
            <p className="text-3xl font-black mt-2">
              {statistics.pending_orders ?? 0}
            </p>
          </div>
        </div>

        <section className="flex flex-col items-center">
          <h2 className="text-sevenColor text-4xl font-black mb-10 italic">
            إدارة الطلبات
          </h2>

          {orderRows.length === 0 ? (
            <div className="w-full bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
              <p className="text-xl font-black text-mainColor mb-2">
                لا يوجد طلبات حالياً
              </p>
              <p className="text-gray-500 dark:text-gray-300">
                عند طلب الزبائن للمنتجات ستظهر الطلبات هنا.
              </p>
            </div>
          ) : (
            <GenericTable headers={orderHeaders} data={orderRows} />
          )}
        </section>

        <section className="flex flex-col items-center">
          <h2 className="text-sevenColor text-4xl font-black mb-10 italic">
            إدارة المنتجات والمخزن
          </h2>

          {productRows.length === 0 ? (
            <div className="w-full bg-white dark:bg-[#0B1220] border border-gray-200 dark:border-gray-700 rounded-2xl p-10 text-center">
              <FaBoxOpen className="mx-auto text-mainColor text-5xl mb-4" />
              <p className="text-xl font-black text-mainColor mb-2">
                لا يوجد منتجات حالياً
              </p>
              <p className="text-gray-500 dark:text-gray-300 mb-6">
                ابدأ بإضافة أول منتج لمتجرك.
              </p>
            </div>
          ) : (
            <GenericTable headers={productHeaders} data={productRows} />
          )}

          <div className="flex gap-4 mt-8">
            <Button
              onPress={addProductModal.onOpen}
              className="bg-mainColor text-white rounded-full px-10 py-6 text-xl font-black shadow-lg cursor-pointer"
            >
              إضافة منتج جديد <FaPlus />
            </Button>
          </div>
        </section>
      </div>

      <DynamicFormModal
        isOpen={addProductModal.isOpen}
        onClose={addProductModal.onClose}
        title="إضافة منتج للمتجر"
        fields={[
          { name: "name", placeholder: "اسم المنتج" },
          { name: "category", placeholder: "التصنيف" },
          { name: "user_price", placeholder: "سعر المنتج للمستهلك" },
          { name: "store_price", placeholder: "سعر التكلفة" },
          { name: "quantity", placeholder: "الكمية" },
          { name: "expiry", placeholder: "تاريخ الصلاحية", type: "date" },
          { name: "description", placeholder: "وصف المنتج" },
          {
            name: "image",
            placeholder: "صورة المنتج",
            type: "file",
            accept: "image/*",
          },
        ]}
        buttonText="تثبيت المنتج في المتجر"
        onSubmit={async (data) => {
          try {
            setError("");

            const fd = new FormData();
            fd.append("name", data.name || "");
            fd.append("category", data.category || "");
            fd.append("user_price", data.user_price || 0);
            fd.append("store_price", data.store_price || 0);
            fd.append("quantity", data.quantity || 0);
            fd.append("expiry", data.expiry || "");
            fd.append("description", data.description || "");

            if (data.image && data.image[0]) {
              fd.append("image", data.image[0]);
            }

            await api.createStoreProduct(fd);
            addProductModal.onClose();
            await loadAll();
          } catch (e) {
            console.error(e);
            setError(e?.data?.message || e?.message || "فشل إضافة المنتج");
          }
        }}
      />
    </div>
  );
}