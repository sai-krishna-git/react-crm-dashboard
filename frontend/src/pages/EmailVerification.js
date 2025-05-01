import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("Enter your email to receive OTP");
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // Function to send OTP
  const sendOtp = async () => {
    if (!email) {
      setError("Please enter a valid email");
      return;
    }
    try {
      const response = await fetch("/api/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP sent successfully! Check your email.");
        setOtpSent(true);
        setError("");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Error sending OTP");
    }
  };

  // Function to verify OTP
  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    try {
      const response = await fetch("/api/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP verified successfully! Redirecting...");
        setError("");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Error verifying OTP");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-6 bg-white shadow-lg w-96 rounded-lg">
        <h2 className="text-xl font-semibold text-center mb-4">Email Verification</h2>
        <p className="text-center text-gray-600">{message}</p>
        {!otpSent ? (
          <>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-4 w-full p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full mt-4" onClick={sendOtp}>
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              maxLength="6"
              className="mt-4 w-full p-2 text-center text-lg tracking-widest border rounded"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            {error && <p className="text-red-500 text-center mt-2">{error}</p>}
            <Button className="w-full mt-4" onClick={verifyOtp}>
              Verify OTP
            </Button>
            <p
              className="text-center text-sm text-gray-500 mt-2 cursor-pointer hover:text-blue-500"
              onClick={sendOtp}
            >
              Resend OTP
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
