import { useState } from "react";
import axios from "axios";

const useForgotPasswordHandler = (setShowUpdatePasswordModal, setShowForgotPasswordModal) => {
  const [forgotPasswordError, setForgotPasswordError] = useState("");
  const [id, setId] = useState(null);

  const handleForgotPasswordSubmit = async (email) => {  // Renamed for clarity
    setForgotPasswordError(null);
    setId(email);

    try {
      const response = await axios.post("http://localhost:3000/forgot-password", {
        email: email,  // FIXED: must match backend key!
      });

      if (response.data.success) {
        if (response.data.userExists) {
          setShowUpdatePasswordModal(true);
          setShowForgotPasswordModal(false);
        } else {
          setForgotPasswordError("Email not found.");
        }
      } else {
        setForgotPasswordError("An error occurred. Please try again later.");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setForgotPasswordError("An error occurred. Please try again later.");
    }
  };

  return { handleForgotPasswordSubmit, forgotPasswordError, setForgotPasswordError, id };
};

export default useForgotPasswordHandler;
