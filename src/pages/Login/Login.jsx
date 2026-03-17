import React, { useState } from "react";
import img1 from "../../assets/kajo.svg";
import { Button } from "@heroui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaGlobe, FaLock, FaEye } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../schema/loginschema";
import CustomInput from "../../components/CustomInput/CustomInput";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const inputs = [
    {
      name: "email",
      placeholder: "البريد الإلكتروني",
      icon: <FaGlobe />,
      type: "email",
    },
    {
      name: "password",
      placeholder: "كلمة السر",
      icon: <FaLock />,
      type: showPassword ? "text" : "password",
      eye: () => setShowPassword((v) => !v),
    },
  ];

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      // ✅ Login عبر AuthContext (يتعامل مع apiClient + localStorage + state)
      const user = await login(data.email, data.password);

      // إذا كان في صفحة محمية رجعتك على login، خلي يرجع لنفس الصفحة
      const from = location.state?.from?.pathname;

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      // ✅ توجيه حسب الدور (Laravel: role 1 admin)
      if (Number(user.role) === 1) {
        navigate("/admin/users-requests", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    } catch (e) {
      // apiClient يرمي Error فيه message
      setServerError(e?.message || "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-[#101828] p-4 transition-colors duration-500">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-10 items-center">
          <div className="flex justify-center max-w-3xl md:max-w-2xl md:min-w-xl lg:w-3xl order-1 md:order-2 ">
            <img src={img1} alt="KAJO" className="w-full " />
          </div>

          <div className="flex flex-col items-center order-2 md:order-1">
            <h1 className="text-sevenColor text-[32px] md:text-[48px] font-bold mb-8">
              الانضمام لنا
            </h1>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full max-w-125 flex flex-col gap-4"
            >
              {inputs.map((input) => (
                <CustomInput
                  key={input.name}
                  name={input.name}
                  placeholder={input.placeholder}
                  type={input.type}
                  register={register}
                  error={errors[input.name]}
                  isTouched={touchedFields[input.name]}
                  startContent={React.cloneElement(input.icon, {
                    className: "text-white text-xl ml-2",
                  })}
                  endContent={
                    input.eye && (
                      <div
                        className="cursor-pointer text-white"
                        onClick={input.eye}
                      >
                        <FaEye size={20} />
                      </div>
                    )
                  }
                />
              ))}

              {serverError && (
                <p className="text-red-500 text-center">{serverError}</p>
              )}

              <p className="text-center mt-4">
                اذا نسيت كلمة المرور
                <Link className="text-mainColor" to="/forgot-password">
                  {" "}
                  هنا
                </Link>
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#FFF1C1] text-mainColor self-center w-45 h-14 rounded-full text-2xl font-bold mt-6"
              >
                {loading ? "جاري الدخول..." : "متابعة"}
              </Button>
            </form>

            <p className="py-3">
              إنشاء حساب جديد?{" "}
              <Link
                to="/register"
                className="text-mainColor  underline underline-offset-4"
              >
                التسجيل الآن
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
