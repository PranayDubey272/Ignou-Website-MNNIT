import React, { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../ui/theme";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import axios from "axios";
import { saveAs } from "file-saver";
import HeaderNew from "../../ui/Heading";

const AssignmentList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");

  const gradeOptions = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F', 'na'];

  useEffect(() => {
    Promise.all([
      axios.get("http://localhost:3000/assignmentlist"),
      axios.get("http://localhost:3000/student-courses"),
    ])
      .then(([assignmentsRes, coursesRes]) => {
        // Format assignments data
        const formattedData = assignmentsRes.data.map((item, idx) => ({
          ...item,
          id: `${item.registration_no}-${item.assignment_id}` || idx,
          grade: item.grade || "na", // default to 'na' if no grade
        }));
        
        setData(formattedData);

        // Format courses data
        const uniqueCourses = Array.from(
          new Set(
            coursesRes.data.data // Access the correct data here
              .map((c) =>
                typeof c === "string"
                  ? c.replace(/^["']|["']$/g, "").replace("]", "")
                  : c
              )
              .filter(Boolean)
          )
        );
        setCourses(uniqueCourses);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  }, []);

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const handleGradeChange = async (newGrade, row) => {
    try {
      await axios.put(`http://localhost:3000/update-grade`, {
        registration_no: row.registration_no,
        assignment_id: row.assignment_id,
        grade: newGrade,
      });

      setData((prevData) =>
        prevData.map((item) =>
          item.id === row.id ? { ...item, grade: newGrade } : item
        )
      );
    } catch (error) {
      console.error("Error updating grade:", error.response?.data || error.message);
    }
  };

  const filteredData = data.filter((row) => {
    const courseMatch = !courseFilter || row.course_name === courseFilter;
    const assignmentMatch =
      !assignmentFilter ||
      (row.assignment_name &&
        row.assignment_name.toLowerCase().includes(assignmentFilter.toLowerCase()));
    return courseMatch && assignmentMatch;
  });

  const columns = [
    { field: "registration_no", headerName: "Reg. No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "assignment_name", headerName: "Assignment", flex: 1 },
    { field: "submitted_at", headerName: "Submitted At", flex: 1 },
    {
      field: "file_path",
      headerName: "Download",
      flex: 0.5,
      renderCell: (params) =>
        params.row.file_path ? (
          <IconButton onClick={() => downloadFile(params.row.file_path)}>
            <DownloadIcon />
          </IconButton>
        ) : (
          <FileDownloadOffIcon />
        ),
    },
    {
      field: "grade",
      headerName: "Grade",
      flex: 0.7,
      renderCell: (params) => (
        params.row.file_path ? (   // ✅ Only show dropdown if file exists
          <Select
            value={params.row.grade || "na"}
            onChange={(e) => handleGradeChange(e.target.value, params.row)}
            fullWidth
            size="small"
            sx={{ backgroundColor: colors.primary[400], borderRadius: 1 }}
          >
            {gradeOptions.map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Box sx={{ textAlign: "center", width: "100%" }}>N/A</Box> // ❌ Otherwise just show "N/A"
        )
      ),
    },
  ];

  return (
    <Box m="20px">
      <HeaderNew title="Assignment Submissions" subtitle="Quick view by course and assignment" />
      <Box display="flex" gap={2} mb={2}>
        <Select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">All Courses</MenuItem>
          {courses.map((course) => (
            <MenuItem key={course} value={course}>
              {course}
            </MenuItem>
          ))}
        </Select>
        <TextField
          fullWidth
          placeholder="Assignment Name"
          value={assignmentFilter}
          onChange={(e) => setAssignmentFilter(e.target.value)}
        />
      </Box>
      <DataGrid
        rows={filteredData}
        columns={columns}
        autoHeight
        pageSize={10}
        rowsPerPageOptions={[10]}
      />
    </Box>
  );
};

export default AssignmentList;
