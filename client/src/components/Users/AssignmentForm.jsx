import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useUserContext } from "../../context/context";
import "react-toastify/dist/ReactToastify.css";

const AssignmentOverview = () => {
  const { registrationno } = useUserContext();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/assignments/student?registrationno=${registrationno}`
        );
        // Extract unique courses from the response data
        const uniqueCourses = [
          ...new Set(response.data.map((assignment) => assignment.course_name)),
        ];
        setCourses(uniqueCourses);
      } catch (error) {
        toast.error("Failed to load courses.");
      }
    };

    fetchCourses();
  }, [registrationno]);

  const fetchAssignments = async (course) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/assignments/student?registrationno=${registrationno}&course=${course}`
      );
      setAssignments(response.data);
      setSelectedCourse(course);
    } catch (error) {
      toast.error("Failed to load assignments.");
    }
  };

  const handleFileSelect = async ()=>{
    
  }

  return (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Courses
      </Typography>
      {courses.length === 0 ? (
        <Typography>No courses found.</Typography>
      ) : (
        <List>
          {courses.map((course) => (
            <ListItem button key={course} onClick={() => fetchAssignments(course)}>
              <ListItemText primary={course} />
            </ListItem>
          ))}
        </List>
      )}

      {selectedCourse && (
        <>
          <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
            Assignments for {selectedCourse}
          </Typography>
          {assignments.length === 0 ? (
            <Typography>No assignments found for this course.</Typography>
          ) : (
            <List>
              {assignments.map((assignment) => (
                <ListItem key={assignment.id}>
                  <ListItemText
                    primary={assignment.assignment_name}
                    secondary={`Deadline: ${new Date(assignment.deadline).toLocaleString()}`}
                  />
                  <Button
                    variant="outlined"
                    color="secondary"
                    href={`http://localhost:3000/${assignment.file_path}`} // Make sure this matches the static file serving path
                    target="_blank"
                  >
                    Download
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleFileSelect(assignment.id)} // The submission route goes here
                    target="_blank"
                  >
                    Submit
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      <ToastContainer />
    </Box>
  );
};

export default AssignmentOverview;
