import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ui/base.css";
import ReactDOM from "react-dom/client";
import App from "./routes/App.jsx";
import AnnouncementPage from "./common/AnnouncementPage.jsx";
import UserDetails from "./components/Users/UserDetails.jsx";
import LoginPage from "./common/LoginPage.jsx";
import Admin from "./pages/Admin.jsx";
import Users from "./pages/Users.jsx";
import { Provider } from "./context/context.jsx";
import ResetPasswordPage from "./common/resetPassword";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/Admin",
    element: <Admin></Admin>,
  },
  {
    path: "/LoginPage",
    element: <LoginPage></LoginPage>,
  },
  {
    path: "/AnnouncementPage",
    element: <AnnouncementPage></AnnouncementPage>,
  },
  {
    path: "/UserDetails",
    element: <UserDetails></UserDetails>,
  },
  {
    path: "/users",
    element: <Users></Users>,
  },
  {
    path: "/reset-password/:token", // Add this line for reset password route
    element: <ResetPasswordPage></ResetPasswordPage>, // Assuming you have a ResetPasswordPage component
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider>
      <RouterProvider router={router}>
        <App />
      </RouterProvider>
    </Provider>
  </React.StrictMode>
);
