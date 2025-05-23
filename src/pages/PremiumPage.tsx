import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { getIsPremium } from "../api/profileApi";

const benefits = [
  "Nghe nhạc không quảng cáo",
  "Tải nhạc về nghe offline",
  "Chất lượng âm thanh cao",
  "Bỏ qua bài hát không giới hạn",
  "Phát nhạc trên nhiều thiết bị",
];

const PremiumPage: React.FC = () => {
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    getIsPremium().then((p) => setIsPremium(p));
  }, []);

  const handleBuyPremium = () => {
    alert("Chức năng mua Premium đang được phát triển!");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#181818", py: 8, px: 2 }}>
      <Grid container justifyContent="center">
        <Card
          sx={{
            borderRadius: 4,
            bgcolor: "#232323",
            color: "#fff",
            boxShadow: 6,
          }}
        >
          <CardContent>
            <Typography
              variant="h3"
              align="center"
              gutterBottom
              fontWeight="bold"
            >
              Spotify Premium
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="primary"
              gutterBottom
            >
              Trải nghiệm âm nhạc không giới hạn
            </Typography>
            <List>
              {benefits.map((benefit, idx) => (
                <ListItem key={idx}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
            <Box sx={{ textAlign: "center", mt: 4 }}>
              {isPremium === null ? (
                <CircularProgress color="success" />
              ) : isPremium ? (
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
                  disabled
                >
                  Bạn đã mua Premium
                </Button>
              ) : (
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
                  onClick={handleBuyPremium}
                >
                  Mua Premium ngay
                </Button>
              )}
            </Box>
            <Typography
              variant="body2"
              align="center"
              color="gray"
              sx={{ mt: 3 }}
            >
              Chỉ từ <b>690.000đ</b>. Vĩnh viễn.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Box>
  );
};

export default PremiumPage;
