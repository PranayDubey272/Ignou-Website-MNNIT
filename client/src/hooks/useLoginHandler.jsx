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
        localStorage.setItem("isLogedIn", true);  // Store login status
        localStorage.setItem("token", response.data.token);  // Store the token
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
