import { z } from "zod";

export const LoginSchema = z.object({
  accountInput: z
    .string()
    .min(1, { message: "Vui lòng nhập email hoặc tên người dùng" })
    .trim(),
  password: z.string().min(1, { message: "Vui lòng nhập mật khẩu" }),
});

export type LoginForm = z.infer<typeof LoginSchema>;

// Common pieces
const PasswordSchema = z
  .string()
  .min(10, { message: "Mật khẩu phải có ít nhất 10 ký tự" })
  .refine((pw) => /[a-zA-Z]/.test(pw), {
    message: "Mật khẩu phải chứa ít nhất 1 chữ cái",
  })
  .refine((pw) => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]/.test(pw), {
    message: "Mật khẩu phải chứa ít nhất 1 số hoặc ký tự đặc biệt",
  });

const DateOfBirthSchema = z.object({
  day: z
    .string()
    .min(1, { message: "Vui lòng nhập ngày" })
    .regex(/^\d{1,2}$/)
    .refine((d) => Number(d) >= 1 && Number(d) <= 31, {
      message: "Ngày không hợp lệ",
    }),
  month: z
    .string()
    .min(1, { message: "Vui lòng chọn tháng" })
    .regex(/^\d{1,2}$/)
    .refine((m) => Number(m) >= 1 && Number(m) <= 12, {
      message: "Tháng không hợp lệ",
    }),
  year: z
    .string()
    .min(4, { message: "Vui lòng nhập năm" })
    .regex(/^\d{4}$/),
});

export const RegisterStep1Schema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});
export type RegisterStep1 = z.infer<typeof RegisterStep1Schema>;

export const RegisterStep2Schema = z.object({
  password: PasswordSchema,
  fullName: z.string().min(1, { message: "Vui lòng nhập họ tên" }),
  gender: z.string().min(1, { message: "Vui lòng chọn giới tính" }),
  ...DateOfBirthSchema.shape,
});
export type RegisterStep2 = z.infer<typeof RegisterStep2Schema>;

export const RegisterStep3Schema = z.object({
  agree2: z.literal(true, {
    errorMap: () => ({ message: "Bạn phải đồng ý với điều khoản để đăng ký." }),
  }),
  agree1: z.boolean().optional(),
});
export type RegisterStep3 = z.infer<typeof RegisterStep3Schema>;

export const RegisterSchema = RegisterStep1Schema.merge(RegisterStep2Schema).merge(
  RegisterStep3Schema
);
export type RegisterForm = z.infer<typeof RegisterSchema>;


