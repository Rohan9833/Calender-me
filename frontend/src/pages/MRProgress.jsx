// pages/MRProgress.jsx

import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  UserPlus,
  CheckCircle2,
  CalendarDays,
  Clock3,
  Filter,
  Eye,
  Info,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Layout from "../components/Layout";

import {
  StatCard,
  Badge,
  Button,
  SelectBox,
  DataTable,
  Crumbs,
  ProgressBar,
} from "../components/UIComponents";

import {
  getFLMDashboard,
  getSLMDashboard,
  getTLMDashboard,
  getPendingApprovals,
} from "../api/managerAPI";

// ============================================================
// MOBILE BREAKPOINT HOOK
// ============================================================

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

// ============================================================
// MR PROGRESS
// ============================================================

export function MRProgress() {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const user = JSON.parse(localStorage.getItem("user"));

      let data;

      if (user.role === "flm") {
        data = await getFLMDashboard(user.flmId);
      } else if (user.role === "slm") {
        data = await getSLMDashboard(user.slmId);
      } else if (user.role === "tlm") {
        data = await getTLMDashboard(user.tlmId);
      }

      setDashboard(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "MR-wise Progress"]} />

        <div className="animated-page loading-screen">
          <div className="loading-orb">
            <RefreshCw size={28} />
          </div>

          <h3>Loading MR progress</h3>

          <p>Preparing your team performance data...</p>

          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <style>{`
          .loading-screen {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .loading-orb {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            background: linear-gradient(
              135deg,
              #eff6ff,
              #dbeafe
            );
            box-shadow:
              0 10px 30px rgba(37, 99, 235, 0.12),
              inset 0 0 0 1px rgba(37, 99, 235, 0.08);
            animation: loadingFloat 1.8s ease-in-out infinite;
          }

          .loading-orb svg {
            animation: loadingSpin 1.2s linear infinite;
          }

          .loading-screen h3 {
            margin: 18px 0 5px;
            font-size: 20px;
            color: #111827;
          }

          .loading-screen p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }

          .loading-dots {
            display: flex;
            gap: 6px;
            margin-top: 18px;
          }

          .loading-dots span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2563eb;
            animation: dotPulse 1.2s ease-in-out infinite;
          }

          .loading-dots span:nth-child(2) {
            animation-delay: 0.15s;
          }

          .loading-dots span:nth-child(3) {
            animation-delay: 0.3s;
          }

          @keyframes loadingFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-7px);
            }
          }

          @keyframes loadingSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes dotPulse {
            0%, 100% {
              opacity: 0.3;
              transform: scale(0.75);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </Layout>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (!dashboard) {
    return (
      <Layout role="manager" active="Reports">
        <Crumbs items={["Reports", "MR-wise Progress"]} />

        <div className="animated-page error-screen">
          <div className="error-icon">
            <AlertCircle size={30} />
          </div>

          <h3>Failed to load data</h3>

          <p>Something went wrong while loading the MR progress report.</p>

          <Button onClick={handleRefresh} variant="primary">
            <RefreshCw size={16} />
            Retry
          </Button>
        </div>

        <style>{`
          .error-screen {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }

          .error-icon {
            width: 62px;
            height: 62px;
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dc2626;
            background: #fef2f2;
            margin-bottom: 15px;
          }

          .error-screen h3 {
            margin: 0 0 6px;
            color: #111827;
          }

          .error-screen p {
            margin: 0 0 18px;
            color: #6b7280;
            font-size: 14px;
          }
        `}</style>
      </Layout>
    );
  }

  // ==========================================================
  // STATS
  // ==========================================================

  const totalDoctors = dashboard.totalDoctors || 0;
  const approvedDoctors = dashboard.approvedDoctors || 0;
  const inputGiven = dashboard.inputGiven || 0;
  const pendingActions = dashboard.pendingActions || 0;
  const totalMRs = dashboard.totalMRs || 0;

  const statsData = [
    {
      title: "Total MRs",
      value: totalMRs,
      icon: Users,
      tone: "purple",
    },
    {
      title: "Doctors Registered",
      value: totalDoctors,
      icon: UserPlus,
      tone: "blue",
    },
    {
      title: "Approved Doctors",
      value: approvedDoctors,
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Input Given",
      value: inputGiven,
      icon: CalendarDays,
      tone: "orange",
    },
    {
      title: "Pending Actions",
      value: pendingActions,
      icon: Clock3,
      tone: "orange",
    },
  ];

  // ==========================================================
  // STAT STYLES
  // ==========================================================

  const statCardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: isMobile ? "16px 10px" : "24px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 5px 18px rgba(15,23,42,0.05)",
    flex: isMobile ? "0 0 140px" : "0 0 180px",
    scrollSnapAlign: "start",
  };

  const statTitleStyle = {
    fontSize: isMobile ? "13px" : "16px",
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: "4px",
  };

  const statValueStyle = {
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: 750,
    color: "#111827",
    margin: 0,
    letterSpacing: "-1px",
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <Layout role="manager" active="Reports">
      <div className="mr-progress-page">
        {/* Animated background decoration */}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />

        <Crumbs items={["Reports", "MR-wise Progress"]} />

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mr-header">
          <div className="header-glow" />

          <div className="header-content">
            <div className="title-block">
              <div className="title-badge">
                <Users size={15} />
                Team Analytics
              </div>

              <h1>MR-wise Progress</h1>

              <p className="subtitle">
                Track progress of your team members for this campaign.
              </p>
            </div>

            <div className="header-action">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "refresh-spinning" : ""}
                />

                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div
          className="scroll-x stats-container"
          style={{
            display: "flex",
            gap: isMobile ? "12px" : "20px",
            padding: "4px 0 18px",
            justifyContent: "center",
          }}
        >
          {statsData.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`stat-card stat-${stat.tone}`}
                style={{
                  ...statCardStyle,
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div className="stat-icon">
                  <Icon size={isMobile ? 24 : 30} />
                </div>

                <p style={statTitleStyle}>{stat.title}</p>

                <h3 style={statValueStyle}>{stat.value}</h3>

                <div className="stat-shine" />
              </div>
            );
          })}
        </div>

        {/* ==================================================
            DATA TABLE
        ================================================== */}

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <div className="report-title">
                <div className="report-title-icon">
                  <Users size={17} />
                </div>

                <div>
                  <h3>MR Performance</h3>

                  <span>Performance breakdown across your team</span>
                </div>
              </div>
            </div>

            <div className="report-live">
              <span className="live-dot" />
              Live Data
            </div>
          </div>

          <div className="table-wrapper">
            <DataTable
              headers={[
                "#",
                "MR Name",
                "Doctors Registered",
                "Approved Doctors (%)",
                "Input Given (%)",
                "Pending Actions",
                "Last Activity",
              ]}
              rows={
                dashboard.mrPerformance?.map((mr, i) => {
                  const total = mr.totalDoctors || 0;
                  const approved = mr.approvedDoctors || 0;
                  const inputGivenMR = mr.inputGivenDoctors || 0;
                  const approvedPercent = mr.approvedPercentage || 0;
                  const inputPercent = mr.inputGivenPercentage || 0;
                  const pending = mr.pendingDoctors || 0;

                  return [
                    i + 1,

                    <div key={`mr-${i}`} className="mr-name-cell">
                      <div className="mr-avatar">
                        {(mr.mrName || "M").charAt(0).toUpperCase()}
                      </div>

                      <span>{mr.mrName}</span>
                    </div>,

                    <div key={`total-${i}`} className="number-cell">
                      {total}
                    </div>,

                    <div key={`approved-${i}`} className="progress-cell">
                      <span>
                        {approved} ({approvedPercent}%)
                      </span>

                      <div className="animated-progress">
                        <ProgressBar value={approvedPercent} />
                      </div>
                    </div>,

                    <div key={`input-${i}`} className="progress-cell">
                      <span>
                        {inputGivenMR} ({inputPercent}%)
                      </span>

                      <div className="animated-progress">
                        <ProgressBar value={inputPercent} tone="orange" />
                      </div>
                    </div>,

                    <Badge
                      key={`pending-${i}`}
                      tone={pending > 5 ? "red" : "orange"}
                    >
                      {pending}
                    </Badge>,

                    <div key={`activity-${i}`} className="activity-cell">
                      <span className="activity-dot" />
                      {mr.lastActivity || new Date().toLocaleDateString()}
                    </div>,
                  ];
                }) || []
              }
            />
          </div>
        </div>

        {/* ==================================================
            STYLES
        ================================================== */}

        <style>{`

          /* ===============================================
             PAGE
          =============================================== */

          .mr-progress-page {
            position: relative;
            width: 100%;
            min-height: 100%;
            overflow: hidden;
            animation: pageEnter 0.55s ease both;
          }

          @keyframes pageEnter {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ===============================================
             BACKGROUND AMBIENT EFFECT
          =============================================== */

          .ambient {
            position: fixed;
            pointer-events: none;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.16;
            z-index: -1;
          }

          .ambient-one {
            width: 280px;
            height: 280px;
            background: #60a5fa;
            top: 80px;
            right: -100px;
            animation: ambientFloatOne 9s ease-in-out infinite;
          }

          .ambient-two {
            width: 240px;
            height: 240px;
            background: #a78bfa;
            bottom: 20px;
            left: -120px;
            animation: ambientFloatTwo 11s ease-in-out infinite;
          }

          @keyframes ambientFloatOne {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(-25px, 20px);
            }
          }

          @keyframes ambientFloatTwo {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(30px, -25px);
            }
          }

          /* ===============================================
             HEADER
          =============================================== */

          .mr-header {
            position: relative;
            margin: 8px 0 24px;
            border-radius: 22px;
            overflow: hidden;
            background:
              linear-gradient(
                135deg,
                #ffffff 0%,
                #f8fbff 100%
              );
            border: 1px solid #e5e7eb;
            box-shadow:
              0 10px 30px rgba(15, 23, 42, 0.05);
            animation: headerEnter 0.65s ease both;
          }

          .header-glow {
            position: absolute;
            width: 220px;
            height: 220px;
            right: -80px;
            top: -110px;
            border-radius: 50%;
            background: #dbeafe;
            filter: blur(25px);
            opacity: 0.65;
          }

          .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            padding: 25px 28px;
          }

          .title-block {
            min-width: 0;
          }

          .title-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 6px 10px;
            margin-bottom: 9px;
            border-radius: 999px;
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #dbeafe;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.3px;
            animation: badgeEnter 0.7s ease both;
          }

          .title-block h1 {
            margin: 0 0 7px;
            font-size: 34px;
            line-height: 1.15;
            font-weight: 750;
            letter-spacing: -1px;
            color: #111827;
          }

          .title-block .subtitle {
            margin: 0;
            font-size: 15px;
            color: #6b7280;
          }

          .header-action {
            flex-shrink: 0;
          }

          .header-action button {
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease,
              background 0.2s ease;
          }

          .header-action button:hover {
            transform: translateY(-2px);
            box-shadow:
              0 8px 20px rgba(37, 99, 235, 0.12);
          }

          .refresh-spinning {
            animation: refreshSpin 0.8s linear infinite;
          }

          @keyframes refreshSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes headerEnter {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes badgeEnter {
            from {
              opacity: 0;
              transform: translateY(-5px) scale(0.96);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* ===============================================
             STATS
          =============================================== */

          .stats-container {
            scrollbar-width: none;
            scroll-behavior: smooth;
          }

          .stats-container::-webkit-scrollbar {
            display: none;
          }

          .stat-card {
            position: relative;
            overflow: hidden;
            cursor: default;
            animation:
              statEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1)
              both;
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease,
              border-color 0.25s ease;
          }

          .stat-card:hover {
            transform: translateY(-7px);
            box-shadow:
              0 15px 35px rgba(15, 23, 42, 0.1);
          }

          .stat-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            opacity: 0.8;
          }

          .stat-purple::before {
            background: #8b5cf6;
          }

          .stat-blue::before {
            background: #2563eb;
          }

          .stat-green::before {
            background: #10b981;
          }

          .stat-orange::before {
            background: #f59e0b;
          }

          .stat-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            transition:
              transform 0.25s ease,
              box-shadow 0.25s ease;
          }

          .stat-card:hover .stat-icon {
            transform: translateY(-3px) scale(1.06);
          }

          .stat-purple .stat-icon {
            color: #7c3aed;
            background: #f3e8ff;
          }

          .stat-blue .stat-icon {
            color: #2563eb;
            background: #eff6ff;
          }

          .stat-green .stat-icon {
            color: #059669;
            background: #ecfdf5;
          }

          .stat-orange .stat-icon {
            color: #d97706;
            background: #fffbeb;
          }

          .stat-shine {
            position: absolute;
            width: 100px;
            height: 100px;
            top: -50px;
            right: -50px;
            border-radius: 50%;
            background: rgba(255,255,255,0.7);
            filter: blur(5px);
            transition: transform 0.5s ease;
          }

          .stat-card:hover .stat-shine {
            transform: translate(-25px, 25px);
          }

          @keyframes statEnter {
            from {
              opacity: 0;
              transform: translateY(15px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* ===============================================
             REPORT CARD
          =============================================== */

          .report-card {
            position: relative;
            margin-top: 8px;
            background: rgba(255,255,255,0.96);
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            overflow: hidden;
            box-shadow:
              0 8px 28px rgba(15, 23, 42, 0.055);
            animation: reportEnter 0.7s 0.25s ease both;
          }

          @keyframes reportEnter {
            from {
              opacity: 0;
              transform: translateY(18px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .report-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 19px 22px;
            border-bottom: 1px solid #eef2f7;
            background:
              linear-gradient(
                180deg,
                #ffffff,
                #fbfdff
              );
          }

          .report-title {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .report-title-icon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            background: #eff6ff;
            border: 1px solid #dbeafe;
          }

          .report-title h3 {
            margin: 0 0 3px;
            font-size: 16px;
            color: #111827;
          }

          .report-title span {
            display: block;
            font-size: 12px;
            color: #9ca3af;
          }

          .report-live {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            color: #059669;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
          }

          .live-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow:
              0 0 0 4px rgba(16, 185, 129, 0.12);
            animation: livePulse 1.8s ease-in-out infinite;
          }

          @keyframes livePulse {
            0%, 100% {
              box-shadow:
                0 0 0 3px rgba(16, 185, 129, 0.10);
            }

            50% {
              box-shadow:
                0 0 0 6px rgba(16, 185, 129, 0.03);
            }
          }

          .table-wrapper {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
          }

          .table-wrapper > * {
            min-width: 900px;
          }

          /* ===============================================
             TABLE CONTENT
          =============================================== */

          .mr-name-cell {
            display: flex;
            align-items: center;
            gap: 9px;
            font-weight: 600;
            color: #1f2937;
            transition:
              transform 0.2s ease,
              color 0.2s ease;
          }

          .mr-avatar {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #2563eb;
            background:
              linear-gradient(
                135deg,
                #eff6ff,
                #dbeafe
              );
            border: 1px solid #dbeafe;
            font-size: 12px;
            font-weight: 800;
            transition:
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .mr-name-cell:hover {
            transform: translateX(3px);
            color: #2563eb;
          }

          .mr-name-cell:hover .mr-avatar {
            transform: scale(1.08) rotate(-3deg);
            box-shadow:
              0 5px 14px rgba(37, 99, 235, 0.14);
          }

          .number-cell {
            font-weight: 700;
            color: #111827;
          }

          .progress-cell {
            min-width: 145px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .progress-cell > span {
            font-size: 12px;
            font-weight: 600;
            color: #4b5563;
          }

          .animated-progress {
            overflow: hidden;
            border-radius: 999px;
          }

          .animated-progress > * {
            animation: progressReveal 0.9s
              cubic-bezier(0.22, 1, 0.36, 1)
              both;
          }

          @keyframes progressReveal {
            from {
              opacity: 0;
              transform: scaleX(0);
              transform-origin: left;
            }

            to {
              opacity: 1;
              transform: scaleX(1);
              transform-origin: left;
            }
          }

          .activity-cell {
            display: flex;
            align-items: center;
            gap: 7px;
            color: #6b7280;
            font-size: 12px;
            white-space: nowrap;
          }

          .activity-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #2563eb;
            opacity: 0.8;
          }

          /* ===============================================
             DATA TABLE ROW HOVER
          =============================================== */

          .report-card :global(table) {
            border-collapse: separate;
            border-spacing: 0;
          }

          .report-card table tbody tr {
            transition:
              background 0.2s ease,
              transform 0.2s ease;
          }

          .report-card table tbody tr:hover {
            background: #f8fbff;
          }

          .report-card table tbody tr:hover td {
            border-color: #eef5ff;
          }

          /* ===============================================
             MOBILE
          =============================================== */

          @media (max-width: 768px) {

            .mr-progress-page {
              padding-bottom: 12px;
            }

            .mr-header {
              margin-top: 5px;
              margin-bottom: 16px;
              border-radius: 16px;
            }

            .header-content {
              padding: 18px 16px;
              align-items: flex-start;
            }

            .title-badge {
              font-size: 9px;
              padding: 5px 8px;
              margin-bottom: 7px;
            }

            .title-block h1 {
              font-size: 23px;
              letter-spacing: -0.6px;
            }

            .title-block .subtitle {
              font-size: 12px;
              line-height: 1.45;
              max-width: 260px;
            }

            .header-action button {
              min-width: 40px;
              min-height: 40px;
              padding: 8px;
            }

            .header-action button span {
              display: none;
            }

            .stats-container {
              justify-content: flex-start !important;
              gap: 8px !important;
              padding: 3px 0 13px !important;
              overflow-x: auto;
            }

            .stat-card {
              flex: 0 0 140px !important;
              padding: 13px 8px !important;
              border-radius: 15px !important;
            }

            .stat-card:hover {
              transform: translateY(-3px);
            }

            .stat-icon {
              width: 40px;
              height: 40px;
              border-radius: 12px;
              margin-bottom: 7px;
            }

            .stat p {
              font-size: 11px !important;
              margin-bottom: 2px !important;
            }

            .stat h3 {
              font-size: 25px !important;
            }

            .report-card {
              border-radius: 16px;
              margin-top: 4px;
            }

            .report-card-header {
              padding: 14px;
            }

            .report-title {
              gap: 9px;
            }

            .report-title-icon {
              width: 32px;
              height: 32px;
              border-radius: 10px;
            }

            .report-title h3 {
              font-size: 13px;
            }

            .report-title span {
              font-size: 9px;
            }

            .report-live {
              padding: 5px 7px;
              font-size: 9px;
            }

            .live-dot {
              width: 5px;
              height: 5px;
            }

            .table-wrapper {
              overflow-x: auto !important;
              -webkit-overflow-scrolling: touch;
            }

            .table-wrapper > * {
              min-width: 900px !important;
            }

            .mr-avatar {
              width: 27px;
              height: 27px;
              border-radius: 8px;
              font-size: 10px;
            }

            .progress-cell {
              min-width: 135px;
            }

            .progress-cell > span {
              font-size: 10px;
            }

            .activity-cell {
              font-size: 10px;
            }
          }

          /* ===============================================
             SMALL MOBILE
          =============================================== */

          @media (max-width: 480px) {

            .header-content {
              padding: 16px 13px;
            }

            .title-block h1 {
              font-size: 21px;
            }

            .title-block .subtitle {
              font-size: 11px;
            }

            .header-action button {
              min-width: 36px;
              min-height: 36px;
              padding: 7px;
            }

            .report-card-header {
              padding: 12px;
            }

            .report-title span {
              display: none;
            }

            .report-live {
              padding: 4px 6px;
            }
          }

          /* ===============================================
             REDUCED MOTION
          =============================================== */

          @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }

        `}</style>
      </div>
    </Layout>
  );
}

// ============================================================
// DELAY REPORT
// ============================================================

export function DelayReport({ role = "manager" }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedOverdue, setSelectedOverdue] = useState("all");

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  const fetchData = async () => {
    try {
      setRefreshing(true);

      const user = JSON.parse(localStorage.getItem("user"));

      let data;

      if (role === "manager") {
        if (user.role === "flm") {
          data = await getPendingApprovals(user.flmId);
        } else if (user.role === "slm") {
          data = await getSLMDoctors(user.slmId);
        } else if (user.role === "tlm") {
          data = await getTLMDoctors(user.tlmId);
        }
      }

      const doctorsList = data?.doctors || [];

      setDoctors(doctorsList);
      setFilteredData(doctorsList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [role]);

  // ==========================================================
  // FILTERS
  // ==========================================================

  useEffect(() => {
    let filtered = [...doctors];

    if (selectedStatus !== "all") {
      filtered = filtered.filter((d) => d.approvalStatus === selectedStatus);
    }

    if (selectedOverdue !== "all") {
      const now = new Date();

      filtered = filtered.filter((d) => {
        const daysPending = Math.floor(
          (now - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
        );

        if (selectedOverdue === "overdue") return daysPending > 7;

        if (selectedOverdue === "delayed")
          return daysPending > 3 && daysPending <= 7;

        if (selectedOverdue === "normal") return daysPending <= 3;

        return true;
      });
    }

    setFilteredData(filtered);
  }, [selectedStatus, selectedOverdue, doctors]);

  const handleRefresh = () => {
    fetchData();
  };

  const handleClearFilters = () => {
    setSelectedStatus("all");
    setSelectedOverdue("all");
  };

  const handleViewDoctor = (doctorId) => {
    navigate(`/doctor-details/${doctorId}`);
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const totalPending = filteredData.length;

  const overdueActions = filteredData.filter((d) => {
    const days = Math.floor(
      (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
    );

    return days > 7;
  }).length;

  const delayedActions = filteredData.filter((d) => {
    const days = Math.floor(
      (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
    );

    return days > 3 && days <= 7;
  }).length;

  const avgDelay =
    filteredData.length > 0
      ? Math.round(
          filteredData.reduce((sum, d) => {
            const days = Math.floor(
              (new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24),
            );

            return sum + days;
          }, 0) / filteredData.length,
        )
      : 0;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Layout
        role={role}
        active={role === "manager" ? "Pending Actions" : "Reports"}
      >
        <Crumbs
          items={[
            "Reports",
            role === "manager"
              ? "Team Delay / Pending Action"
              : "Pending Action Report",
          ]}
        />

        <div className="delay-loading">
          <div className="delay-loader-icon">
            <Clock3 size={28} />
          </div>

          <h3>Loading delay report</h3>

          <p>Analyzing pending actions and delays...</p>

          <div className="delay-loader-dots">
            <span />
            <span />
            <span />
          </div>
        </div>

        <style>{`
          .delay-loading {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
          }

          .delay-loader-icon {
            width: 64px;
            height: 64px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #f59e0b;
            background: #fffbeb;
            animation: delayFloat 1.8s ease-in-out infinite;
          }

          .delay-loader-icon svg {
            animation: delaySpin 2s linear infinite;
          }

          .delay-loading h3 {
            margin: 17px 0 5px;
            color: #111827;
          }

          .delay-loading p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }

          .delay-loader-dots {
            display: flex;
            gap: 6px;
            margin-top: 18px;
          }

          .delay-loader-dots span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #f59e0b;
            animation: delayDot 1.2s ease-in-out infinite;
          }

          .delay-loader-dots span:nth-child(2) {
            animation-delay: .15s;
          }

          .delay-loader-dots span:nth-child(3) {
            animation-delay: .3s;
          }

          @keyframes delayFloat {
            0%, 100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-7px);
            }
          }

          @keyframes delaySpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes delayDot {
            0%, 100% {
              opacity: .3;
              transform: scale(.75);
            }

            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </Layout>
    );
  }

  // ==========================================================
  // STAT CONFIG
  // ==========================================================

  const statsData = [
    {
      title: role === "manager" ? "Pending Approvals" : "Total Pending",
      value: totalPending,
      icon: Clock3,
      tone: "red",
    },
    {
      title: "Overdue Actions (>7 days)",
      value: overdueActions,
      icon: AlertCircle,
      tone: "orange",
    },
    {
      title: "Delayed Actions (3-7 days)",
      value: delayedActions,
      icon: Clock3,
      tone: "warning",
    },
    {
      title: "Normal Pending (<3 days)",
      value: totalPending - overdueActions - delayedActions,
      icon: CalendarDays,
      tone: "green",
    },
    {
      title: "Avg. Delay (Days)",
      value: `${avgDelay} Days`,
      icon: Info,
      tone: "purple",
    },
  ];

  const statCardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: isMobile ? "16px 10px" : "24px 16px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.96)",
    border: "1px solid #e5e7eb",
    boxShadow: "0 5px 18px rgba(15,23,42,0.05)",
    flex: isMobile ? "0 0 140px" : "0 0 180px",
    scrollSnapAlign: "start",
  };

  const statTitleStyle = {
    fontSize: isMobile ? "13px" : "16px",
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: "4px",
  };

  const statValueStyle = {
    fontSize: isMobile ? "28px" : "36px",
    fontWeight: 750,
    color: "#111827",
    margin: 0,
    letterSpacing: "-1px",
  };

  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <Layout
      role={role}
      active={role === "manager" ? "Pending Actions" : "Reports"}
    >
      <div className="delay-page">
        <div className="delay-ambient delay-ambient-one" />
        <div className="delay-ambient delay-ambient-two" />

        <Crumbs
          items={[
            "Reports",
            role === "manager"
              ? "Team Delay / Pending Action"
              : "Pending Action Report",
          ]}
        />

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="delay-header">
          <div className="delay-header-glow" />

          <div className="delay-header-content">
            <div>
              <div className="delay-title-badge">
                <Clock3 size={14} />
                Delay Analytics
              </div>

              <h1>
                {role === "manager"
                  ? "Team Delay / Pending Action Report"
                  : "Pending Action Report"}
              </h1>

              <p>
                Track pending actions and delays for{" "}
                {role === "manager"
                  ? "your team members"
                  : "each level to ensure timely approvals"}
                .
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "refresh-spinning-delay" : ""}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* ==================================================
            STATS
        ================================================== */}

        <div
          className="scroll-x delay-stats"
          style={{
            display: "flex",
            gap: isMobile ? "12px" : "20px",
            padding: "4px 0 18px",
            justifyContent: "center",
          }}
        >
          {statsData.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`delay-stat-card delay-${stat.tone}`}
                style={{
                  ...statCardStyle,
                  animationDelay: `${index * 90}ms`,
                }}
              >
                <div className="delay-stat-icon">
                  <Icon size={isMobile ? 24 : 30} />
                </div>

                <p style={statTitleStyle}>{stat.title}</p>

                <h3 style={statValueStyle}>{stat.value}</h3>

                <div className="delay-stat-shine" />
              </div>
            );
          })}
        </div>

        {/* ==================================================
            FILTER TOOLBAR
        ================================================== */}

        <div className="delay-filter-card">
          <div className="filter-heading">
            <div className="filter-heading-icon">
              <Filter size={16} />
            </div>

            <div>
              <strong>Filter Report</strong>
              <span>Narrow down pending actions</span>
            </div>
          </div>

          <div className="toolbar">
            <SelectBox
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                {
                  value: "all",
                  label: "All Status",
                },
                {
                  value: "pending",
                  label: "Pending",
                },
                {
                  value: "approved",
                  label: "Approved",
                },
              ]}
              wide={isMobile}
            />

            <SelectBox
              label="Overdue By"
              value={selectedOverdue}
              onChange={(e) => setSelectedOverdue(e.target.value)}
              options={[
                {
                  value: "all",
                  label: "All",
                },
                {
                  value: "normal",
                  label: "Normal (<3 days)",
                },
                {
                  value: "delayed",
                  label: "Delayed (3-7 days)",
                },
                {
                  value: "overdue",
                  label: "Overdue (>7 days)",
                },
              ]}
              wide={isMobile}
            />

            <div className="filter-buttons">
              <Button
                variant="outline"
                icon={Filter}
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>

              <Button icon={Filter} onClick={() => fetchData()}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="delay-report-card">
          <div className="delay-report-header">
            <div className="delay-report-title">
              <div className="delay-report-icon">
                <AlertCircle size={17} />
              </div>

              <div>
                <h3>Pending Actions</h3>

                <span>Showing {filteredData.length} records</span>
              </div>
            </div>

            <div className="delay-live">
              <span />
              Live Report
            </div>
          </div>

          <div className="delay-table-wrapper">
            <DataTable
              headers={[
                "#",
                "Doctor Name",
                "Speciality",
                "MCL Code",
                "Submitted By (MR)",
                "Submission Date",
                "Days Pending",
                "Status",
              ]}
              rows={filteredData.map((doctor, index) => {
                const daysPending = Math.floor(
                  (new Date() - new Date(doctor.createdAt)) /
                    (1000 * 60 * 60 * 24),
                );

                let statusText = "Pending";
                let statusTone = "orange";

                if (daysPending > 7) {
                  statusText = "Overdue";
                  statusTone = "red";
                } else if (daysPending > 3) {
                  statusText = "Delayed";
                  statusTone = "orange";
                } else {
                  statusText = "Normal";
                  statusTone = "green";
                }

                return [
                  index + 1,

                  <div key={`doctor-${index}`} className="doctor-name-cell">
                    <div className="doctor-avatar">
                      {(doctor.doctorName || "D").charAt(0).toUpperCase()}
                    </div>

                    <span>{doctor.doctorName}</span>
                  </div>,

                  doctor.speciality,

                  doctor.mclCode,

                  doctor.mr?.mrName || "N/A",

                  <div key={`date-${index}`} className="date-cell">
                    {new Date(doctor.createdAt).toLocaleDateString()}
                  </div>,

                  <Badge
                    key={`days-${index}`}
                    tone={
                      daysPending > 7
                        ? "red"
                        : daysPending > 3
                          ? "orange"
                          : "green"
                    }
                  >
                    {daysPending} days
                  </Badge>,

                  <Badge key={`status-${index}`} tone={statusTone}>
                    {statusText}
                  </Badge>,
                ];
              })}
            />
          </div>
        </div>

        {/* ==================================================
            DELAY STYLES
        ================================================== */}

        <style>{`

          .delay-page {
            position: relative;
            width: 100%;
            min-height: 100%;
            overflow: hidden;
            animation: delayPageEnter .55s ease both;
          }

          @keyframes delayPageEnter {
            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .delay-ambient {
            position: fixed;
            pointer-events: none;
            border-radius: 50%;
            filter: blur(85px);
            opacity: .12;
            z-index: -1;
          }

          .delay-ambient-one {
            width: 280px;
            height: 280px;
            background: #f59e0b;
            right: -100px;
            top: 100px;
            animation:
              delayAmbientOne 10s
              ease-in-out infinite;
          }

          .delay-ambient-two {
            width: 230px;
            height: 230px;
            background: #ef4444;
            left: -110px;
            bottom: 50px;
            animation:
              delayAmbientTwo 12s
              ease-in-out infinite;
          }

          @keyframes delayAmbientOne {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(-25px, 20px);
            }
          }

          @keyframes delayAmbientTwo {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(25px, -25px);
            }
          }

          /* HEADER */

          .delay-header {
            position: relative;
            overflow: hidden;
            margin: 8px 0 24px;
            border-radius: 22px;
            border: 1px solid #e5e7eb;
            background:
              linear-gradient(
                135deg,
                #ffffff,
                #fffdf8
              );
            box-shadow:
              0 10px 30px
              rgba(15, 23, 42, .05);
            animation:
              delayHeaderEnter .65s ease both;
          }

          .delay-header-glow {
            position: absolute;
            width: 230px;
            height: 230px;
            right: -100px;
            top: -120px;
            border-radius: 50%;
            background: #fef3c7;
            filter: blur(25px);
          }

          .delay-header-content {
            position: relative;
            z-index: 1;
            padding: 25px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .delay-title-badge {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 6px 10px;
            margin-bottom: 9px;
            border-radius: 999px;
            background: #fffbeb;
            color: #d97706;
            border: 1px solid #fde68a;
            font-size: 11px;
            font-weight: 700;
          }

          .delay-header h1 {
            margin: 0 0 7px;
            color: #111827;
            font-size: 34px;
            line-height: 1.15;
            font-weight: 750;
            letter-spacing: -1px;
          }

          .delay-header p {
            margin: 0;
            color: #6b7280;
            font-size: 15px;
          }

          .delay-header button {
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .delay-header button:hover {
            transform: translateY(-2px);
            box-shadow:
              0 8px 20px
              rgba(245, 158, 11, .12);
          }

          .refresh-spinning-delay {
            animation:
              delayRefreshSpin .8s
              linear infinite;
          }

          @keyframes delayRefreshSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes delayHeaderEnter {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* STATS */

          .delay-stats {
            scrollbar-width: none;
          }

          .delay-stats::-webkit-scrollbar {
            display: none;
          }

          .delay-stat-card {
            position: relative;
            overflow: hidden;
            animation:
              delayStatEnter .55s
              cubic-bezier(.22,1,.36,1)
              both;
            transition:
              transform .25s ease,
              box-shadow .25s ease;
          }

          .delay-stat-card:hover {
            transform: translateY(-7px);
            box-shadow:
              0 15px 35px
              rgba(15, 23, 42, .10);
          }

          .delay-stat-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
          }

          .delay-red::before {
            background: #ef4444;
          }

          .delay-orange::before {
            background: #f59e0b;
          }

          .delay-warning::before {
            background: #eab308;
          }

          .delay-green::before {
            background: #10b981;
          }

          .delay-purple::before {
            background: #8b5cf6;
          }

          .delay-stat-icon {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            transition:
              transform .25s ease;
          }

          .delay-stat-card:hover
          .delay-stat-icon {
            transform:
              translateY(-3px)
              scale(1.06);
          }

          .delay-red .delay-stat-icon {
            color: #dc2626;
            background: #fef2f2;
          }

          .delay-orange .delay-stat-icon {
            color: #d97706;
            background: #fffbeb;
          }

          .delay-warning .delay-stat-icon {
            color: #ca8a04;
            background: #fefce8;
          }

          .delay-green .delay-stat-icon {
            color: #059669;
            background: #ecfdf5;
          }

          .delay-purple .delay-stat-icon {
            color: #7c3aed;
            background: #f5f3ff;
          }

          .delay-stat-shine {
            position: absolute;
            width: 100px;
            height: 100px;
            top: -50px;
            right: -50px;
            border-radius: 50%;
            background: rgba(255,255,255,.75);
            filter: blur(5px);
            transition:
              transform .5s ease;
          }

          .delay-stat-card:hover
          .delay-stat-shine {
            transform:
              translate(-25px,25px);
          }

          @keyframes delayStatEnter {
            from {
              opacity: 0;
              transform:
                translateY(15px)
                scale(.97);
            }

            to {
              opacity: 1;
              transform:
                translateY(0)
                scale(1);
            }
          }

          /* FILTER CARD */

          .delay-filter-card {
            position: relative;
            margin: 8px 0 18px;
            padding: 17px 20px;
            border-radius: 18px;
            background:
              rgba(255,255,255,.96);
            border: 1px solid #e5e7eb;
            box-shadow:
              0 7px 24px
              rgba(15,23,42,.045);
            animation:
              filterEnter .65s .18s ease both;
          }

          @keyframes filterEnter {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .filter-heading {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 14px;
          }

          .filter-heading-icon {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            background: #eff6ff;
            border: 1px solid #dbeafe;
          }

          .filter-heading strong {
            display: block;
            font-size: 13px;
            color: #111827;
          }

          .filter-heading span {
            display: block;
            margin-top: 2px;
            font-size: 10px;
            color: #9ca3af;
          }

          .toolbar {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            align-items: flex-end;
          }

          .filter-buttons {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-left: auto;
          }

          .filter-buttons button {
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .filter-buttons button:hover {
            transform: translateY(-2px);
          }

          /* TABLE */

          .delay-report-card {
            overflow: hidden;
            border-radius: 20px;
            border: 1px solid #e5e7eb;
            background:
              rgba(255,255,255,.96);
            box-shadow:
              0 8px 28px
              rgba(15,23,42,.055);
            animation:
              delayTableEnter .7s .25s ease both;
          }

          @keyframes delayTableEnter {
            from {
              opacity: 0;
              transform: translateY(18px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .delay-report-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            padding: 19px 22px;
            border-bottom: 1px solid #eef2f7;
          }

          .delay-report-title {
            display: flex;
            align-items: center;
            gap: 11px;
          }

          .delay-report-icon {
            width: 38px;
            height: 38px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fee2e2;
          }

          .delay-report-title h3 {
            margin: 0 0 3px;
            font-size: 16px;
            color: #111827;
          }

          .delay-report-title span {
            font-size: 12px;
            color: #9ca3af;
          }

          .delay-live {
            display: flex;
            align-items: center;
            gap: 7px;
            padding: 6px 10px;
            border-radius: 999px;
            color: #059669;
            background: #ecfdf5;
            border: 1px solid #d1fae5;
            font-size: 11px;
            font-weight: 700;
          }

          .delay-live span {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow:
              0 0 0 4px
              rgba(16,185,129,.10);
            animation:
              delayLivePulse 1.8s
              ease-in-out infinite;
          }

          @keyframes delayLivePulse {
            0%, 100% {
              box-shadow:
                0 0 0 3px
                rgba(16,185,129,.10);
            }

            50% {
              box-shadow:
                0 0 0 6px
                rgba(16,185,129,.03);
            }
          }

          .delay-table-wrapper {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
          }

          .delay-table-wrapper > * {
            min-width: 900px;
          }

          .doctor-name-cell {
            display: flex;
            align-items: center;
            gap: 9px;
            font-weight: 600;
            color: #1f2937;
            transition:
              transform .2s ease,
              color .2s ease;
          }

          .doctor-avatar {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: #dc2626;
            background:
              linear-gradient(
                135deg,
                #fef2f2,
                #fee2e2
              );
            border: 1px solid #fee2e2;
            font-size: 12px;
            font-weight: 800;
            transition:
              transform .2s ease,
              box-shadow .2s ease;
          }

          .doctor-name-cell:hover {
            transform: translateX(3px);
            color: #dc2626;
          }

          .doctor-name-cell:hover
          .doctor-avatar {
            transform:
              scale(1.08)
              rotate(-3deg);
            box-shadow:
              0 5px 14px
              rgba(220,38,38,.13);
          }

          .date-cell {
            color: #6b7280;
            font-size: 12px;
            white-space: nowrap;
          }

          /* TABLE ROW HOVER */

          .delay-report-card table tbody tr {
            transition:
              background .2s ease;
          }

          .delay-report-card table tbody tr:hover {
            background: #fffaf5;
          }

          /* MOBILE */

          @media (max-width: 768px) {

            .delay-header {
              margin-top: 5px;
              margin-bottom: 16px;
              border-radius: 16px;
            }

            .delay-header-content {
              padding: 18px 16px;
              align-items: flex-start;
            }

            .delay-title-badge {
              font-size: 9px;
              padding: 5px 8px;
            }

            .delay-header h1 {
              font-size: 22px;
              letter-spacing: -.5px;
            }

            .delay-header p {
              font-size: 12px;
              line-height: 1.45;
              max-width: 270px;
            }

            .delay-header button {
              min-width: 40px;
              min-height: 40px;
              padding: 8px;
            }

            .delay-stats {
              justify-content: flex-start !important;
              gap: 8px !important;
              overflow-x: auto;
              padding: 3px 0 13px !important;
            }

            .delay-stat-card {
              flex: 0 0 140px !important;
              padding: 13px 8px !important;
              border-radius: 15px !important;
            }

            .delay-stat-card:hover {
              transform: translateY(-3px);
            }

            .delay-stat-icon {
              width: 40px;
              height: 40px;
              border-radius: 12px;
              margin-bottom: 7px;
            }

            .delay-stat-card p {
              font-size: 11px !important;
            }

            .delay-stat-card h3 {
              font-size: 25px !important;
            }

            .delay-filter-card {
              padding: 13px;
              border-radius: 16px;
              margin-top: 4px;
            }

            .filter-heading {
              margin-bottom: 11px;
            }

            .toolbar {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 9px !important;
            }

            .toolbar > * {
              width: 100% !important;
            }

            .filter-buttons {
              width: 100%;
              margin-left: 0;
              flex-direction: column;
            }

            .filter-buttons button {
              width: 100%;
            }

            .delay-report-card {
              border-radius: 16px;
            }

            .delay-report-header {
              padding: 13px;
            }

            .delay-report-title h3 {
              font-size: 13px;
            }

            .delay-report-title span {
              font-size: 9px;
            }

            .delay-report-icon {
              width: 32px;
              height: 32px;
              border-radius: 10px;
            }

            .delay-live {
              padding: 5px 7px;
              font-size: 9px;
            }

            .delay-table-wrapper > * {
              min-width: 900px !important;
            }

            .doctor-avatar {
              width: 27px;
              height: 27px;
              border-radius: 8px;
              font-size: 10px;
            }

            .date-cell {
              font-size: 10px;
            }
          }

          @media (max-width: 480px) {

            .delay-header-content {
              padding: 16px 13px;
            }

            .delay-header h1 {
              font-size: 20px;
            }

            .delay-header p {
              font-size: 11px;
            }

            .delay-report-header {
              padding: 12px;
            }

            .delay-report-title span {
              display: none;
            }
          }

          /* ACCESSIBILITY */

          @media (prefers-reduced-motion: reduce) {

            *,
            *::before,
            *::after {
              animation-duration: .01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: .01ms !important;
              scroll-behavior: auto !important;
            }
          }

        `}</style>
      </div>
    </Layout>
  );
}
