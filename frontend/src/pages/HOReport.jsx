import React from "react";
import {
  Users, CheckCircle2, Clock3, XCircle, ArrowLeft, Filter, Eye,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
} from "recharts";
import Layout from "../components/Layout";
import { StatCard, Panel, Button, SelectBox, DataTable, Crumbs, ProgressBar } from "../components/UIComponents";
import { mrs, palette } from "../utils/helpers";

function ChartPanel() {
  const data = [1, 7, 14, 21, 31].map((d, i) => ({
    name: `${d} May`,
    Registered: 3500 + i * 1000,
    Approved: 2500 + i * 500,
    Pending: 1000 + i * 250,
  }));
  return (
    <Panel title="Approval Trend (This Month)">
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Registered" stroke="#2563eb" />
          <Line type="monotone" dataKey="Approved" stroke="#16a34a" />
          <Line type="monotone" dataKey="Pending" stroke="#f59e0b" />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function PiePanel() {
  const data = [
    { name: "Approved", value: 78563 },
    { name: "Pending", value: 23154 },
    { name: "Rejected", value: 12845 },
    { name: "Sent Back", value: 11280 },
  ];
  return (
    <Panel title="Approval Summary by Status">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={60} outerRadius={95}>
            {data.map((_, i) => <Cell key={i} fill={palette[i]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Panel>
  );
}

export default function HOReport({ type = "summary" }) {
  const title = {
    summary: "Approval Summary Report",
    trend: "Approval Trend Report",
    hierarchy: "Hierarchy-wise Approval Report",
    mr: "MR-wise Approval Report",
  }[type];

  return (
    <Layout role="ho" active="Reports">
      <Crumbs items={["Reports", title]} />
      <h1>{title}</h1>
      <p className="subtitle">
        {type === "trend" ? "Track approval trend over time across hierarchy." : "Overview of doctor approvals across hierarchy and time period."}
      </p>
      <div className="grid cards5">
        <StatCard title="Doctors Registered" value={type === "trend" ? "25,842" : "125,842"} icon={Users} />
        <StatCard title="Doctors Approved" value={type === "trend" ? "16,245" : "78,563"} icon={CheckCircle2} tone="green" />
        <StatCard title="Pending" value={type === "trend" ? "5,120" : "23,154"} icon={Clock3} tone="orange" />
        <StatCard title="Rejected" value={type === "trend" ? "2,845" : "12,845"} icon={XCircle} tone="red" />
        <StatCard title="Sent Back / Correction" value={type === "trend" ? "1,632" : "11,280"} icon={ArrowLeft} tone="purple" />
      </div>
      <div className="toolbar">
        <SelectBox label="Hierarchy Level" />
        <SelectBox label="Zone" />
        <SelectBox label="Region" />
        <SelectBox label="Area" />
        <SelectBox label="MR HQ / Area" />
        <Button>Apply Filters</Button>
      </div>

      {type === "trend" ? (
        <DataTable
          headers={["Date","Registered","Approved","Pending","Rejected","Sent Back / Correction","Approval %"]}
          rows={Array.from({ length: 12 }).map((_, i) => [
            `${String(i + 1).padStart(2,"0")} May 2026`,
            3256 + i * 120, 2012 + i * 110, 642 + i * 27, 356 + i * 18, 246 + i * 8,
            <ProgressBar value={62 + (i % 3)} />,
          ])}
        />
      ) : type === "mr" ? (
        <DataTable
          headers={["#","MR Code","MR Name","MR HQ / Area","Registered","Approved","Pending","Rejected","Sent Back / Correction","Approval %","Action"]}
          rows={mrs.map((m, i) => [
            i+1, `MR100${i+1}`, m,
            ["Delhi HQ","Jaipur Area","Ahmedabad Area","Lucknow Area"][i % 4],
            320-i*12, 215-i*8, 60+i, 30-(i%5), 15+i*2,
            <ProgressBar value={67 - i} />, <Eye />,
          ])}
        />
      ) : (
        <>
          <DataTable
            headers={["#","Hierarchy Level","Registered","Approved","Approval %","Pending","Pending %","Rejected","Rejected %","Sent Back","Sent Back %"]}
            rows={["All India","Zones (6)","Regions (24)","Areas (98)","MR HQs (1,245)","MRs"].map((x, i) => [
              i+1, x, "125,842","78,563",<ProgressBar value={62} />,"23,154","18.40%","12,845","10.21%","11,280","8.97%",
            ])}
          />
          {type === "summary" && (
            <div className="two">
              <ChartPanel />
              <PiePanel />
            </div>
          )}
          {type === "hierarchy" && (
            <Panel title="Approval Distribution by Hierarchy">
              <div className="stacked">
                {["All India","Zones (6)","Regions (24)","Areas (98)","MR HQs (1,245)","MRs"].map((x) => (
                  <div key={x}>
                    <span>{x}</span>
                    <b style={{ width:"62%", background:"#16a34a" }}>62.42%</b>
                    <b style={{ width:"18%", background:"#f59e0b" }}>18.40%</b>
                    <b style={{ width:"10%", background:"#ef4444" }}>10.21%</b>
                    <b style={{ width:"9%", background:"#8b5cf6" }}>8.97%</b>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </Layout>
  );
}