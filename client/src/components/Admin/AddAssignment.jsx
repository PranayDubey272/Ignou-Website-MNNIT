import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { format } from "date-fns"; // For formatting dates

const AddAssignment = () => {
  const [assignmentData, setAssignmentData] = useState({
    name: "",
    programme: "",
    course_name: "",
    year: "",
    session: "",
    deadline: null, // Store as Date object or null
    file: null,
  });

  const allowedFileTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-rar-compressed",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAssignmentData({ ...assignmentData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file && !allowedFileTypes.includes(file.type)) {
      alert("Invalid file type! Allowed: PDF, Word, Excel, ZIP, PPT, TXT.");
      e.target.value = null;
      return;
    }

    setAssignmentData({ ...assignmentData, file });
  };

  const handleDateChange = (newDate) => {
    setAssignmentData({ ...assignmentData, deadline: newDate });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("inside handleSubmit");

    const { name, programme, course_name, year, session, file, deadline } = assignmentData;

    if (!name || !programme || !course_name || !year || !session || !file || !deadline) {
      alert("Please fill all fields including deadline and upload a valid file.");
      return;
    }

    const formData = new FormData();
    console.log("inside form data");

    formData.append("assignmentFile", file);
    formData.append("assignmentName", name);
    formData.append("programme", programme);
    formData.append("courseName", course_name);
    formData.append("year", year);
    formData.append("session", session);
    // Format the deadline as YYYY-MM-DD for the backend
    formData.append("deadline", format(deadline, "yyyy-MM-dd"));

    try {
      console.log("inside try");

      await axios.post("http://localhost:3000/assignments/add-assignment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          assignmentname: assignmentData.name,
        },
      });

      alert("Assignment added successfully!");

      setAssignmentData({
        name: "",
        programme: "",
        course_name: "",
        year: "",
        session: "",
        file: null,
        deadline: null, // Reset to null
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add assignment.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          width: 400,
          margin: "50px auto",
          padding: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Add New Assignment
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Assignment Name"
            variant="outlined"
            name="name"
            fullWidth
            value={assignmentData.name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Programme"
            variant="outlined"
            name="programme"
            fullWidth
            value={assignmentData.programme}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Course Name"
            variant="outlined"
            name="course_name"
            fullWidth
            value={assignmentData.course_name}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Year"
            variant="outlined"
            name="year"
            fullWidth
            value={assignmentData.year}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            label="Session"
            variant="outlined"
            name="session"
            fullWidth
            value={assignmentData.session}
            onChange={handleChange}
            margin="normal"
          />
          <DatePicker
            label="Deadline"
            value={assignmentData.deadline}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} fullWidth margin="normal" variant="outlined" />
            )}
            format="yyyy-MM-dd" // Display format
          />
          <Button
            variant="outlined"
            component="label"
            sx={{ mt: 2, mb: 2 }}
            fullWidth
            color="secondary"
          >
            Upload Assignment File
            <input
              type="file"
              hidden
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.ppt,.pptx,.txt"
            />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            fullWidth
          >
            Submit Assignment
          </Button>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default AddAssignment;
