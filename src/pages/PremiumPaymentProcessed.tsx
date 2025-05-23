import React, { useEffect } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
import { getProfilesByIds, updateProfile } from "../api/profileApi";
import CircularProgress from "@mui/material/CircularProgress";

enum PaymentStatus {
  Processing = "processing",
  Success = "success",
  Failed = "failed",
  AlreadyPaid = "already_paid",
}

const PremiumPaymentProcessed: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<PaymentStatus>(
    PaymentStatus.Processing
  );

  useEffect(() => {
    const processPremiumPayment = async () => {
      try {
        const pId = localStorage.getItem("profile_id");
        if (!pId) throw new Error("No profile id found");
        const profile = (await getProfilesByIds([pId]))[0];
        if (profile.isPremium) {
          setStatus(PaymentStatus.AlreadyPaid);
          return;
        }
        const resultProfile = await updateProfile({
          ...profile,
          isPremium: true,
        });
        if (!resultProfile.isPremium) {
          setStatus(PaymentStatus.Failed);
          return;
        }
        setStatus(PaymentStatus.Success);
      } catch (error: unknown) {
        console.error(error);
        setStatus(PaymentStatus.Failed);
      }
    };
    processPremiumPayment();
  }, []);

  let content;
  if (status === PaymentStatus.Processing) {
    content = (
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#232323",
          color: "#fff",
          boxShadow: 6,
          minWidth: 350,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <CircularProgress size={"4rem"} sx={{ color: "#4caf50", mr: 2 }} />
            <span
              className="material-icons"
              style={{ fontSize: 48, color: "#4caf50" }}
            >
              autorenew
            </span>
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Đang xử lý thanh toán...
          </Typography>
          <Typography variant="body1" color="gray">
            Vui lòng chờ trong giây lát.
          </Typography>
        </CardContent>
      </Card>
    );
  } else if (status === PaymentStatus.Success) {
    content = (
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#232323",
          color: "#fff",
          boxShadow: 6,
          minWidth: 350,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Thanh toán thành công!
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            Cảm ơn bạn đã mua Spotify Premium.
          </Typography>
          <Typography variant="body1" color="gray" sx={{ mb: 4 }}>
            Chúc bạn có trải nghiệm âm nhạc tuyệt vời cùng Spotify Premium.
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontWeight: "bold",
              fontSize: 18,
              borderRadius: 8,
            }}
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </Button>
        </CardContent>
      </Card>
    );
  } else if (status === PaymentStatus.AlreadyPaid) {
    content = (
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#232323",
          color: "#fff",
          boxShadow: 6,
          minWidth: 350,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <WarningAmberIcon color="warning" sx={{ fontSize: 64, mb: 2 }} />
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            color="warning.main"
          >
            Bạn đã có Premium rồi!
          </Typography>
          <Typography variant="body1" color="gray" sx={{ mb: 4 }}>
            Bạn đã là thành viên Premium. Chúng tôi sẽ hoàn trả thanh toán trong
            thời gian sớm nhất.
          </Typography>
          <Button
            variant="contained"
            color="warning"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontWeight: "bold",
              fontSize: 18,
              borderRadius: 8,
            }}
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#232323",
          color: "#fff",
          boxShadow: 6,
          minWidth: 350,
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <Box display="flex" justifyContent="center" mb={2}>
            <CancelIcon color="error" sx={{ fontSize: 64, mb: 2 }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="error">
            Thanh toán thất bại!
          </Typography>
          <Typography variant="body1" color="gray" sx={{ mb: 4 }}>
            Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc
            liên hệ hỗ trợ.
          </Typography>
          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              fontWeight: "bold",
              fontSize: 18,
              borderRadius: 8,
            }}
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#181818", py: 8, px: 2 }}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        {content}
      </Box>
    </Box>
  );
};

export default PremiumPaymentProcessed;
