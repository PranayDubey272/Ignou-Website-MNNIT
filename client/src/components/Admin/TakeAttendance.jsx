import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  Checkbox
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../ui/theme";
import axios from "axios";
import HeaderNew from "../../ui/Heading";

const TakeAttendance = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);

  const attendanceOptions = ["Present", "Absent", "Leave"];

  useEffect(() => {
    // Fetch all courses on mount
    axios.get("http://localhost:3000/student-courses")
      .then(res => setCourses(res.data))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const handleCourseSelect = async (courseName) => {
    setSelectedCourse(courseName);
    try {
      const res = await axios.get(`http://localhost:3000/students-by-course/${courseName}`);
      const studentsWithAttendance = res.data.map(student => ({
        ...student,
        id: student.registrationno, // Use registrationno as unique id for DataGrid
        attendance: "" // Initialize attendance
      }));
      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error("Error fetching students:", error.response?.data || error.message);
      setStudents([]);
    }
  };

  const handleAttendanceChange = (id, newStatus) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id ? { ...student, attendance: newStatus } : student
      )
    );
  };
  
  const handleAttendanceCheckbox = (id, isChecked) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? { ...student, attendance: isChecked ? "Present" : "Absent" }
          : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    try {
        const attendanceData = students.map(student => ({
            registrationno: student.registrationno,
            course: selectedCourse,
            status: student.attendance || "Absent",
            date: new Date().toISOString().split('T')[0],
            time_slot: getTimeSlot()   
        }));      
        await axios.post("http://localhost:3000/attendance/mark-attendance-bulk", attendanceData);
        alert("Attendance marked successfully!");
        setSelectedCourse("");
        setStudents([]);
    } catch (error) {
      console.error("Error submitting attendance:", error.response?.data || error.message);
    }
  };

  
// Inside your columns array:
const columns = [
    { field: "registrationno", headerName: "Reg. No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "attendance",
      headerName: "Present?",
      flex: 1,
      renderCell: (params) => (
        <Checkbox
          checked={params.row.attendance === "Present"}
          onChange={(e) => handleAttendanceCheckbox(params.row.id, e.target.checked)}
          sx={{ color: colors.secondary }}
        />
      )
    }
  ];

  const getTimeSlot = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) {
      return "Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
      return "Afternoon";
    } else if (currentHour >= 17 && currentHour <= 21) {
      return "Evening";
    } else {
      return "Other"; // for night, early morning etc.
    }
  };

  return (
    <Box m="20px">
      <HeaderNew title="Take Attendance" subtitle="Mark attendance for a course" />

      <Box display="flex" gap={2} mb={2}>
        <Select
          value={selectedCourse}
          onChange={(e) => handleCourseSelect(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Course</MenuItem>
          {courses.map((course) => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {students.length > 0 && (
        <>
          <DataGrid
            rows={students}
            columns={columns}
            autoHeight
            pageSize={10}
            rowsPerPageOptions={[10]}
            getRowId={(row) => row.id} // Make sure each student has a unique id
          />
          <Box mt={2}>
            <Button variant="contained" onClick={handleSubmitAttendance}>
              Submit Attendance
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TakeAttendance;
