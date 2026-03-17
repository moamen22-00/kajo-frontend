import React, { useState } from "react";
import img1 from "../../assets/kajo.svg";
import { Button } from "@heroui/react";
import { FaGlobe } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import CustomInput from "../../components/CustomInput/CustomInput";

const forgetPasswordSchema = z.object({
  email: z.string().email("إيميل غير صالح"),
});

export default function ForgetPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  const onSubmit = async (data) => {
    setServerError("");
    setResetLink("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setServerError(payload?.message || "حدث خطأ");
        setLoading(false);
        return;
      }

      setSubmittedEmail(data.email);
      setResetLink(payload?.reset_link || "");
      setIsSubmitted(true);
    } catch{
      setServerError("تعذر الاتصال بالسيرفر (تأكد أن Laravel يعمل على 8000)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-10 items-center">
          <div className="flex justify-center max-w-3xl md:max-w-2xl md:min-w-xl lg:w-3xl order-1 md:order-2">
            <img src={img1} alt="KAJO" className="w-full" />
          </div>

          <div className="flex flex-col items-center order-2 md:order-1">
            <h1 className="text-mainColor text-[32px] md:text-[48px] font-bold mb-8">
              استعادة كلمة السر
            </h1>

            {!isSubmitted ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-125 flex flex-col gap-4"
              >
                <p className="text-center text-secondaryColor mb-4">
                  أدخل البريد الإلكتروني. إذا كان موجوداً سنعطيك رابط إعادة التعيين مباشرة (وضع تطوير).
                </p>

                <CustomInput
                  name="email"
                  placeholder="البريد الإلكتروني"
                  type="email"
                  register={register}
                  error={errors.email}
                  isTouched={touchedFields.email}
                  startContent={React.cloneElement(<FaGlobe />, {
                    className: "text-white text-xl ml-2",
                  })}
                />

                {serverError && (
                  <p className="text-red-500 text-center">{serverError}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FFF1C1] text-mainColor self-center w-45 h-14 rounded-full text-2xl font-bold mt-6"
                >
                  {loading ? "جاري الإرسال..." : "إرسال"}
                </Button>

                <p className="text-center mt-4">
                  تذكرت كلمة السر؟{" "}
                  <Link to="/login" className="text-mainColor underline">
                    العودة للدخول
                  </Link>
                </p>
              </form>
            ) : (
              <div className="w-full max-w-125 text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="font-bold">تم بنجاح ✅</p>
                  <p className="text-sm mt-2">
                    البريد: <strong>{submittedEmail}</strong>
                  </p>

                  {resetLink ? (
                    <>
                      <p className="text-sm mt-2">
                        هذا رابط إعادة التعيين (للتطوير):
                      </p>

                      <div className="bg-white/70 p-2 rounded mt-2 break-all text-xs text-left">
                        {resetLink}
                      </div>

                      <Button
                        className="bg-mainColor text-white mt-4"
                        onClick={() => window.open(resetLink, "_self")}
                      >
                        فتح رابط إعادة التعيين
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm mt-2">
                      لم يصلنا رابط من السيرفر.
                    </p>
                  )}
                </div>

                <p className="text-center mt-6">
                  <Link to="/login" className="text-mainColor underline">
                    العودة لتسجيل الدخول
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
