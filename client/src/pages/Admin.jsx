import { CssBaseline, ThemeProvider } from "@mui/material";
import { useState } from "react";
import { ColorModeContext, useMode } from "../ui/theme";
import Topbar from "../ui/Topbar.jsx";
import ImportStudentData from "../components/Admin/ImportStudentData.jsx";
import SendEmailsButton from "../components/Admin/SendEmailsButton.jsx";
import AdminMessageForm from "../Messages/AddMessage.jsx";
import AdminAnnouncementPage from "../components/Admin/AdminAnnouncementPage.jsx";
import StudentsList from "../components/Admin/StudentsList.jsx";
import AssignmentList from "../components/Admin/AssignmentList.jsx";
// import AttendanceSheet from "../components/Admin/Attendance.jsx";
import AttendanceReport from "../components/Admin/AttendanceReport.jsx";
import MessagesList from "../Messages/MessagesList.jsx";
import AnnouncementDeletePage from "../components/Admin/AccouncementDeletePage.jsx";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import handleLogoutOperations from "../util/utils.js";
import AdminSidebar from "../sidebar/AdminSidebar.jsx";
import AdminDashboard from "../components/Admin/AdminDashboard.jsx";
import AddAssignment from "../components/Admin/AddAssignment.jsx";
import AssignmentReport from "../components/Admin/AssignmentReport.jsx";
import TakeAttendance from "../components/Admin/TakeAttendance.jsx";
import MarksEntry from "../components/Admin/MarksEntry.jsx";
import AddStaff from "../components/Admin/AddStaff.jsx";

const Admin = () => {
  const navigator = useNavigate();
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [page, setPage] = useState("Dashboard");
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        // Define the URL of the endpoint
        const URL =
          "http://localhost:3000/verifyadmin";

          const token = localStorage.getItem("token");
  
          if (!token) {
            handleLogoutOperations();
            alert("No token found. Please log in again.");
            navigator("/");
            return;
          }
    
          const headers = {
            Authorization: `Bearer ${token}`, // Fix: Add 'Bearer' prefix
          };
    
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
          console.error(
            "Error:",
            error.response ? error.response.data : error.message
          );
        }
      }  
    // Call the function to verify admin
    verifyAdmin();
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
          <AdminSidebar isSidebar={isSidebar} handlePage={handlePage} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            {page === "Dashboard" && <AdminDashboard handlePage={handlePage} />}
            {page === "StudentList" && <StudentsList></StudentsList>}
            {page === "Assignment" && <AssignmentList></AssignmentList>}
            {page === "AddAssignment" && <AddAssignment></AddAssignment>}
            {page === "AssignmentReport" && <AssignmentReport></AssignmentReport>}
            {page === "TakeAttendance" && <TakeAttendance></TakeAttendance>}

            {page === "ImportExcel" && <ImportStudentData></ImportStudentData>}
            {page === "Email" && <SendEmailsButton></SendEmailsButton>}
            {page === "Message" && <AdminMessageForm></AdminMessageForm>}
            {page === "Announcement" && (
              <AdminAnnouncementPage></AdminAnnouncementPage>
            )}
            {page === "AttendanceReport" && <AttendanceReport></AttendanceReport>}
            {page === "MarksEntry" && <MarksEntry></MarksEntry>}
            {/* {page === "Attendance" && <AttendanceSheet></AttendanceSheet>} */}
            {page === "MessageList" && <MessagesList role="admin"></MessagesList>}
            {page === "AnnouncementDeletePage" && (
              <AnnouncementDeletePage></AnnouncementDeletePage>
            )}
            {page === "AddStaff" && <AddStaff></AddStaff>}
            {page === "BCA" && <></>}
            {page === "PGDCA" && <></>}

          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Admin;
