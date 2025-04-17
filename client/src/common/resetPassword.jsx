import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Get the reset token from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");

  useEffect(() => {
    // Optionally, you can add a validation for token existence here
    if (!token) {
      toast.error("Invalid reset token.");
      navigate("/LoginPage"); // Redirect if no token is found
    }
  }, [token, navigate]);

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setResetPasswordError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/reset-password/${token}`,
        { newPassword }
      );

      if (response.data.success) {
        toast.success("Password reset successfully.");
        navigate("/LoginPage"); // Redirect to login after successful reset
      } else {
        setResetPasswordError(response.data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setResetPasswordError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>Reset Password</h2>
      {resetPasswordError && <div className="alert alert-danger">{resetPasswordError}</div>}
      <div className="form-group">
        <label>New Password</label>
        <input
          type="password"
          className="form-control"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Confirm Password</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button onClick={handleResetPassword} className="btn btn-primary mt-3">
        Reset Password
      </button>
    </div>
  );
};

export default ResetPasswordPage;
