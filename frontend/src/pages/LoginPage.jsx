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
  Info,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { IconBox, Button } from "../components/UIComponents";

export default function LoginPage({ forgot = false }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // LOGIN LOGIC — UNCHANGED
  // ==========================================
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

  return (
    <div className="loginPage">
      {/* ==========================================
          LEFT SIDE
      ========================================== */}
      <section className="loginVisual">
        <div className="visualGlow visualGlowOne" />
        <div className="visualGlow visualGlowTwo" />

        <div className="visualContent">
          <div className="brandMark">
            <div className="brandIcon">
              <CalendarDays size={26} strokeWidth={2.2} />
            </div>

            <div>
              <strong>Calendar Me</strong>
              <span>Campaign Portal</span>
            </div>
          </div>

          <div className="visualHeading">
            <div className="eyebrow">
              <Sparkles size={14} />
              Personalized Campaigns
            </div>

            <h1>
              Build stronger
              <br />
              <span>doctor relationships.</span>
            </h1>

            <p>
              Engage doctors, manage campaigns and
              deliver personalized experiences from
              one simple platform.
            </p>
          </div>

          <div className="featureList">
            <div className="featureItem">
              <IconBox
                icon={CheckCircle2}
                tone="blue"
              />

              <div>
                <b>Secure & Reliable</b>
                <span>
                  Your data is protected with
                  enterprise-grade security.
                </span>
              </div>
            </div>

            <div className="featureItem">
              <IconBox
                icon={Users}
                tone="green"
              />

              <div>
                <b>Simple & User Friendly</b>
                <span>
                  Everything you need in one
                  easy-to-use workspace.
                </span>
              </div>
            </div>

            <div className="featureItem">
              <IconBox
                icon={BarChart3}
                tone="orange"
              />

              <div>
                <b>Track & Monitor</b>
                <span>
                  Monitor campaign activity and
                  measure performance in real-time.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="visualFooter">
          <ShieldCheck size={16} />
          <span>Secure Campaign Management Platform</span>
        </div>
      </section>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}
      <section className="loginPanel">
        {/* <div className="languageSelector">
          English
          <ChevronDown size={15} />
        </div> */}

        <div className="loginCard">
          {forgot && (
            <button
              type="button"
              className="backButton"
              onClick={() => navigate("/login")}
            >
              ← Back to Login
            </button>
          )}

          {forgot && (
            <div className="stepIndicator">
              <span className="active">1</span>
              <div />
              <span>2</span>
              <div />
              <span>3</span>
            </div>
          )}

          <div className="loginIcon">
            <Lock size={22} />
          </div>

          <div className="loginHeading">
            <span className="smallLabel">
              {forgot ? "ACCOUNT RECOVERY" : "WELCOME BACK"}
            </span>

            <h2>
              {forgot
                ? "Forgot Password?"
                : "Welcome Back!"}
            </h2>

            <p>
              {forgot
                ? "Enter your User ID and registered email address to continue."
                : "Login to continue to your account."}
            </p>
          </div>

          {/* USER ID */}
          <div className="formGroup">
            <label>User ID</label>

            <div className="modernInput">
              <Users size={18} />

              <input
                type="text"
                placeholder="Enter your User ID"
                value={userId}
                onChange={(e) =>
                  setUserId(e.target.value)
                }
              />
            </div>
          </div>

          {/* PASSWORD / EMAIL */}
          <div className="formGroup">
            <label>
              {forgot
                ? "Registered Email ID"
                : "Password"}
            </label>

            <div className="modernInput">
              <Lock size={18} />

              <input
                type="password"
                placeholder={
                  forgot
                    ? "Enter your registered email"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              {!forgot && (
                <Eye
                  size={18}
                  className="passwordEye"
                />
              )}
            </div>
          </div>

          {!forgot && (
            <button
              type="button"
              className="forgotLink"
            >
              Forgot Password?
            </button>
          )}

          {/* LOGIN BUTTON
              Existing Button component + handler preserved */}
          <Button
            icon={LogOut}
            onClick={handleLogin}
          >
            {forgot
              ? "Send Reset Instructions"
              : "Sign In"}
          </Button>

          <div className="securityNotice">
            <div className="noticeIcon">
              <Info size={16} />
            </div>

            <div>
              <strong>Security Notice</strong>

              <span>
                {forgot
                  ? "Instructions will be sent to your registered email address."
                  : "For security reasons, please log out and close your browser when finished."}
              </span>
            </div>
          </div>
        </div>

        <div className="loginFooter">
          <span>© Calendar Me</span>
          <span className="footerDot">•</span>
          <span>Secure access</span>
        </div>
      </section>

      {/* ==========================================
          PAGE STYLES
      ========================================== */}
      <style>{`
  * {
    box-sizing: border-box;
  }

  .loginPage {
    height: 100vh;
    width: 100%;
    display: grid;
    grid-template-columns: 48% 52%;
    background: #f5f8fc;
    overflow: hidden;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }

  /* ==========================================
     LEFT SIDE
  ========================================== */

  .loginVisual {
    height: 100vh;
    min-height: 0;
    position: relative;
    overflow: hidden;

    background:
      radial-gradient(
        circle at 85% 15%,
        rgba(54, 145, 255, 0.28),
        transparent 28%
      ),
      radial-gradient(
        circle at 10% 90%,
        rgba(38, 92, 255, 0.2),
        transparent 30%
      ),
      linear-gradient(
        145deg,
        #06133f 0%,
        #08245e 48%,
        #0b3989 100%
      );

    color: white;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    padding: 32px 48px 24px;
  }

  .visualGlow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(2px);
  }

  .visualGlowOne {
    width: 300px;
    height: 300px;
    right: -150px;
    top: -100px;
    background: rgba(61, 154, 255, 0.16);
  }

  .visualGlowTwo {
    width: 240px;
    height: 240px;
    left: -150px;
    bottom: 30px;
    background: rgba(42, 100, 255, 0.12);
  }

  .visualContent {
    position: relative;
    z-index: 2;
    max-width: 590px;
  }

  /* BRAND */

  .brandMark {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brandIcon {
    width: 42px;
    height: 42px;
    border-radius: 12px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.16);

    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .brandMark strong {
    display: block;
    font-size: 16px;
    font-weight: 750;
    letter-spacing: -0.2px;
  }

  .brandMark span {
    display: block;
    margin-top: 1px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.62);
    letter-spacing: 0.4px;
  }

  /* HEADING */

  .visualHeading {
    margin-top: 65px;
  }

  .eyebrow {
    width: fit-content;

    display: flex;
    align-items: center;
    gap: 6px;

    padding: 6px 10px;
    border-radius: 999px;

    background: rgba(255, 255, 255, 0.09);
    border: 1px solid rgba(255, 255, 255, 0.13);

    color: #cfe3ff;

    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
  }

  .visualHeading h1 {
    margin: 17px 0 13px;

    font-size: clamp(36px, 3.6vw, 52px);
    line-height: 1.04;
    letter-spacing: -1.8px;
    font-weight: 780;

    color: white;
  }

  .visualHeading h1 span {
    color: #55c8ff;
  }

  .visualHeading p {
    max-width: 480px;
    margin: 0;

    color: rgba(255, 255, 255, 0.68);

    font-size: 13px;
    line-height: 1.55;
  }

  /* FEATURES */

  .featureList {
    margin-top: 35px;

    display: grid;
    gap: 10px;
  }

  .featureItem {
    display: flex;
    align-items: center;
    gap: 11px;

    max-width: 470px;

    padding: 10px 12px;
    border-radius: 11px;

    background: rgba(255, 255, 255, 0.055);
    border: 1px solid rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(8px);
  }

  .featureItem b {
    display: block;

    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .featureItem span {
    display: block;

    margin-top: 2px;

    color: rgba(255, 255, 255, 0.56);

    font-size: 10px;
    line-height: 1.35;
  }

  .visualFooter {
    position: relative;
    z-index: 2;

    display: flex;
    align-items: center;
    gap: 7px;

    color: rgba(255, 255, 255, 0.45);

    font-size: 10px;
  }

  /* ==========================================
     RIGHT SIDE
  ========================================== */

  .loginPanel {
    height: 100vh;
    min-height: 0;

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 35px 70px 30px;

    background:
      radial-gradient(
        circle at 100% 0%,
        #edf5ff 0,
        transparent 34%
      ),
      #ffffff;

    overflow: hidden;
  }

  .languageSelector {
    position: absolute;

    top: 22px;
    right: 32px;

    display: flex;
    align-items: center;
    gap: 5px;

    color: #64748b;

    font-size: 11px;
    font-weight: 600;
  }

  .loginCard {
    width: min(100%, 410px);
  }

  /* FORGOT PASSWORD */

  .backButton {
    border: none;
    background: transparent;

    padding: 0;
    margin-bottom: 16px;

    color: #2563eb;

    cursor: pointer;

    font-size: 11px;
    font-weight: 700;
  }

  .stepIndicator {
    display: flex;
    align-items: center;
    gap: 7px;

    margin-bottom: 20px;
  }

  .stepIndicator span {
    width: 25px;
    height: 25px;

    border-radius: 50%;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #d8e0ec;

    color: #94a3b8;

    font-size: 9px;
    font-weight: 800;
  }

  .stepIndicator span.active {
    background: #2563eb;
    border-color: #2563eb;

    color: white;

    box-shadow:
      0 4px 12px rgba(37, 99, 235, 0.22);
  }

  .stepIndicator div {
    width: 38px;
    height: 1px;
    background: #e2e8f0;
  }

  /* LOGIN ICON */

  .loginIcon {
    width: 44px;
    height: 44px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 12px;

    background: #eff6ff;
    color: #2563eb;

    border: 1px solid #dbeafe;

    margin-bottom: 16px;
  }

  /* HEADING */

  .loginHeading .smallLabel {
    color: #2563eb;

    font-size: 9px;
    font-weight: 800;

    letter-spacing: 1.1px;
  }

  .loginHeading h2 {
    margin: 5px 0 5px;

    color: #0f172a;

    font-size: 31px;
    line-height: 1.1;

    letter-spacing: -0.9px;

    font-weight: 780;
  }

  .loginHeading p {
    margin: 0 0 21px;

    color: #718096;

    font-size: 12px;
    line-height: 1.45;
  }

  /* FORM */

  .formGroup {
    margin-bottom: 14px;
  }

  .formGroup label {
    display: block;

    margin-bottom: 6px;

    color: #27364d;

    font-size: 11px;
    font-weight: 700;
  }

  .modernInput {
    height: 44px;
    width: 100%;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 0 12px;

    border: 1px solid #d8e1ee;
    border-radius: 9px;

    background: #ffffff;

    color: #8b9ab0;

    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .modernInput:focus-within {
    border-color: #76a7f7;

    background: #ffffff;

    box-shadow:
      0 0 0 3px rgba(37, 99, 235, 0.08);
  }

  .modernInput input {
    flex: 1;

    width: 100%;
    min-width: 0;

    border: none;
    outline: none;

    background: transparent;

    color: #0f172a;

    font-size: 12px;
  }

  .modernInput input::placeholder {
    color: #a0aec0;
  }

  .passwordEye {
    cursor: pointer;
    color: #94a3b8;
  }

  /* FORGOT */

  .forgotLink {
    display: block;

    margin: -1px 0 14px auto;

    padding: 0;

    border: none;
    background: transparent;

    color: #2563eb;

    cursor: pointer;

    font-size: 10px;
    font-weight: 700;
  }

  /* BUTTON */

  .loginCard .btn {
    width: 100%;
    height: 44px;

    margin-top: 2px;

    border-radius: 9px;

    font-size: 12px;
    font-weight: 700;
  }

  /* SECURITY */

  .securityNotice {
    display: flex;

    gap: 9px;

    margin-top: 16px;

    padding: 10px 11px;

    border-radius: 9px;

    background: #f8fafc;

    border: 1px solid #e7edf5;
  }

  .noticeIcon {
    width: 25px;
    height: 25px;

    flex: 0 0 25px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 7px;

    background: #eff6ff;
    color: #2563eb;
  }

  .securityNotice strong {
    display: block;

    margin-bottom: 2px;

    color: #334155;

    font-size: 10px;
    font-weight: 750;
  }

  .securityNotice span {
    display: block;

    color: #8793a5;

    font-size: 9px;
    line-height: 1.35;
  }

  /* FOOTER */

  .loginFooter {
    position: absolute;

    bottom: 14px;
    left: 0;
    right: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    gap: 7px;

    color: #a0aec0;

    font-size: 9px;
  }

  .footerDot {
    color: #cbd5e1;
  }

  /* ==========================================
     SMALL DESKTOP / LAPTOP
  ========================================== */

  @media (max-height: 750px) and (min-width: 761px) {
    .loginVisual {
      padding-top: 24px;
      padding-bottom: 18px;
    }

    .visualHeading {
      margin-top: 42px;
    }

    .visualHeading h1 {
      font-size: 40px;
      margin-top: 14px;
      margin-bottom: 10px;
    }

    .visualHeading p {
      font-size: 12px;
    }

    .featureList {
      margin-top: 25px;
      gap: 7px;
    }

    .featureItem {
      padding: 8px 10px;
    }

    .loginPanel {
      padding-top: 25px;
      padding-bottom: 22px;
    }

    .loginHeading h2 {
      font-size: 28px;
    }

    .loginHeading p {
      margin-bottom: 16px;
    }

    .formGroup {
      margin-bottom: 11px;
    }

    .modernInput {
      height: 41px;
    }

    .loginCard .btn {
      height: 41px;
    }

    .securityNotice {
      margin-top: 12px;
      padding: 8px 10px;
    }
  }

  /* ==========================================
     TABLET
  ========================================== */

  @media (max-width: 1050px) and (min-width: 761px) {
    .loginPage {
      grid-template-columns: 45% 55%;
    }

    .loginVisual {
      padding: 28px 32px 20px;
    }

    .loginPanel {
      padding: 30px 42px 25px;
    }

    .visualHeading {
      margin-top: 50px;
    }

    .visualHeading h1 {
      font-size: 38px;
    }

    .featureList {
      margin-top: 28px;
    }
  }

  /* ==========================================
     MOBILE
  ========================================== */

  @media (max-width: 760px) {
    .loginPage {
      height: auto;
      min-height: 100vh;

      display: block;

      overflow-y: auto;
    }

    .loginVisual {
      height: auto;
      min-height: auto;

      padding: 25px 22px 26px;
    }

    .visualHeading {
      margin-top: 42px;
    }

    .visualHeading h1 {
      font-size: 34px;
      letter-spacing: -1.3px;
    }

    .visualHeading p {
      font-size: 12px;
    }

    .featureList {
      margin-top: 28px;
      gap: 8px;
    }

    .featureItem {
      padding: 9px 10px;
    }

    .visualFooter {
      margin-top: 28px;
    }

    .loginPanel {
      height: auto;
      min-height: auto;

      padding: 45px 22px 65px;

      overflow: visible;
    }

    .languageSelector {
      top: 18px;
      right: 22px;
    }

    .loginCard {
      width: 100%;
    }

    .loginHeading h2 {
      font-size: 29px;
    }

    .loginFooter {
      bottom: 18px;
    }
  }

  @media (max-width: 420px) {
    .loginVisual {
      padding: 22px 18px 24px;
    }

    .visualHeading {
      margin-top: 35px;
    }

    .visualHeading h1 {
      font-size: 31px;
    }

    .loginPanel {
      padding-left: 18px;
      padding-right: 18px;
    }
  }
`}</style>
    </div>
  );
}