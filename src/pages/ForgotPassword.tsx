import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  checkEmailExists,
  requestPasswordReset,
  verifyAndResetPassword,
} from "../api/authApi";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #121212;
`;

const Box = styled.div`
  background: #181818;
  border-radius: 16px;
  padding: 40px 32px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
`;

const Guide = styled.div`
  color: #fff;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px;
  margin-bottom: 20px;
  border-radius: 6px;
  border: 1px solid #404040;
  background: #232323;
  color: #fff;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: #1db954;
  color: #181818;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 16px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #1ed760;
  }
  &:disabled {
    background: #404040;
    color: #888;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4d4d;
  margin-bottom: 16px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  color: #1db954;
  margin-bottom: 16px;
  text-align: center;
`;

const ResendButton = styled.button`
  background: none;
  border: 1px solid #fff;
  color: #fff;
  border-radius: 6px;
  padding: 8px 20px;
  font-size: 1rem;
  margin-bottom: 24px;
  cursor: pointer;
  transition: border 0.2s, color 0.2s;
  &:hover {
    border-color: #1db954;
    color: #1db954;
  }
`;

const OtpInputWrapper = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 24px;
`;

const OtpInput = styled.input`
  width: 48px;
  height: 48px;
  font-size: 2rem;
  text-align: center;
  border-radius: 8px;
  border: 1.5px solid #404040;
  background: #232323;
  color: #fff;
  &:focus {
    outline: none;
    border-color: #1db954;
  }
`;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  const maskedName =
    name[0] + "*".repeat(Math.max(0, name.length - 2)) + name.slice(-1);
  const [domainName, domainExt] = domain.split(".");
  const maskedDomain =
    domainName[0] +
    "*".repeat(Math.max(0, domainName.length - 2)) +
    domainName.slice(-1);
  return `${maskedName}@${maskedDomain}.${domainExt}`;
}

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [resendLoading, setResendLoading] = useState(false);

  // Bước 1: Nhập email
  const handleRequestReset = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const exists = await checkEmailExists(email);
      if (!exists) {
        setError("Email không tồn tại trong hệ thống");
        return;
      }
      const response = await requestPasswordReset(email);
      if (response.success) {
        setToken(response.data.token);
        setStep(2);
        setSuccess("Mã xác thực đã được gửi đến email của bạn");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Bước 2: Nhập mã xác thực
  const handleOtpChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
    if (!value && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsVerifying(true);
    try {
      const code = otp.join("");
      if (code.length !== 6) {
        setError("Vui lòng nhập đủ 6 số mã xác thực");
        setIsVerifying(false);
        return;
      }
      // Gọi verify với mật khẩu tạm (để xác thực mã, chưa đổi mật khẩu)
      const response = await verifyAndResetPassword(
        token,
        code,
        "dummy-password"
      );
      if (response.success) {
        setSuccess("Mã xác thực hợp lệ!");
        setStep(3);
      } else {
        setError(response.message || "Mã xác thực không đúng");
      }
    } catch (err: any) {
      setError(err.message || "Mã xác thực không đúng");
    } finally {
      setIsVerifying(false);
    }
  };

  // Gửi lại mã
  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        setToken(response.data.token);
        setSuccess("Đã gửi lại mã xác thực!");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError("Không gửi lại được mã xác thực");
    } finally {
      setResendLoading(false);
    }
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const code = otp.join("");
      const response = await verifyAndResetPassword(token, code, newPassword);
      if (response.success) {
        setSuccess("Đặt lại mật khẩu thành công!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Container>
      <Box>
        <Title>Quên mật khẩu?</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        {step === 1 && (
          <form onSubmit={handleRequestReset} style={{ width: "100%" }}>
            <Guide>Nhập email bạn đã đăng ký để nhận mã xác thực.</Guide>
            <Input
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit">Gửi mã xác thực</Button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ width: "100%" }}>
            <Guide>
              Nhập mã gồm 6 chữ số mà bạn nhận được qua địa chỉ
              <br />
              <span style={{ color: "#1db954", wordBreak: "break-all" }}>
                {maskEmail(email)}
              </span>
              .
            </Guide>
            <OtpInputWrapper>
              {otp.map((digit, idx) => (
                <OtpInput
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                  inputMode="numeric"
                  autoFocus={idx === 0}
                />
              ))}
            </OtpInputWrapper>
            <ResendButton
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? "Đang gửi lại..." : "Gửi lại mã"}
            </ResendButton>
            <Button type="submit" disabled={isVerifying}>
              {isVerifying ? "Đang xác thực..." : "Xác nhận mã"}
            </Button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
            <Guide>Nhập mật khẩu mới cho tài khoản của bạn.</Guide>
            <Input
              type="password"
              placeholder="Mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Button type="submit">Đặt lại mật khẩu</Button>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default ForgotPassword;
