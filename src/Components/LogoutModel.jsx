import React, { useState } from "react";
import { Modal, Box, Typography, IconButton, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LogoutConfirmationModal = () => {
  const [open, setOpen] = useState(false);
  const auth = getAuth(); // Initialize Firebase Auth
  const navigate = useNavigate(); // React Router's navigation hook

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirm = async () => {
    try {
      await signOut(auth); // Firebase sign out
      // Clear OTP verification status
      localStorage.removeItem("otpVerified");
      setOpen(false);
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      {/* IconButton to trigger the modal */}
      <IconButton
        onClick={handleOpen}
        sx={{
          color: "white",

          "&:hover": {
            backgroundColor: "#003B6A",
          },
        }}
      >
        <LogoutIcon sx={{ fontSize: "35px" }} />
      </IconButton>

      {/* Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="logout-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography
            id="logout-modal-title"
            variant="h6"
            component="h2"
            color="#004D8E"
          >
            Are you sure you want to log out?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 3,
            }}
          >
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#004D8E",
                color: "white",
                "&:hover": {
                  backgroundColor: "#003B6A",
                },
              }}
              onClick={handleConfirm}
            >
              Yes, Log Out
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: "#004D8E",
                borderColor: "#004D8E",
                "&:hover": {
                  backgroundColor: "#E3F2FD",
                  borderColor: "#004D8E",
                },
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default LogoutConfirmationModal;
