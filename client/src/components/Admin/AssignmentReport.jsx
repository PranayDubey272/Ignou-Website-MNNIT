import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../ui/theme";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import axios from "axios";
import { saveAs } from "file-saver";
import jsPDF from "jspdf"; // <-- We use this for PDF
import "jspdf-autotable";   // <-- For tables inside PDF
import HeaderNew from "../../ui/Heading";
import dayjs from "dayjs"; // <-- Import dayjs

const AssignmentReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [registrationNo, setRegistrationNo] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [overallGrade, setOverallGrade] = useState(null); // State to hold the overall grade

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const calculateOverallGrade = (grades) => {
    // Assuming grades are numeric or can be converted to numeric
    const gradeMap = {
        "A+": 4.3,
        "A": 4.0,
        "B+": 3.3,
        "B": 3.0,
        "C+": 2.3,
        "C": 2.0,
        "D": 1.0,
        "F": 0,
      };    

    // Convert grades to numbers and calculate average
    const numericGrades = grades.map(grade => gradeMap[grade] || 0);
    const total = numericGrades.reduce((acc, grade) => acc + grade, 0);
    const average = total / numericGrades.length;
    console.log('total',total);
    console.log('avg',average);
    console.log('numer',numericGrades.length);

    // Return the average grade as a letter grade
    if (average >= 4.0) return "A+";
    if (average >= 3.7) return "A";
    if (average >= 3.3) return "B+";
    if (average >= 3.0) return "B";
    if (average >= 2.7) return "C+";
    if (average >= 2.0) return "C";
    if (average >= 1.0) return "D";
    return "F";
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/student-report/${registrationNo}`);
      console.log(res.data);

      // Format the date using dayjs before setting the student data
      const formattedData = res.data.map((item, idx) => ({
        ...item,
        id: idx,
        submitted_at: item.submitted_at ? dayjs(item.submitted_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      }));

      // Calculate the overall grade based on the fetched grades
      const grades = formattedData.map(item => item.grade);
      const overall = calculateOverallGrade(grades);
      setOverallGrade(overall); // Set the overall grade

      setStudentData(formattedData);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching student data:", error.response?.data || error.message);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`Student Report: ${registrationNo}`, 14, 22);

    const tableColumn = ["Assignment", "Submitted At", "Grade"];
    const tableRows = [];

    studentData.forEach((item) => {
      const rowData = [
        item.assignment_name,
        item.submitted_at,
        item.grade || "N/A",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    // Add overall grade to the PDF
    doc.setFontSize(14);
    doc.text(`Overall Grade: ${overallGrade}`, 14, doc.autoTable.previous.finalY + 10);

    doc.save(`${registrationNo}_report.pdf`);
  };

  const columns = [
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
    { field: "grade", headerName: "Grade", flex: 0.5 },
  ];

  return (
    <Box m="20px">
      <HeaderNew title="Student Report" subtitle="Generate report for a student" />
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Registration Number"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!registrationNo}
        >
          Search
        </Button>
        {searched && studentData.length > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleGeneratePDF}
          >
            Download PDF
          </Button>
        )}
      </Box>

      {searched && (
        <DataGrid
          rows={studentData}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
      )}

      {searched && studentData.length > 0 && overallGrade && (
        <Box mt={2}>
          <Typography variant="h6">Overall Grade: {overallGrade}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AssignmentReport;
