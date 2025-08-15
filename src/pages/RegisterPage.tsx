import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../api/authApi";
import {
  FaSpotify,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const GENDERS = [
  { label: "Nam", value: "male" },
  { label: "Nữ", value: "female" },
  { label: "Phi nhị giới", value: "nonbinary" },
  { label: "Giới tính khác", value: "other" },
  { label: "Không muốn nêu cụ thể", value: "none" },
];

const months = [
  "Tháng",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    day: "",
    month: "",
    year: "",
    gender: "",
    agree1: false,
    agree2: false,
  });
  const [error, setError] = useState("");

  // Validate từng bước
  const validateStep1 = () => formData.email.trim() !== "";
  const validateStep2 = () => {
    const pw = formData.password;
    const hasLetter = /[a-zA-Z]/.test(pw);
    const hasNumberOrSpecial = /[0-9\W]+/.test(
      pw
    );
    const longEnough = pw.length >= 10;
    return (
      hasLetter &&
      hasNumberOrSpecial &&
      longEnough &&
      formData.fullName.trim() !== "" &&
      formData.day &&
      formData.month &&
      formData.year &&
      formData.gender
    );
  };
  const validateStep3 = () => formData.agree2;

  // Xử lý chuyển bước
  const handleNext = () => {
    setError("");
    if (step === 1 && !validateStep1()) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (step === 2 && !validateStep2()) {
      setError("Vui lòng nhập đầy đủ thông tin hợp lệ.");
      return;
    }
    setStep(step + 1);
  };
  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  // Xử lý đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateStep3()) {
      setError("Bạn phải đồng ý với điều khoản để đăng ký.");
      return;
    }
    try {
      await registerApi({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dateOfBirth: `${formData.year}-${formData.month.padStart(
          2,
          "0"
        )}-${formData.day.padStart(2, "0")}`,
        bio: "",
        phoneNumber: "",
        username: formData.email,
        avatarUrl: "",
      });
      navigate("/login");
    } catch (err: unknown) {
      setError((err as Error).message || "Đăng ký thất bại");
    }
  };

  // Xử lý thay đổi input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox") {
      checked = (e.target as HTMLInputElement).checked;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // UI từng bước
  return (
    <div className="min-h-screen max-h-screen flex justify-center bg-black overflow-y-auto">
      <div className="w-full max-w-md bg-[#121212] rounded-lg shadow-lg p-8 flex flex-col items-center mt-8 mb-8">
        <FaSpotify className="text-spotify-green text-5xl mb-6" />
        {step === 1 && (
          <>
            <h1 className="text-3xl font-bold text-white mb-6 text-center">
              Đăng ký để bắt đầu nghe
            </h1>
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleNext();
              }}
            >
              {error && <div className="text-red-500 text-center">{error}</div>}
              <div>
                <label className="block text-white font-bold mb-1">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  placeholder="name@domain.com"
                  required
                />
                <a className="text-spotify-green text-sm mt-1 inline-block cursor-pointer hover:underline">
                  Dùng số điện thoại.
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-spotify-green text-black py-3 rounded-full font-bold text-lg hover:scale-105 transition mt-2"
              >
                Tiếp theo
              </button>
            </form>
            <div className="flex items-center w-full my-6">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="mx-4 text-gray-400 text-sm">hoặc</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="w-full flex flex-col gap-3 mb-2">
              <button className="flex items-center justify-center gap-2 w-full py-2 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition">
                <FaGoogle className="text-lg" /> Đăng ký bằng Google
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-2 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition">
                <FaFacebook className="text-lg text-blue-500" /> Đăng ký bằng
                Facebook
              </button>
              <button className="flex items-center justify-center gap-2 w-full py-2 rounded-full border border-gray-700 text-white hover:bg-gray-800 transition">
                <FaApple className="text-lg" /> Đăng ký bằng Apple
              </button>
            </div>
            <div className="mt-6 text-gray-400 text-sm text-center">
              Bạn đã có tài khoản?{" "}
              <span
                className="text-spotify-green hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Đăng nhập tại đây
              </span>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="w-full">
              <div className="flex items-center mb-4">
                <div className="flex-1 h-1 bg-spotify-green rounded" />
                <div className="flex-1 h-1 bg-gray-700 rounded ml-2" />
              </div>
              <div className="text-white font-bold mb-2">Bước 1 của 3</div>
              <div className="text-2xl font-bold text-white mb-6">
                Tạo mật khẩu
              </div>
              <form
                className="w-full flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                {error && (
                  <div className="text-red-500 text-center">{error}</div>
                )}
                <div className="relative">
                  <label className="block text-white font-bold mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green pr-10"
                    placeholder="Mật khẩu"
                    required
                  />
                  <span
                    className="absolute right-3 top-10 cursor-pointer text-gray-400"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="text-white text-sm mb-2">
                  Mật khẩu của bạn phải có ít nhất
                </div>
                <ul className="mb-2">
                  <li
                    className={
                      /[a-zA-Z]/.test(formData.password)
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    ✔ 1 chữ cái
                  </li>
                  <li
                    className={
                      /[0-9\W]+/.test(
                        formData.password
                      )
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    ✔ 1 chữ số hoặc ký tự đặc biệt (ví dụ: # ? ! &amp;)
                  </li>
                  <li
                    className={
                      formData.password.length >= 10
                        ? "text-green-400"
                        : "text-gray-400"
                    }
                  >
                    ✔ 10 ký tự
                  </li>
                </ul>
                <div>
                  <label className="block text-white font-bold mb-1">Tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                    placeholder="Tên sẽ xuất hiện trên hồ sơ của bạn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-bold mb-1">
                    Ngày sinh
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="day"
                      value={formData.day}
                      onChange={handleChange}
                      className="w-1/4 p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                      placeholder="dd"
                      maxLength={2}
                      required
                    />
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      className="w-1/2 p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                      required
                    >
                      <option value="">Tháng</option>
                      {months.slice(1).map((m, idx) => (
                        <option
                          key={m}
                          value={String(idx + 1).padStart(2, "0")}
                        >
                          {m}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-1/3 p-3 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                      placeholder="yyyy"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-bold mb-1">
                    Giới tính
                  </label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {GENDERS.map((g) => (
                      <label
                        key={g.value}
                        className="flex items-center gap-2 text-white"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g.value}
                          checked={formData.gender === g.value}
                          onChange={handleChange}
                          className="accent-spotify-green"
                        />
                        {g.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-full font-bold text-lg bg-gray-800 text-white hover:bg-gray-700 transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-spotify-green text-black py-3 rounded-full font-bold text-lg hover:scale-105 transition"
                  >
                    Tiếp theo
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <div className="w-full">
              <div className="flex items-center mb-4">
                <div className="flex-1 h-1 bg-spotify-green rounded" />
                <div className="flex-1 h-1 bg-spotify-green rounded ml-2" />
              </div>
              <div className="text-white font-bold mb-2">Bước 2 của 3</div>
              <div className="text-2xl font-bold text-white mb-6">
                Điều khoản & Điều kiện
              </div>
              <form
                className="w-full flex flex-col gap-4"
                onSubmit={handleSubmit}
              >
                {error && (
                  <div className="text-red-500 text-center">{error}</div>
                )}
                <label className="flex items-center gap-3 bg-[#181818] p-4 rounded-md">
                  <input
                    type="checkbox"
                    name="agree1"
                    checked={formData.agree1}
                    onChange={handleChange}
                    className="accent-spotify-green"
                  />
                  Tôi không muốn nhận tin nhắn tiếp thị từ Spotify
                </label>
                <label className="flex items-center gap-3 bg-[#181818] p-4 rounded-md">
                  <input
                    type="checkbox"
                    name="agree2"
                    checked={formData.agree2}
                    onChange={handleChange}
                    className="accent-spotify-green"
                  />
                  Chia sẻ dữ liệu đăng ký của tôi với các nhà cung cấp nội dung
                  của Spotify cho mục đích tiếp thị.
                </label>
                <div className="text-gray-400 text-sm mt-2">
                  Bằng việc nhấp vào nút Đăng ký, bạn đồng ý với{" "}
                  <a href="#" className="text-spotify-green underline">
                    Điều khoản và điều kiện sử dụng
                  </a>{" "}
                  của Spotify.
                  <br />
                  Để tìm hiểu thêm về cách thức Spotify thu thập, sử dụng, chia
                  sẻ và bảo vệ dữ liệu cá nhân của bạn, vui lòng xem{" "}
                  <a href="#" className="text-spotify-green underline">
                    Chính sách quyền riêng tư của Spotify
                  </a>
                  .
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 rounded-full font-bold text-lg bg-gray-800 text-white hover:bg-gray-700 transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-spotify-green text-black py-3 rounded-full font-bold text-lg hover:scale-105 transition"
                  >
                    Đăng ký
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
