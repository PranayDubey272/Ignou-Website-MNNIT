import { CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { ColorModeContext, useMode } from "../ui/theme";
import Topbar from "../ui/Topbar.jsx";
import StudentsList from "../components/Admin/StudentsList.jsx";
import AssignmentList from "../components/Admin/AssignmentList.jsx";
// import AttendanceSheet from "../components/Admin/Attendance.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import handleLogoutOperations from "../util/utils.js";
import StaffSidebar from "../sidebar/StaffSidebar.jsx";
import OfficeStaffDashboard from "../components/OfficeStaff/OfficeStaffDashboard.jsx";
import AttendanceReport from "../components/Admin/AttendanceReport.jsx";

const Staff = () => {
  const navigator = useNavigate();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    async function verifyOfficeStaff() {
      try {
        // Define the URL of the endpoint
        const URL =
          "http://localhost:3000/verifystaff";

        // Define the token (replace 'your-token' with the actual token)
        const token = localStorage.getItem("token");
        if (!token) {
          handleLogoutOperations();
          alert("No token found. Please log in again.");
          navigator("/");
          return;
        }

        // Define the headers with the authorization token
        const headers = {
            Authorization: `Bearer ${token}`, // Fix: Add 'Bearer' prefix
        };

        // Make the request to the endpoint
        const response = await axios.get(URL, { headers });

        if (response.data.success === true) {
          setTokenValid(true);
        } else {
          handleLogoutOperations();
          alert("You are not authorized to access this page");
          navigator("/");
        }
      } catch (error) {
        handleLogoutOperations();
        navigator("/");
        alert("You are not authorized. Please try again later.");
        // Log the error message
        console.error(
          "Error:",
          error.response ? error.response.data : error.message
        );
      }
    }

    // Call the function to verify Staff
    verifyOfficeStaff();
  }, [navigator]);

  if (!tokenValid) {
    return null; // or any loading state or component while checking token validity
  }

  function handlePage(pg) {
    setPage(pg);
  }
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <StaffSidebar isSidebar={isSidebar} handlePage={handlePage} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            {page === "Dashboard" && <OfficeStaffDashboard handlePage={handlePage} />}
            {page === "StudentList" && <StudentsList></StudentsList>}
            {page === "Assignment" && <AssignmentList></AssignmentList>}
            {page === "AttendanceReport" && <AttendanceReport></AttendanceReport>}
            {page === "BCA" && <></>}
            {page === "PGDCA" && <></>}
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Staff;
