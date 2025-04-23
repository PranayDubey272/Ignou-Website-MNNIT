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
import jsPDF from "jspdf";
import "jspdf-autotable";
import HeaderNew from "../../ui/Heading";
import dayjs from 'dayjs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

const AttendanceReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [registrationNo, setRegistrationNo] = useState("");
  const [course, setCourse] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [searched, setSearched] = useState(false);
  const [overallAttendance, setOverallAttendance] = useState(null);
  const [isSummary, setIsSummary] = useState(false);
  const chartRef = useRef(null);

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const handleSearch = async () => {
    try {
      const params = {
        registrationNo: registrationNo || null,
        course,
        startDate: startDate || null,
        endDate: endDate || null
      };

      const res = await axios.get(`http://localhost:3000/attendance/attendance-report`, { params });

      if (!registrationNo && !startDate && !endDate) {
        // Summary mode
        setIsSummary(true);
        setAttendanceData(res.data.map((item, idx) => ({
          ...item,
          id: idx
        })));
        setSearched(true);
        setOverallAttendance(null);
      } else {
        // Detailed mode
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
        setIsSummary(false);
        setSearched(true);
      }

    } catch (error) {
      console.error("Error fetching attendance data:", error.response?.data || error.message);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Attendance Report: ${registrationNo || "All Students in " + course}`, 14, 22);

    const tableColumn = isSummary
      ? ["Student Name", "Attendance Percentage"]
      : ["Course", "Date", "Status"];

      const tableRows = attendanceData.map((item) => isSummary
      ? [item.registrationno, `${item.attendance_percentage}%`]
      : [item.course, item.date, item.status || "N/A"]
    );    

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
    });

    if (!isSummary && chartRef.current) {
      html2canvas(chartRef.current).then((canvas) => {
        const dataUrl = canvas.toDataURL('image/png');
        doc.addImage(dataUrl, 'PNG', 14, doc.autoTable.previous.finalY + 20, 180, 100);
        doc.save(`${registrationNo || "all_students_in_" + course}_attendance_report.pdf`);
      });
    } else {
      doc.save(`${registrationNo || "all_students_in_" + course}_attendance_report.pdf`);
    }
  };

  const columns = isSummary
    ? [
        { field: "studentName", headerName: "Student Name", flex: 1 },
        { field: "attendancePercentage", headerName: "Attendance %", flex: 1 },
      ]
    : [
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

  const lineGraphData = attendanceData.map(item => ({
    name: item.date,
    status: item.status === "Present" ? 1 : 0,
  }));

  return (
    <Box m="20px">
      <HeaderNew title="Attendance Report" subtitle="Generate attendance report for a student or course" />
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          label="Registration Number (Optional)"
          value={registrationNo}
          onChange={(e) => setRegistrationNo(e.target.value)}
          fullWidth
        />
        <TextField
          label="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          fullWidth
        />
        <TextField
          label="Start Date (Optional)"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <TextField
          label="End Date (Optional)"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleSearch} disabled={!course}>
          Search
        </Button>
        {searched && attendanceData.length > 0 && (
          <Button variant="outlined" color="secondary" onClick={handleGeneratePDF}>
            Download PDF
          </Button>
        )}
      </Box>

      {searched && (
        <DataGrid
          rows={attendanceData.map((row, index) => ({ id: index, ...row }))}
          columns={
            attendanceData.length > 0 && attendanceData[0].attendance_percentage !== undefined
              ? [
                  { field: 'registrationno', headerName: 'Registration No', width: 150 },
                  { field: 'course', headerName: 'Course', width: 150 },
                  { field: 'attendance_percentage', headerName: 'Attendance %', width: 150 }
                ]
              : [
                  { field: 'registrationno', headerName: 'Registration No', width: 150 },
                  { field: 'course', headerName: 'Course', width: 150 },
                  { field: 'date', headerName: 'Date', width: 150 },
                  { field: 'status', headerName: 'Status', width: 150 }
                ]
          }
        />

      )}

      {searched && !isSummary && attendanceData.length > 0 && overallAttendance !== null && (
        <Box mt={2}>
          <Typography variant="h6">Overall Attendance: {overallAttendance}%</Typography>
        </Box>
      )}

      {searched && !isSummary && attendanceData.length > 0 && (
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
