import React from "react";
import { Users, CheckCircle2, CalendarDays, Clock3, ImageIcon, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import { StatCard, Panel, ListLine, Button, ProgressBar } from "../components/UIComponents";
import { palette } from "../utils/helpers";

function FunnelPanel() {
  const data = [
    { name: "Registered", v: 642 },
    { name: "Approved", v: 386 },
    { name: "Input Given", v: 214 },
    { name: "Calendar Frozen", v: 98 },
    { name: "Rejected", v: 18 },
  ];
  return (
    <Panel title="Campaign Progress Overview">
      <div className="funnel">
        {data.map((d, i) => (
          <div key={d.name} style={{ width: `${100 - i * 13}%`, background: palette[i] }}>{d.v}</div>
        ))}
      </div>
      <p>Conversion Rate (Registered to Input Given) <b className="blueText">33.33%</b></p>
    </Panel>
  );
}

function HierarchyTable() {
  return (
    <table className="mini">
      <tbody>
        {["All India","Zones (6)","Regions (24)","Areas (98)","MRs (1,245)"].map((x) => (
          <tr key={x}>
            <td>{x}</td>
            <td>125,842</td>
            <td>78,563</td>
            <td><ProgressBar value={62} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MiniRows({ red }) {
  return (
    <table className="mini">
      <tbody>
        {["North Region","West Region","South Region","East Region","Central Region"].map((x, i) => (
          <tr key={x}>
            <td>{x}</td>
            <td>{red ? ["Immediate","High","Medium","Low","Low"][i] : `${68 - i * 2}.60%`}</td>
            <td><ProgressBar value={68 - i * 2} tone={red ? "red" : "green"} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function HODashboard() {
  return (
    <Layout role="ho" active="Dashboard">
      <h1>HO National Dashboard</h1>
      <p className="subtitle">Overview of calendar campaign progress across India.</p>
      <div className="grid cards5">
        <StatCard title="Doctors Registered" value="125,842" icon={Users} />
        <StatCard title="Doctors Approved" value="78,563" icon={CheckCircle2} tone="green" />
        <StatCard title="Input Given" value="48,732" icon={CalendarDays} tone="orange" />
        <StatCard title="Calendars Finalized" value="31,409" icon={ImageIcon} tone="purple" />
        <StatCard title="Pending Actions" value="23,154" icon={Clock3} tone="red" />
      </div>
      <div className="three">
        <FunnelPanel />
        <Panel title="Approvals by Hierarchy"><HierarchyTable /></Panel>
        <Panel title="Approvals by Zone">
          <div className="mapIndia">INDIA MAP</div>
          <Button variant="outline">View Zone Wise Report</Button>
        </Panel>
      </div>
      <div className="three">
        <Panel title="Top 5 Regions by Approval %"><MiniRows /></Panel>
        <Panel title="Recent Pending Actions (Top 5)"><MiniRows red /></Panel>
        <Panel title="Quick Links">
          {[
            "Doctor Approval Queue","Campaign Funnel / Progress","Calendar Design Library",
            "Consent / Photo / Input Tracker","Hierarchy-wise Reports","Export Reports",
          ].map((x) => (
            <ListLine key={x} icon={ArrowRight} title={x} />
          ))}
        </Panel>
      </div>
    </Layout>
  );
}