import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Spinner } from "@heroui/react";
import { api } from "../../api/apiClient";

const ROLE_LABELS = {
  1: "Admin",
  2: "User",
  3: "Shop Owner",
  4: "Shelter Owner",
  5: "Doctor",
  0: "User (0)", // احتياط
};

const ROLE_OPTIONS = [
  { value: 1, label: "Admin" },
  { value: 2, label: "User" },
  { value: 3, label: "Shop Owner" },
  { value: 4, label: "Shelter Owner" },
  { value: 5, label: "Doctor" },
];

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // للحصول على id تبع الأدمن الحالي من localStorage (حسب نظامك)
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.adminUsers(); // ✅ array
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || "فشل جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const roleText = (ROLE_LABELS[u.role] || `Role ${u.role}`).toLowerCase();
      return name.includes(s) || email.includes(s) || roleText.includes(s);
    });
  }, [users, q]);

  const updateRole = async (id, newRole) => {
    const roleNum = Number(newRole);

    // حماية UI: لا تغيّر دور نفسك
    if (currentUser?.id === id) {
      alert("لا يمكن تغيير دور حسابك الحالي");
      return;
    }

    try {
      setUpdatingId(id);
      await api.adminUpdateUserRole(id, roleNum);

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: roleNum } : u))
      );
    } catch (e) {
      alert(e?.message || "فشل تحديث الدور");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (id) => {
    // حماية UI: لا تحذف نفسك
    if (currentUser?.id === id) {
      alert("لا يمكن حذف حسابك الحالي");
      return;
    }

    const ok = window.confirm("متأكد بدك تحذف هذا المستخدم؟");
    if (!ok) return;

    try {
      await api.adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e?.message || "فشل حذف المستخدم");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-extrabold text-mainColor">إدارة المستخدمين</h1>

        <div className="flex gap-2">
          <Button variant="light" className="text-mainColor font-bold" onPress={load}>
            تحديث
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم أو الإيميل أو الدور..."
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl font-bold">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full">
            <thead>
              <tr className="text-right bg-gray-50">
                <th className="p-4">ID</th>
                <th className="p-4">الاسم</th>
                <th className="p-4">الإيميل</th>
                <th className="p-4">الدور</th>
                <th className="p-4">إجراءات</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-4">{u.id}</td>
                  <td className="p-4 font-bold">{u.name}</td>
                  <td className="p-4">{u.email}</td>

                  {/* ✅ تغيير الدور */}
                  <td className="p-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <select
                        className="border rounded-xl px-3 py-2 text-sm"
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} ({opt.value})
                          </option>
                        ))}
                      </select>

                      <div className="text-xs opacity-70">
                        الحالي:{" "}
                        <span className="font-bold text-mainColor">
                          {ROLE_LABELS[u.role] || `Role ${u.role}`}
                        </span>
                      </div>

                      {updatingId === u.id && (
                        <span className="text-xs text-mainColor font-bold">
                          جارٍ التحديث...
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={() => deleteUser(u.id)}
                      isDisabled={updatingId === u.id}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center opacity-70" colSpan={5}>
                    لا يوجد نتائج
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 text-sm opacity-70">
        إذا طلعت عندك أرقام أدوار غير 1..5 خبرني، وبنوحّد النظام بشكل نهائي.
      </div>
    </div>
  );
}
