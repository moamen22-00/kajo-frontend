import React, { useEffect, useState } from "react";
import { Button, Card, CardBody, Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/apiClient";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.adminStats(); // ✅ يرجع JSON مباشرة
      setStats(data);
    } catch (e) {
      setError(e?.message || "فشل تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const pending = stats?.join_requests?.pending ?? 0;
  const usersCount = stats?.users ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-mainColor">لوحة تحكم الأدمن</h1>

        <Button variant="light" className="text-mainColor font-bold" onPress={loadStats}>
          تحديث
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold">{error}</div>
      )}

      {!loading && stats && (
        <>
          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <Card className="shadow-sm">
              <CardBody className="text-center">
                <div className="text-sm opacity-70">عدد المستخدمين</div>
                <div className="text-3xl font-extrabold text-mainColor mt-2">
                  {usersCount}
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardBody className="text-center">
                <div className="text-sm opacity-70">طلبات الانضمام Pending</div>
                <div className="text-3xl font-extrabold text-mainColor mt-2">
                  {pending}
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm">
              <CardBody className="text-center">
                <div className="text-sm opacity-70">Approved</div>
                <div className="text-3xl font-extrabold text-mainColor mt-2">
                  {stats?.join_requests?.approved ?? 0}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Alert */}
          {pending > 0 && (
            <div className="mt-6 bg-mainColor/10 border border-mainColor/20 text-mainColor p-4 rounded-2xl font-bold flex items-center justify-between">
              <div>⚠ لديك {pending} طلبات انضمام بانتظار المراجعة</div>
              <Button
                className="bg-mainColor text-white font-bold"
                onPress={() => navigate("/admin/users-requests")}
              >
                فتح الطلبات
              </Button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-10">
            <div className="text-xl font-extrabold text-mainColor mb-4">
              إجراءات سريعة
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-mainColor text-white font-bold"
                onPress={() => navigate("/admin/users-requests")}
              >
                طلبات الانضمام
              </Button>

              <Button
                variant="flat"
                className="text-mainColor font-bold"
                onPress={() => navigate("/admin/users")}
              >
                إدارة المستخدمين
              </Button>

              <Button
                variant="flat"
                className="text-mainColor font-bold"
                onPress={() => navigate("/app/feed")}
              >
                الذهاب إلى الـ Feed
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
