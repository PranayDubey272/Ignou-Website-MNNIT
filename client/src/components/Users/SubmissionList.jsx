import React, { useState, useEffect } from "react";
import { Box, Button, IconButton, TextField } from "@mui/material";
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
import { useUserContext } from "../../context/context";

const SubmissionList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  const { registration_no } = useUserContext();
  const columns = [
    {
      field: "assignment_name",
      headerName: "Assignment Name",
      flex: 1,
    },
    { field: "course_name", headerName: "Course", flex: 1 },
    {
      field: "submitted_at",
      headerName: "Submitted At",
      flex: 1,
      renderCell: (params) => {
        // Check if date is available
        const date = params.value ? new Date(params.value) : null;
  
        // Format date to a more readable format (e.g., MM/DD/YYYY HH:mm:ss)
        return date
          ? date.toLocaleString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : <HorizontalRuleIcon size={24} />;
      },
    },
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
              <FileDownloadOffIcon size={24} />
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

  useEffect(() => {
    if (registration_no) {
      axios
        .get(`http://localhost:3000/studentsubmissionslist?registration_no=${registration_no}`)
        .then((response) => {
          setData(response.data); // This ensures the state gets updated correctly
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [registration_no]);
  

  const downloadFile = (filePath) => {
      // console.log(filePath);
      const fullUrl = `http://localhost:3000/${filePath}`;
      saveAs(fullUrl);
    };

  return (
    <Box m="20px">
      <HeaderNew
        title="Submission List"
        subtitle="List of submission for Future Reference"
      />

      {/* <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        m="20px 0"
      >
        <CSVLink data={csvData} headers={headers} filename="assignments.csv">
          <Button variant="contained" color="primary">
            {" "}
            Download CSV{" "}
          </Button>
        </CSVLink>
      </Box> */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => `${row.course_name}-${row.assignment_name}-${row.submitted_at}-${row.file_path}`}

        />
      </Box>
    </Box>
  );
};

export default SubmissionList;
