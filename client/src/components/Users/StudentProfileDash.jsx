import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../../context/context";

function ProfilePage() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const { registration_no } = useUserContext();
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data from the server based on the registration_no
        const response = await axios.get(
          `http://localhost:3000/studentsprofile?registration_no=${registration_no}`
        );
        setStudentData(response.data);
        navigate("/UserDetails", { state: response.data });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchData();
  }, [registration_no]);

  return <></>;
}

export default ProfilePage;
