import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import handleLogoutOperations from "../util/utils";

const useLoginHandler = (setregistration_no) => {
  const [loginError, setLoginError] = useState("");
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (registration, password) => {
    setregistration_no(registration);
    try {
      const response = await axios.post("http://localhost:3000/login", { registration, password });
      if (response.data.success) {
        // Store login status and token
        localStorage.setItem("isLogedIn", true);
        localStorage.setItem("token", response.data.token);  // Store the JWT token
  
        // Attach the token to axios headers for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
  
        // Navigate based on role
        if (response.data.role === "admin") {
          navigate("/Admin");
        } else if (response.data.role === "office_staff") {
          navigate("/Staff");
        } else {
          navigate("/users", { state: { registration_no: registration } });
        }
      } else {
        handleLogoutOperations();
        setLoginError("Email or password is incorrect. Please try again.");
      }
    } catch (error) {
      handleLogoutOperations();
      console.error("Error logging in:", error);
    }
    setIsButtonClicked(true);
    setTimeout(() => {
      setIsButtonClicked(false);
      setLoginError("Email or password is incorrect. Please try again.");
    }, 100);
  };

  return { handleLogin, loginError, isButtonClicked };
};

export default useLoginHandler;
