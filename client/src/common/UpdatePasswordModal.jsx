import React from "react";
import { Box, Typography, TextField, Button, Alert, Modal } from "@mui/material";
import BrowserUpdatedOutlinedIcon from "@mui/icons-material/BrowserUpdatedOutlined";

const UpdatePasswordModal = ({
  open,
  onClose,
  onSubmit,
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  error,
}) => (
  <Modal open={open} onClose={onClose}>
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
        <BrowserUpdatedOutlinedIcon /> Update Password
      </Typography>
      <Typography sx={{ mt: 2 }}>
        Enter a new password for your account.
      </Typography>
      {error && (
        <Box mb={2} mt={1}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      <TextField
        label="New Password"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={newPassword}
        color="secondary"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        fullWidth
        margin="normal"
        type="password"
        value={confirmPassword}
        color="secondary"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <Button variant="contained" color="secondary" fullWidth onClick={onSubmit}>
        Update Password
      </Button>
    </Box>
  </Modal>
);

export default UpdatePasswordModal;
