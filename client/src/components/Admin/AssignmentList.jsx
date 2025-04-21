import React, { useState, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import { tokens } from "../../ui/theme";
import HeaderNew from "../../ui/Heading";
import { useTheme } from "@mui/material";
import { CSVLink } from "react-csv";
import axios from "axios";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import FileDownloadOffIcon from "@mui/icons-material/FileDownloadOff";
import jsPDF from "jspdf";
import "jspdf-autotable";

const AssignmentList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);
  const [isReportDownloaded, setIsReportDownloaded] = useState(false);
  const [pdfColumns, setPdfColumns] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [programmeFilter, setProgrammeFilter] = useState("");
  const [submittedFilter, setSubmittedFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [assignmentNameFilter, setAssignmentNameFilter] = useState("");
  const [uniqueCourses, setUniqueCourses] = useState([]);
  
  const columns = [
    { field: "registrationno", headerName: "Registration No.", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "programme", headerName: "Programme", flex: 1 },
    {
      field: "course_name",
      headerName: "Courses",
      flex: 1,
      renderCell: (params) => params.value || <HorizontalRuleIcon />,
    },
    {
      field: "assignment_name",
      headerName: "Assignment",
      flex: 1,
      renderCell: (params) => params.value || <HorizontalRuleIcon />,
    },
    {
      field: "submitted_at",
      headerName: "Submitted At",
      flex: 1,
      renderCell: (params) => params.value || <HorizontalRuleIcon />,
    },
    { field: "session", headerName: "Session", flex: 1 },
    { field: "year", headerName: "Year", flex: 1 },
    {
      field: "file_path",
      headerName: "Download",
      flex: 1,
      type: "actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            params.row.file_path ? (
              <IconButton onClick={() => downloadFile(params.row.file_path)}>
                <DownloadIcon />
              </IconButton>
            ) : (
              <FileDownloadOffIcon />
            )
          }
          label="Download"
          disabled={!params.row.file_path}
        />,
      ],
    },
  ];

  const csvData = data.map((row) => columns.map((column) => row[column.field]));
  const headers = columns.map((column) => column.headerName);

  // Fetch data and filter unique courses
  useEffect(() => {
    axios
      .get("http://localhost:3000/assignmentlist")
      .then((response) => {
        // Add a unique id to each row (e.g., based on index or a unique field like registrationno)
        const dataWithIds = response.data.map((item, index) => ({
          ...item,
          id: item.registrationno || index, // Use registrationno as id, fallback to index
        }));
        setData(dataWithIds);
        const courses = Array.from(
          new Set(dataWithIds.map((item) => item.course_name).filter(Boolean))
        );
        setUniqueCourses(courses);
        setPdfColumns([
          ...columns.filter((column) => column.field !== "file_path"),
          { field: "session", headerName: "Session" },
          { field: "year", headerName: "Year" },
        ]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error.response?.data);
      });
  }, []);

  const downloadFile = (filePath) => {
    const fullUrl = `http://localhost:3000/${filePath}`;
    saveAs(fullUrl);
  };

  const handleAssignmentNameFilterChange = (event) => {
    setAssignmentNameFilter(event.target.value);
  };

  const handleCourseFilterChange = (event) => {
    setCourseFilter(event.target.value);
  };

  const filteredData = data.filter((row) => {
    const semesterMatch = !semesterFilter || row.semester === semesterFilter;
    const programmeMatch =
      !programmeFilter || (row.programme && row.programme.toString().includes(programmeFilter));
    const submittedMatch =
      submittedFilter === ""
        ? true
        : submittedFilter === "true"
        ? row.submitted_at
        : !row.submitted_at;
    const courseMatch =
      !courseFilter || (row.course_name && row.course_name.toString().includes(courseFilter));
    const sessionMatch = !sessionFilter || row.session === sessionFilter;
    const yearMatch = !yearFilter || row.year === parseInt(yearFilter);
    const assignmentMatch =
      !assignmentNameFilter || (row.assignment_name && row.assignment_name.toLowerCase().includes(assignmentNameFilter.toLowerCase()));

    return (
      semesterMatch &&
      programmeMatch &&
      submittedMatch &&
      courseMatch &&
      sessionMatch &&
      yearMatch &&
      assignmentMatch
    );
  });

  const generateReport = () => {
    const doc = new jsPDF();
    const logoImageData = "/logo.png";
    doc.addImage(logoImageData, "PNG", 10, 10, 30, 30);
    const headerText = "Indira Gandhi National Open University";
    doc.setFontSize(18);
    const headerWidth =
      (doc.getStringUnitWidth(headerText) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(
      headerText,
      (doc.internal.pageSize.getWidth() - headerWidth) / 2,
      20
    );
    const subheading1Text = "Study Center MNNIT Allahabad";
    doc.setFontSize(14);
    const subheading1Width =
      (doc.getStringUnitWidth(subheading1Text) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(
      subheading1Text,
      (doc.internal.pageSize.getWidth() - subheading1Width) / 2,
      30
    );
    const subheading2Text = "Assignments Report";
    doc.setFontSize(14);
    const subheading2Width =
      (doc.getStringUnitWidth(subheading2Text) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(
      subheading2Text,
      (doc.internal.pageSize.getWidth() - subheading2Width) / 2,
      40
    );

    const tableRows = filteredData.map((row) =>
      pdfColumns.map((column) => row[column.field])
    );
    const tableColumns = pdfColumns.map((column) => ({
      header: column.headerName,
      dataKey: column.field,
    }));

    doc.autoTable({
      head: [tableColumns.map((column) => column.header)],
      body: tableRows,
      startY: 50,
    });

    const footerText = "Page " + doc.internal.getNumberOfPages();
    const footerWidth =
      (doc.getStringUnitWidth(footerText) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(
      footerText,
      doc.internal.pageSize.getWidth() - footerWidth - 10,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.save("assignments_report.pdf");
    setIsReportDownloaded(true);
    setPdfColumns([]);
  };

  return (
    <Box m="20px">
      <HeaderNew title="Assignment List" subtitle="List of Assignments for Future Reference" />
      <Box display="flex" alignItems="center" mb={2}>
        <Box mr={2}>
          <label>Assignment Name:</label>
          <input
            type="text"
            value={assignmentNameFilter}
            onChange={handleAssignmentNameFilterChange}
          />
        </Box>
        <Box mr={2}>
          <label>Course:</label>
          <select value={courseFilter} onChange={handleCourseFilterChange}>
            <option value="">All</option>
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </Box>
        <Box mr={2}>
          <label>Programme:</label>
          <input
            type="text"
            value={programmeFilter}
            onChange={(e) => setProgrammeFilter(e.target.value)}
          />
        </Box>
        <Box mr={2}>
          <label>Session:</label>
          <input
            type="text"
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
          />
        </Box>
        <Box mr={2}>
          <label>Year:</label>
          <input
            type="text"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
        </Box>
        <Box>
          <label>Submitted:</label>
          <select
            value={submittedFilter}
            onChange={(e) => setSubmittedFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Submitted</option>
            <option value="false">Not Submitted</option>
          </select>
        </Box>
      </Box>
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={generateReport}
          disabled={isReportDownloaded}
        >
          Generate Report
        </Button>
      </Box>
            
      <DataGrid
        rows={filteredData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        components={{
          Toolbar: GridToolbar,
        }}
      />
      <CSVLink
        data={csvData}
        headers={headers}
        filename="assignments.csv"
        style={{
          textDecoration: "none",
          color: "white",
          marginTop: "10px",
        }}
      >
        <Button variant="contained" color="primary">
          Download CSV
        </Button>
      </CSVLink>
    </Box>
  );
};

export default AssignmentList;
