import { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/apiClient";
import waitingBg from "../../assets/waiting.svg";
import { useAuth } from "../../context/AuthContext";

export default function WaitingApproval() {
  const navigate = useNavigate();
  const { user, refreshMe, continueAfterApproval } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState("");

  const fetchRequest = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const res = await api.joinRequestMe();
      setRequest(res.request);
    } catch (e) {
      console.error(e);
      const msg =
        e?.data?.message ||
        e?.message ||
        "تعذر التحقق من حالة الطلب، حاول مرة أخرى.";
      setError(msg);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStatus = () => {
    switch (request?.status) {
      case "pending":
        return "طلبك قيد المراجعة من قبل الإدارة ⏳";
      case "approved":
        return "تمت الموافقة على طلبك ✅";
      case "rejected":
        return "تم رفض الطلب ❌";
      default:
        return request?.status || "";
    }
  };

  const renderRole = () => {
    switch (request?.requested_role) {
      case "doctor":
        return "طبيب بيطري";
      case "shop_owner":
        return "صاحب متجر";
      case "shelter_owner":
        return "صاحب ملجأ";
      default:
        return request?.requested_role || "";
    }
  };

  const isApproved = request?.status === "approved";
  const isRejected = request?.status === "rejected";

  // ✅ زر متابعة بالدور الجديد (لا يعمل loop)
  const handleContinueNewRole = async () => {
    try {
      setError("");

      // 1) حدّث بيانات المستخدم من السيرفر
      // إذا عندك continueAfterApproval جاهز استخدمه
      if (typeof continueAfterApproval === "function") {
        const path = await continueAfterApproval();
        navigate(path, { replace: true });
        return;
      }

      // 2) fallback إذا ما عندك continueAfterApproval
      const me = await refreshMe();
      const u = me || user;

      const role = Number(u?.role);
      const hasSetup = !!(u?.hasSetup ?? u?.has_setup);

      if (role === 1) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (role === 5) {
        navigate(hasSetup ? "/app/dashboard" : "/app/setup", { replace: true });
        return;
      }

      navigate("/app/feed", { replace: true });
    } catch (e) {
      console.error(e);
      setError("تعذر تحديث بيانات الحساب. اضغط تحديث الحالة ثم حاول مرة أخرى.");
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-4 overflow-hidden bg-white dark:bg-[#101828] transition-colors duration-500">
      <img
        src={waitingBg}
        alt="waiting background"
        className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20" />

      <div className="relative z-10 w-full max-w-md">
        {loading ? (
          <div className="text-center bg-white/80 dark:bg-[#101828]/80 rounded-2xl shadow-md p-8">
            <p className="text-lg font-bold text-mainColor">جاري التحقق من الطلب...</p>
            <p className="text-gray-500 mt-2">يرجى الانتظار قليلاً</p>
          </div>
        ) : error ? (
          <div className="text-center bg-white/80 dark:bg-[#101828]/80 rounded-2xl shadow-md p-8">
            <h1 className="text-2xl font-bold mb-2 text-mainColor">حدث خطأ</h1>
            <p className="text-red-500 mb-6">{error}</p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-mainColor text-white" onClick={() => fetchRequest(true)} disabled={refreshing}>
                {refreshing ? "جاري التحديث..." : "إعادة المحاولة"}
              </Button>

              <Button className="bg-[#FFF1C1] text-mainColor" onClick={() => navigate("/app/feed")}>
                متابعة بالموقع
              </Button>
            </div>
          </div>
        ) : !request ? (
          <div className="text-center bg-white/80 dark:bg-[#101828]/80 rounded-2xl shadow-md p-8">
            <h1 className="text-2xl font-bold mb-2 text-mainColor">لا يوجد طلب انضمام</h1>
            <p className="text-gray-500 mb-6">يمكنك استخدام الموقع كمستخدم عادي.</p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-mainColor text-white" onClick={() => navigate("/app/feed")}>
                متابعة بالموقع
              </Button>

              <Button className="bg-[#FFF1C1] text-mainColor" onClick={() => fetchRequest(true)} disabled={refreshing}>
                {refreshing ? "جاري التحديث..." : "تحديث الحالة"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center bg-white/85 dark:bg-[#101828]/85 rounded-2xl shadow-md p-8">
            <h1 className="text-2xl font-bold mb-4 text-mainColor">حالة طلب الانضمام</h1>

            <div className="text-right space-y-3 mb-6">
              <p className="text-lg">
                <span className="text-gray-500">الدور المطلوب: </span>
                <b className="text-mainColor">{renderRole()}</b>
              </p>

              <p className="text-lg">
                <span className="text-gray-500">الحالة: </span>
                <b className={isApproved ? "text-green-500" : isRejected ? "text-red-500" : "text-yellow-500"}>
                  {renderStatus()}
                </b>
              </p>
            </div>

            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="bg-mainColor text-white" onClick={() => navigate("/app/feed")}>
                متابعة كمستخدم عادي
              </Button>

              <Button className="bg-[#FFF1C1] text-mainColor" onClick={() => fetchRequest(true)} disabled={refreshing}>
                {refreshing ? "جاري التحديث..." : "تحديث الحالة"}
              </Button>

              {isApproved && (
                <Button className="bg-green-500 text-white" onClick={handleContinueNewRole}>
                  متابعة بالدور الجديد
                </Button>
              )}
            </div>

            <p className="text-gray-500 mt-6 text-sm">
              يمكنك تصفح الموقع كمستخدم عادي ريثما تتم مراجعة طلبك.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}