import React from "react";
import { Box, Typography, TextField, Button, Alert, Modal } from "@mui/material";
import SyncLockOutlinedIcon from "@mui/icons-material/SyncLockOutlined";

const ForgotPasswordModal = ({ open, handleClose, handleForgotPasswordSubmit, forgotPasswordError }) => {
  const inputRef = React.useRef();

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 700,
          bgcolor: "background.paper",
          p: 4,
        }}
      >
        <Typography variant="h6">
          <SyncLockOutlinedIcon fontSize="large" /> Forgot Password
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Please enter your email to reset your password.
        </Typography>
        {forgotPasswordError && (
          <Box mb={2} mt={1}>
            <Alert severity="error">{forgotPasswordError}</Alert>
          </Box>
        )}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          margin="normal"
          color="secondary"
          inputRef={inputRef}
        />
        <Button 
          variant="contained" 
          color="secondary" 
          fullWidth 
          onClick={() => handleForgotPasswordSubmit(inputRef.current.value)}  // FIXED!
        >
          Submit
        </Button>
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;
