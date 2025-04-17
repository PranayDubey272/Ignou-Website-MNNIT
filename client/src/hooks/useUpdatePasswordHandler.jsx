import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useUpdatePasswordHandler = (setShowUpdatePasswordModal) => {
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (registration) => {
    if (newPassword !== confirmPassword) {
      setForgotPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/update-password", {
        registration,
        newPassword,
      });

      if (response.data.success) {
        setShowUpdatePasswordModal(false);
        setForgotPasswordError("");
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password updated successfully.");
      } else {
        setForgotPasswordError(response.data.error || "An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setForgotPasswordError("An error occurred. Please try again later.");
    }
  };

  return {
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleUpdatePassword,
    forgotPasswordError,
    setForgotPasswordError,
  };
};

export default useUpdatePasswordHandler;
