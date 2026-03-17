import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const canSubmit = useMemo(() => token && email && password.length >= 8, [
    token,
    email,
    password,
  ]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.message || "Reset failed");
        return;
      }

      setMsg("✅ تم تغيير كلمة السر بنجاح، سيتم تحويلك لتسجيل الدخول...");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch  {
      setMsg("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#101828] rounded-2xl p-6 shadow">
        <h2 className="text-2xl font-bold mb-2">إعادة تعيين كلمة المرور</h2>

        <p className="text-sm opacity-80 mb-4">
          البريد: <b>{email ? decodeURIComponent(email) : "-"}</b>
        </p>

        {!token || !email ? (
          <p className="text-red-500">
            الرابط ناقص (token/email). اطلب إعادة تعيين مرة ثانية.
          </p>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              className="w-full p-3 rounded-xl border"
              type="password"
              placeholder="كلمة سر جديدة (8 أحرف على الأقل)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              isDisabled={!canSubmit || loading}
              className="bg-[#FFF1C1] text-mainColor w-full h-12 rounded-xl text-lg font-bold"
            >
              {loading ? "جاري الحفظ..." : "تغيير كلمة السر"}
            </Button>

            {msg && (
              <p className={`text-sm ${msg.includes("✅") ? "text-green-600" : "text-red-500"}`}>
                {msg}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
