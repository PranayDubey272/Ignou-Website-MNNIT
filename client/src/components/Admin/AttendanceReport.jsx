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

const AttendanceReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [registrationNo, setRegistrationNo] = useState("");
  const [course, setCourse] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [overallAttendance, setOverallAttendance] = useState(null); // State to hold overall attendance percentage
  const chartRef = useRef(null); // Ref for capturing the chart as an image

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const handleSearch = async () => {
    try {
      // If only course is provided, fetch all students' attendance for that course
      const res = await axios.get(`http://localhost:3000/attendance-report`, {
        params: {
          registrationNo: registrationNo || null, // Allow registrationNo to be null if not filled
          course: course
        }
      });

      const formattedData = res.data.map((item, idx) => ({
        ...item,
        id: idx,
        date: dayjs(item.date).format('YYYY-MM-DD'),
        status: item.status || "Absent",
      }));

      const totalAttendance = formattedData.filter(item => item.status === "Present").length;
      const attendancePercentage = (totalAttendance / formattedData.length) * 100;
      setOverallAttendance(attendancePercentage.toFixed(2));

      setAttendanceData(formattedData);
      setSearched(true);
    } catch (error) {
      console.error("Error fetching attendance data:", error.response?.data || error.message);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Attendance Report: ${registrationNo || "All Students in " + course}`, 14, 22);

    const tableColumn = ["Course", "Date", "Status"];
    const tableRows = [];

    attendanceData.forEach((item) => {
      const rowData = [
        item.course,
        item.date,
        item.status || "N/A",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    // Add overall attendance percentage to the PDF
    doc.setFontSize(14);
    doc.text(`Overall Attendance: ${overallAttendance}%`, 14, doc.autoTable.previous.finalY + 10);

    // Capture chart as an image and add to PDF using html2canvas
    if (chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', 14, doc.autoTable.previous.finalY + 20, 180, 100);
        doc.save(`${registrationNo || "all_students_in_" + course}_attendance_report.pdf`);
      });
    } else {
      doc.save(`${registrationNo || "all_students_in_" + course}_attendance_report.pdf`);
    }
  };

  const columns = [
    { field: "course", headerName: "Course", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
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
  ];

  // Prepare data for line graph (optional: based on status)
  const lineGraphData = attendanceData.map(item => ({
    name: item.date,
    status: item.status === "Present" ? 1 : 0, // Convert attendance status to 1 for Present and 0 for Absent
  }));

  return (
    <Box m="20px">
      <HeaderNew title="Attendance Report" subtitle="Generate attendance report for a student or course" />
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Registration Number (Optional)"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
        />
        <TextField
          fullWidth
          label="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          disabled={!course}
        >
          Search
        </Button>
        {searched && attendanceData.length > 0 && (
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
          rows={attendanceData}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10]}
        />
      )}

      {searched && attendanceData.length > 0 && overallAttendance !== null && (
        <Box mt={2}>
          <Typography variant="h6">Overall Attendance: {overallAttendance}%</Typography>
        </Box>
      )}

      {/* Add the line graph to show attendance over time */}
      {searched && attendanceData.length > 0 && (
        <Box mt={4} height={300} ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis type="number" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(tick) => tick === 1 ? "Present" : "Absent"} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="status" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceReport;
