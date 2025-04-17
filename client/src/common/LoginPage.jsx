import React, { useRef, useState } from "react";
import { Box, TextField, Button, Grid, Typography, Alert } from "@mui/material";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { useUserContext } from "../context/context.jsx";
import ForgotPasswordModal from "./ForgotPasswordModal.jsx";
import UpdatePasswordModal from "./UpdatePasswordModal.jsx";
import useLoginHandler from "../hooks/useLoginHandler.jsx";
import useForgotPasswordHandler from "../hooks/useForgotPasswordHandler.jsx";
import useUpdatePasswordHandler from "../hooks/useUpdatePasswordHandler.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginPage = () => {
  const { setRegistrationNo } = useUserContext();
  const registrationRef = useRef(null);
  const passwordRef = useRef(null);
  const { handleLogin, loginError, isButtonClicked } = useLoginHandler(setRegistrationNo);

  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  const {
    handleForgotPasswordSubmit,
    forgotPasswordError,
    setForgotPasswordError,
    id
  } = useForgotPasswordHandler(setShowUpdatePasswordModal, setShowForgotPasswordModal);

  const {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleUpdatePassword,
    forgotPasswordError: updateError,
    setForgotPasswordError: setUpdateError
  } = useUpdatePasswordHandler(setShowUpdatePasswordModal);

  const handleSubmit = (e) => {
    e.preventDefault();
    const registration = registrationRef.current.value;
    const password = passwordRef.current.value;
    handleLogin(registration, password);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        height: "100vh",
        padding: "170px",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          ml: 8,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: "-1",
          backgroundImage: "url('bg1.jpg')",
        }}
      />
      <Box sx={{ width: "400px", zIndex: "2" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h2"
            className="design"
            sx={{
              display: "flex",
              justifyContent: "center",
              fontSize: "1.8rem",
              fontWeight: "bold",
              p: "0.5rem 1rem",
              borderRadius: "4px",
              color: "#1976d2",
            }}
          >
            Welcome Back!
          </Typography>
          <Typography>
            <GroupsOutlinedIcon fontSize="large" />
          </Typography>
          <Typography className="opacity-70">Login to your account</Typography>
        </Box>
  
        <Box sx={{ textAlign: "center" }}>
          <form onSubmit={handleSubmit}>
            <Box mb={1}>
              <TextField
                inputRef={registrationRef}
                label="Registration Number"
                variant="outlined"
                color="primary"
                required
                fullWidth
              />
            </Box>
  
            <Box mb={3}>
              <TextField
                inputRef={passwordRef}
                label="Password"
                variant="outlined"
                type="password"
                color="primary"
                required
                fullWidth
              />
            </Box>
  
            {loginError && (
              <Box mb={3}>
                <Alert severity="error">{loginError}</Alert>
              </Box>
            )}
  
            <Button
              type="submit"
              variant="outlined"
              color="primary"
              className={`text-bold ${isButtonClicked ? "clicked" : ""}`}
              fullWidth
            >
              {isButtonClicked ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Box>
  
        <Grid item sx={{ p: 2 }}>
          <Typography variant="body2" align="center" gutterBottom>
            Forgot password?{" "}
            <span
              onClick={() => {
                setForgotPasswordError("");
                setShowForgotPasswordModal(true);
              }}
              style={{ color: "#1976d2", cursor: "pointer" }}
            >
              Click here
            </span>
          </Typography>
        </Grid>
      </Box>
  
      <ForgotPasswordModal
        open={showForgotPasswordModal}
        handleClose={() => setShowForgotPasswordModal(false)}
        handleForgotPasswordSubmit={handleForgotPasswordSubmit}  
        forgotPasswordError={forgotPasswordError}
      />
  
      <UpdatePasswordModal
        open={showUpdatePasswordModal}
        handleClose={() => setShowUpdatePasswordModal(false)}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        handleUpdatePassword={() => handleUpdatePassword(id)}
        forgotPasswordError={updateError}
      />
  
      <ToastContainer />
    </Box>
  );
};  

export default LoginPage;
