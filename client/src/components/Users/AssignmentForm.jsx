import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, List, ListItem, ListItemText, Button, Divider } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { useUserContext } from "../../context/context";
import "react-toastify/dist/ReactToastify.css";

const AssignmentOverview = () => {
  const { registrationno } = useUserContext();
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState({ active: [], missed: [] });
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/assignments/student?registrationno=${registrationno}`
        );
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

      const now = new Date();

      const activeAssignments = response.data.filter(
        (assignment) => new Date(assignment.deadline) > now
      );

      const missedAssignments = response.data.filter(
        (assignment) => new Date(assignment.deadline) <= now
      );

      setAssignments({ active: activeAssignments, missed: missedAssignments });
      setSelectedCourse(course);
    } catch (error) {
      toast.error("Failed to load assignments.");
    }
  };

  const handleFileSelect = async (assignmentId) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";

    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      if (!file) return;

      const confirmUpload = window.confirm(`Are you sure you want to submit "${file.name}"?`);
      if (!confirmUpload) {
        toast.info("Submission cancelled.");
        return;
      }

      const formData = new FormData();
      formData.append("assignmentFile", file);

      try {
        await axios.post("http://localhost:3000/submissions/submit-assignment", formData, {
          headers: {
            "assignmentid": assignmentId,
            "registrationno": registrationno,
          },
        });
        toast.success("Assignment submitted successfully!");
      } catch (error) {
        if (error.response?.data.error === "Assignment already submitted!") {
          toast.success("You have already submitted the assignment");
        } else {
          toast.error("Failed to submit assignment.");
        }
      }
    };

    fileInput.click();
  };

  return (
    <Box sx={{ mt: 4, px: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Courses
      </Typography>
      {courses.length === 0 ? (
        <Typography>Looks like you are all caught up!</Typography>
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

          {assignments.active.length === 0 && assignments.missed.length === 0 ? (
            <Typography>No assignments found for this course.</Typography>
          ) : (
            <>
              {assignments.active.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                    Active Assignments
                  </Typography>
                  <List>
                    {assignments.active.map((assignment) => (
                      <ListItem key={assignment.id} divider>
                        <ListItemText
                          primary={assignment.assignment_name}
                          secondary={`Deadline: ${new Date(assignment.deadline).toLocaleString()}`}
                        />
                        <Button
                          variant="outlined"
                          color="secondary"
                          href={`http://localhost:3000/${assignment.file_path}`}
                          target="_blank"
                        >
                          Download
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleFileSelect(assignment.id)}
                        >
                          Submit
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {assignments.missed.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
                    Missed Assignments
                  </Typography>
                  <List>
                    {assignments.missed.map((assignment) => (
                      <ListItem key={assignment.id} divider>
                        <ListItemText
                          primary={assignment.assignment_name}
                          secondary={`Deadline was: ${new Date(assignment.deadline).toLocaleString()}`}
                        />
                        <Button
                          variant="outlined"
                          color="secondary"
                          href={`http://localhost:3000/${assignment.file_path}`}
                          target="_blank"
                        >
                          Download
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </>
      )}

      <ToastContainer />
    </Box>
  );
};

export default AssignmentOverview;
