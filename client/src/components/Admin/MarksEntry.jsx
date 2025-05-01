import React, { useEffect, useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  TextField,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import HeaderNew from "../../ui/Heading";

const MarksEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/courses")
      .then((res) => setCourses(res.data))
      .catch(console.error);
  }, []);

  const handleCourseChange = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await axios.get(`http://localhost:3000/students-by-course/${course}`);
      const formatted = res.data.map((s, i) => ({
        ...s,
        id: s.registration_no || i,
        marks: s.marks || "",
      }));
      setStudents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkChange = (regNo, value) => {
    setStudents((prev) =>
      prev.map((stu) =>
        stu.registration_no === regNo ? { ...stu, marks: value } : stu
      )
    );
  };

  const saveMarks = async (row) => {
    try {
      await axios.put("http://localhost:3000/update-course-mark", {
        registration_no: row.registration_no,
        course_name: selectedCourse,
        marks: row.marks,
      });
      alert("Marks saved!");
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { field: "registration_no", headerName: "Reg No", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    {
      field: "marks",
      headerName: "Marks",
      flex: 1,
      renderCell: (params) => (
        <TextField
          type="number"
          value={params.row.marks}
          onChange={(e) =>
            handleMarkChange(params.row.registration_no, e.target.value)
          }
          size="small"
          sx={{
            // backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Action",
      renderCell: (params) => (
        <Button
          variant="contained"
          color="info" // avoids primary color
          onClick={() => saveMarks(params.row)}
          sx={{ textTransform: "none" }}
        >
          Save
        </Button>
      ),
    },
  ];
  

  return (
    <Box m="20px">
      <HeaderNew title="Marks Entry by Course" subtitle="Select a course and enter marks for each student" />
      <Box mb={2}>
        <Select
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">Select Course</MenuItem>
          {courses.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <DataGrid
        rows={students}
        columns={columns}
        autoHeight
        pageSize={10}
      />
    </Box>
  );
};

export default MarksEntry;
