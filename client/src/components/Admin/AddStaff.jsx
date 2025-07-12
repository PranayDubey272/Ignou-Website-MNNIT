import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";

const AddStaff = () => {
  const [staffData, setStaffData] = useState({
    registration_no: "",
    name: "",
    programme: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData({ ...staffData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { registration_no, name, programme, email, mobile, password } = staffData;

    if (!registration_no || !name || !programme || !email || !mobile || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:3000/add-staff", {
        ...staffData,
        role: "staff",
      });

      alert("Staff added successfully!");

      setStaffData({
        registration_no: "",
        name: "",
        programme: "",
        email: "",
        mobile: "",
        password: "",
      });
    } catch (error) {
      console.error("Error adding staff:", error);
      alert("Failed to add staff.");
    }
  };

  return (
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
        Add New Staff
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Staff ID / Registration No"
          variant="outlined"
          name="registration_no"
          fullWidth
          value={staffData.registration_no}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Name"
          variant="outlined"
          name="name"
          fullWidth
          value={staffData.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Programme / Department"
          variant="outlined"
          name="programme"
          fullWidth
          value={staffData.programme}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          fullWidth
          value={staffData.email}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Mobile"
          variant="outlined"
          name="mobile"
          fullWidth
          value={staffData.mobile}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Password"
          variant="outlined"
          name="password"
          type="password"
          fullWidth
          value={staffData.password}
          onChange={handleChange}
          margin="normal"
        />
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          fullWidth
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default AddStaff;
