import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Users,
  BarChart3,
  Lock,
  Eye,
  LogOut,
  Send,
  Info,
  ChevronDown,
} from "lucide-react";
import { IconBox, Button } from "../components/UIComponents";

export default function LoginPage({ forgot = false }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
const handleLogin = async () => {
  try {
    const response = await axios.post(
      "https://calendarme.digilateral.com/api/auth/login",
      {
        userId,
        password,
      }
    );

    console.log(response.data);

    // save logged in user
    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    // role based navigation
    const role = response.data.user.role;

    if (role === "mr") {
      navigate("/mr-dashboard");
    }

    if (
      role === "flm" ||
      role === "slm" ||
      role === "tlm"
    ) {
      navigate("/manager-dashboard");
    }

    if (role === "ho") {
      navigate("/ho-dashboard");
    }
  } catch (error) {
    console.log(error);

    alert(
      error?.response?.data?.message ||
      "Login Failed"
    );
  }
};
  const navigate = useNavigate();
  return (
    <div className="auth">
      <div className="authHero">
        <CalendarDays size={82} />
        <h1>
          Personalized
          <br />
          Calendar Campaign
          <br />
          <span>Portal</span>
        </h1>
        <p>
          Engage Doctors. Build Relationships.
          <br />
          Deliver Personalized Experiences.
        </p>
        {["Secure & Reliable", "User Friendly", "Track & Monitor"].map(
          (x, i) => (
            <div className="heroPoint" key={x}>
              <IconBox
                icon={[CheckCircle2, Users, BarChart3][i]}
                tone={["blue", "green", "orange"][i]}
              />
              <div>
                <b>{x}</b>
                <span>
                  {i === 0
                    ? "Your data is protected with enterprise-grade security."
                    : i === 1
                      ? "Simple and easy to use, anytime, anywhere."
                      : "Track every activity and measure campaign success in real-time."}
                </span>
              </div>
            </div>
          ),
        )}
      </div>
      <div className="authForm">
        <div className="lang">
          English <ChevronDown size={16} />
        </div>
        {forgot && <a className="back">← Back to Login</a>}
        <div className="steps">
          {forgot &&
            [1, 2, 3].map((n, i) => (
              <span key={n} className={i === 0 ? "on" : ""}>
                {n}
              </span>
            ))}
        </div>
        <h2>{forgot ? "Forgot Password?" : "Welcome Back!"}</h2>
        <p>
          {forgot
            ? "No worries! Enter your User ID and registered email address."
            : "Login to continue to your account"}
        </p>
        <label>User ID</label>
        <div className="input">
          <Users size={20} />

          <input
            type="text"
            placeholder="Enter your User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <label>{forgot ? "Registered Email ID" : "Password"}</label>
        <div className="input">
          <Lock size={20} />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Eye size={20} />
        </div>
        {!forgot && <a className="forgot">Forgot Password?</a>}
        {/* <Button icon={forgot ? Send : LogOut}>
          {forgot ? "Send Reset Instructions" : "Sign In"}
        </Button> */}
        <Button icon={LogOut} onClick={handleLogin}>
          Sign In
        </Button>
        {!forgot && (
          <>
           
          </>
        )}
        <div className="notice">
          <Info size={18} />
          {forgot
            ? "Instructions will be sent to your registered email address."
            : "Important: For security reasons, please log out and exit your browser when done."}
        </div>
      </div>
    </div>
  );
}
