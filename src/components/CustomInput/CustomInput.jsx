import { Input } from "@heroui/react";

export default function CustomInput({
  name,
  register,
  error,
  isTouched,
  startContent,
  endContent,
  type = "text",
  ...props
}) {
  const isError = Boolean(error && isTouched);

  return (
    <Input
      {...register(name)}
      {...props}
      type={type}
      variant="flat"
      isInvalid={isError}
      errorMessage={error?.message}
      startContent={startContent}
      endContent={endContent}
      classNames={{
        inputWrapper: [
          "rounded-full h-14 md:h-[65px] px-6 flex items-center  transition-all",
          isError
            ? "!bg-red-500 hover:!bg-red-800"
            : "bg-mainColor hover:!bg-TertiaryColor data-[focus=true]:!bg-TertiaryColor",
        ].join(" "),
        input: [
          "!text-white",
          "!caret-white",
          "file:!text-white",
          "file:bg-transparent",
          "file:border-none",
          "file:cursor-pointer",
          "text-lg md:text-xl",
          "text-center",
          "placeholder:!text-white/70",
        ].join(" "),
        errorMessage:
          "text-red-500 text-xs font-bold text-center mt-1",
      }}
    />
  );
}
