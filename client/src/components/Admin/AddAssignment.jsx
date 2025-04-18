import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";

const AddAssignment = () => {
  const [assignmentData, setAssignmentData] = useState({
    name: "",
    programme: "",
    course_name: "",
    year: "",
    session: "",
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
    "text/plain"
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, programme, course_name, year, session, file } = assignmentData;
    if (!name || !programme || !course_name || !year || !session || !file) {
      alert("Please fill all fields and upload a valid file.");
      return;
    }

    const formData = new FormData();
    Object.entries(assignmentData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    try {
      await axios.post("http://localhost:3000/add-assignment", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Assignment uploaded successfully!");

      setAssignmentData({
        name: "",
        programme: "",
        course_name: "",
        year: "",
        session: "",
        file: null,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to upload assignment.");
    }
  };

  return (
    <Box
      sx={{
        width: 400,
        margin: "50px auto",
        padding: 3,
        boxShadow: 3,
        borderRadius: 2
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
        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2, mb: 2 }}
          fullWidth
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
          color="primary"
          type="submit"
          fullWidth
        >
          Submit Assignment
        </Button>
      </form>
    </Box>
  );
};

export default AddAssignment;
