import React, { useContext, useEffect, useState, createContext } from "react";
import axios from "axios";

const UserContext = createContext();

const Provider = ({ children }) => {
  const [userData, setUserData] = useState();
  const [registration_no, setregistration_no] = useState();
  const [messages, addMessages] = useState([]);
  const [tasksData, setTaskData] = useState([
    // Your tasks data...
  ]);
  useEffect(() => {
    if (registration_no) {
      fetchStudentProfile();
    }
  }, [registration_no]); // Depend on registration_no
  
  async function fetchStudentProfile() {
    const url = `http://localhost:3000/studentsprofile?registration_no=${registration_no}`;

    try {
      const response = await axios.get(url);
      setUserData(response.data);
      return response.data;
    } catch (error) {
      // Handle errors
      console.error("Error fetching student profile:", error);
      return null;
    }
  }

  async function fetchMessages() {
    try {
      const response = await axios.get(
        "http://localhost:3000/messages"
      );
      if (response.status === 200) {
        addMessages(response.data);
      } else {
        throw new Error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        registration_no,
        setregistration_no,
        tasksData,
        messages,
        addMessages,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUserContext = () => useContext(UserContext);

export { Provider, useUserContext };
