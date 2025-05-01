import React, { useState, useRef } from "react";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // <-- Import recharts components
import html2canvas from 'html2canvas'; // <-- Import html2canvas

const AssignmentReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [registration_no, setregistration_no] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [overallGrade, setOverallGrade] = useState(null); // State to hold the overall grade
  const chartRef = useRef(null); // Ref for capturing the chart as an image

  // Grade map to convert letter grades to numeric values for Y-axis
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

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const calculateOverallGrade = (grades) => {
    const numericGrades = grades.map(grade => gradeMap[grade] || 0);
    const total = numericGrades.reduce((acc, grade) => acc + grade, 0);
    const average = total / numericGrades.length;

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
      const res = await axios.get(`http://localhost:3000/student-report/${registration_no}`);
      console.log(res.data);

      const formattedData = res.data.map((item, idx) => ({
        ...item,
        id: idx,
        submitted_at: item.submitted_at ? dayjs(item.submitted_at).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      }));

      const grades = formattedData.map(item => item.grade);
      const overall = calculateOverallGrade(grades);
      setOverallGrade(overall);

      setStudentData(formattedData);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching student data:", error.response?.data || error.message);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Student Report: ${registration_no}`, 14, 22);

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

    // Capture chart as an image and add to PDF using html2canvas
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', 14, doc.autoTable.previous.finalY + 20, 180, 100);
        doc.save(`${registration_no}_report.pdf`);
      });
    } else {
      doc.save(`${registration_no}_report.pdf`);
    }
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

  // Prepare data for line graph
  const lineGraphData = studentData.map(item => ({
    name: item.assignment_name,
    grade: item.grade ? gradeMap[item.grade] : 0, // Convert grades to numeric values
  }));

  return (
    <Box m="20px">
      <HeaderNew title="Student Report" subtitle="Generate report for a student" />
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Registration Number"
          value={registration_no}
          onChange={(e) => setregistration_no(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!registration_no}
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

      {/* Add the line graph to show performance over time */}
      {searched && studentData.length > 0 && (
        <Box mt={4} height={300} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis type="number" domain={[0, 4.3]} ticks={[0, 1, 2, 3, 4.3]} tickFormatter={(tick) => {
                // Format numeric Y-axis to corresponding grades
                const gradeLabels = ["F", "D", "C", "C+", "B", "B+", "A", "A+"];
                return gradeLabels[Math.round(tick)];
              }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="grade" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AssignmentReport;
