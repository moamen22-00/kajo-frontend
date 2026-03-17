import React, { useState } from "react";
import img1 from "../../assets/kajo.svg";
import { Button, Select, SelectItem } from "@heroui/react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaGlobe, FaLock, FaEye } from "react-icons/fa";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../schema/registerSchema";
import CustomInput from "../../components/CustomInput/CustomInput";
import { api } from "../../api/apiClient";

export default function SignUp() {
  const navigate = useNavigate();

  const [roleUI, setRoleUI] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const roles = [
    { label: "مستخدم عادي", value: "user" },
    { label: "صاحب متجر", value: "shop_owner" },
    { label: "صاحب ملجأ", value: "shelter_owner" },
    { label: "طبيب بيطري", value: "doctor" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      role: "user",
      document: null,
    },
    mode: "onTouched",
  });

  const inputs = [
    {
      name: "name",
      placeholder: "اسم المستخدم",
      icon: <FaUser />,
      type: "text",
    },
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
    {
      name: "rePassword",
      placeholder: "تأكيد كلمة السر",
      icon: <FaLock />,
      type: showConfirmPassword ? "text" : "password",
      eye: () => setShowConfirmPassword((v) => !v),
    },
  ];

  const onSubmit = async (data) => {
    setServerError("");
    setLoading(true);

    try {
      // ✅ أهم نقطة: نرسل الدور المختار فعلياً (roleUI أو data.role)
      const selectedRole = roleUI || data.role || "user";

      // ✅ Register API: backend يتوقع requested_role
      const res = await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        requested_role: selectedRole,
      });

      // ✅ حفظ token + user (تسجيل دخول مباشر)
      if (res?.token) localStorage.setItem("token", res.token);
      if (res?.user) localStorage.setItem("user", JSON.stringify(res.user));

      // ✅ إذا فيه طلب قيد المراجعة → صفحة الانتظار
      if (res?.pending_request) {
        navigate("/waiting-approval", { replace: true });
        return;
      }

      // ✅ غير ذلك → دخول طبيعي
      navigate("/app", { replace: true });
    } catch (e) {
      // رسائل Laravel القياسية
      const msg =
        e?.data?.message ||
        e?.data?.errors?.email?.[0] ||
        e?.data?.errors?.password?.[0] ||
        e?.message ||
        "فشل إنشاء الحساب";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
    className="w-full min-h-screen flex items-center justify-center p-4 transition-colors duration-500 bg-cover bg-center"
    style={{
      backgroundImage: "url('../../assets/waiting.svg')" 
    }}
  >
<div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20 gap-10 items-center">
          <div className="flex justify-center max-w-3xl md:max-w-2xl md:min-w-xl lg:w-3xl">
            <img src={img1} alt="KAJO" className="w-full" />
          </div>

          <div className="flex flex-col items-center">
            <h1 className="!text-mainColor text-[32px] md:text-[48px] font-bold mb-8">
              إنشاء حساب
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

              <Select
                label="ما هو دورك"
                selectedKeys={roleUI ? [roleUI] : []}
                onSelectionChange={(keys) => {
                  const val = [...keys][0] || "user";
                  setRoleUI(val);
                  setValue("role", val, { shouldValidate: true });
                }}
                isInvalid={Boolean(errors.role)}
                errorMessage={errors.role?.message}
                classNames={{
                  trigger: [
                    "rounded-full h-14 md:h-[65px] px-8 transition-all",
                    errors.role
                      ? "bg-red-500"
                      : "bg-mainColor hover:!bg-TertiaryColor data-[focus=true]:!bg-TertiaryColor",
                  ].join(" "),
                  label: "text-white text-xl font-bold text-center w-full",
                  value: "text-white text-xl font-bold text-center w-full",
                  popoverContent: "bg-mainColor border-none",
                  listbox: "bg-mainColor",
                }}
              >
                {roles.map((r) => (
                  <SelectItem
                    key={r.value}
                    className="text-white hover:bg-TertiaryColor"
                  >
                    {r.label}
                  </SelectItem>
                ))}
              </Select>

              {/* الوثيقة حالياً UI فقط - لاحقاً نرفعها للباك */}
              {["shop_owner", "shelter_owner", "doctor"].includes(roleUI) && (
                <CustomInput
                  name="document"
                  type="file"
                  register={register}
                  error={errors.document}
                  isTouched
                />
              )}

              {serverError && (
                <p className="text-red-500 text-center">{serverError}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="bg-[#FFF1C1] text-mainColor self-center w-45 h-14 rounded-full text-2xl font-bold mt-6 hover:scale-105 active:scale-95 transition-transform"
              >
                {loading ? "جاري إنشاء الحساب..." : "متابعة"}
              </Button>

              <p className="mt-4">
                هل تملك حساب؟{" "}
                <Link to="/login" className="text-mainColor underline font-bold">
                  تسجيل الدخول
                </Link>
              </p>
            </form>

            {/* ملاحظة توضيحية */}
            <p className="text-gray-500 text-sm mt-4 text-center">
              إذا اخترت (طبيب/متجر/ملجأ) سيتم إرسال طلب انضمام للإدارة، ويمكنك
              التصفح كمستخدم عادي حتى تتم الموافقة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
