import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import handleLogoutOperations from "../util/utils";

const useLoginHandler = (setRegistrationNo) => {
  const [loginError, setLoginError] = useState("");
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (registration, password) => {
    setRegistrationNo(registration);
    try {
      const response = await axios.post("http://localhost:3000/login", { registration, password });
      if (response.data.success) {
        localStorage.setItem("isLogedIn", true);
        localStorage.setItem("token", response.data.token);
        (response.data.role === "admin" || response.data.role === "office_staff")? navigate("/Admin") : navigate("/users", { state: { registrationno: registration } });
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
