import "react-pro-sidebar/dist/css/styles.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import MessageIcon from "@mui/icons-material/Message";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CoPresentIcon from "@mui/icons-material/CoPresent";
import SpeakerNotesOutlinedIcon from "@mui/icons-material/SpeakerNotesOutlined";
import { tokens } from "../ui/theme";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const AdminSidebar = ({ handlePage }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  function handleClick(pg) {
    setSelected(pg);
    handlePage(pg);
  }
  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 10px 0",
              color: colors.grey[100],
              // padding: "5px",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img
                    alt="profile-user"
                    width="50px"
                    height="50px"
                    src={`logo.png`}
                    style={{ cursor: "pointer", borderRadius: "50%" }}
                  />
                </Box>
                {/* <Typography variant="h2" color={colors.grey[100]}>
                  Admin
                </Typography> */}
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  sx={{ marginLeft: "10px" }}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="5px">
              <Box textAlign="center">
                <Typography
                  // className=" logotext"
                  variant="h4"
                  sx={{ marginLeft: "10px", p: 1 }}
                >
                  MNNIT ALLAHABAD
                  <br />
                  <span className="">IGNOU Study Centre</span>
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Box onClick={() => handleClick("Dashboard")}>
              <Item
                title="Dashboard"
                // to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Student Info
            </Typography>
            <Box onClick={() => handleClick("StudentList")}>
              <Item
                title="Student List"
                icon={<PeopleOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("Assignment")}>
              <Item
                title="Submitted Assignment"
                icon={<AssignmentIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("AssignmentReport")}>
              <Item
                title="Assignment Report"
                icon={<AssignmentIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("MarksEntry")}>
              <Item
                title="Marks Entry"
                icon={<AssignmentIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("AttendanceReport")}>
              <Item
                title="Attendance Report"
                icon={<CoPresentIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Services
            </Typography>

            <Box onClick={() => handleClick("TakeAttendance")}>
            <Item
              title="Take Attendance"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>


            <Box onClick={() => handleClick("AddAssignment")}>
            <Item
              title="Add Assignment"
              icon={<AssignmentIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>

            <Box onClick={() => handleClick("ImportExcel")}>
              <Item
                title="Import Excel"
                // to="/ImportStudentData"
                icon={<ImportExportIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("AddStaff")}>
              <Item
                title="Add Staff"
                icon={<ImportExportIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("Email")}>
              <Item
                title="Email"
                // to="/email"
                icon={<AttachEmailIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("Message")}>
              <Item
                title="Message"
                // to="/message"
                icon={<MessageIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("Announcement")}>
              <Item
                title="Announcement"
                // to="/announcement"
                icon={<AnnouncementIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Manipulate
            </Typography>
            <Box onClick={() => handleClick("MessageList")}>
              <Item
                title="Message List"
                // to="/mca"
                icon={<SpeakerNotesOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("AnnouncementDeletePage")}>
              <Item
                title="Announcement List"
                // to="/bca"
                icon={<LibraryBooksIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            {/*<Box onClick={() => handleClick("CIT")}>
              <Item
                title="CIT"
                // to="/cit"
                icon={<NotesIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box>
            <Box onClick={() => handleClick("PGDCA")}>
              <Item
                title="PGDCA"
                // to="/pgdca"
                icon={<DvrIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            </Box> */}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default AdminSidebar;
