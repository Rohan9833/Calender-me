import React from "react";
import { useEffect, useState } from "react";
import { getDashboardData } from "../api/doctorAPI";
import {
  Users,
  Send,
  CheckCircle2,
  Camera,
  CalendarDays,
  Hand,
  Clock3,
  XCircle,
  FileText,
  UserPlus,
  Building2,
  Download,
} from "lucide-react";
import Layout from "../components/Layout";
import {
  StatCard,
  Badge,
  Button,
  Toolbar,
  Actions,
  DataTable,
  Crumbs,
} from "../components/UIComponents";
import { mrDoctors } from "../utils/helpers";

export default function DoctorList({ type = "draft" }) {
  const [doctorData, setDoctorData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const data = await getDashboardData(user.mrId);

        if (type === "draft") {
          setDoctorData(data.draftDoctors);
        }

        if (type === "submitted") {
          setDoctorData(data.submittedDoctors);
        }

        if (type === "approved") {
          setDoctorData(data.approvedDoctors);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [type]);
  if (loading) {
    return <div>Loading...</div>;
  }
  const titles = {
    draft: "Draft Doctors",
    submitted: "Submitted Doctors",
    approved: "Approved Doctors",
  };

  return (
    <Layout active="My Doctors">
      <Crumbs items={["My Doctors", titles[type]]} />
      <div className="pageHead">
        <div>
          <h1>{titles[type]}</h1>
          <p className="subtitle">
            {type === "draft"
              ? "Below are the doctors you've added and saved as draft."
              : type === "submitted"
                ? "Below are the doctors you've submitted for approval."
                : "Below are the doctors approved by Manager / HO."}
          </p>
        </div>
        {type === "draft" ? (
          <Button icon={UserPlus}>Add New Doctor</Button>
        ) : (
          <Button variant="outline" icon={Download}>
            Export
          </Button>
        )}
      </div>

      <div className="grid cards4">
        {type === "approved"
          ? [
              ["Total Approved", 45, Users, "green"],
              ["Approved (This Month)", 12, Building2, "blue"],
              ["Photo Uploaded", 31, Camera, "purple"],
              ["Calendar Frozen", 22, CalendarDays, "orange"],
              ["Input Given", 16, Hand, "green"],
            ].map((a) => (
              <StatCard
                key={a[0]}
                title={a[0]}
                value={a[1]}
                icon={a[2]}
                tone={a[3]}
                sub="View Details →"
              />
            ))
          : type === "submitted"
            ? [
                ["Total Submitted", doctorData.length, Send, "purple"],
                ["Pending Approval", 14, Clock3, "orange"],
                ["Approved", 3, CheckCircle2, "green"],
                ["Rejected / Returned", 1, XCircle, "red"],
              ].map((a) => (
                <StatCard
                  key={a[0]}
                  title={a[0]}
                  value={a[1]}
                  icon={a[2]}
                  tone={a[3]}
                />
              ))
            : [
                <StatCard
                  key="draft"
                  title="Draft Doctors Summary"
                  value={doctorData.length}
                  icon={FileText}
                  tone="blue"
                />,
              ]}
      </div>

      <Toolbar />

      <DataTable
        headers={
          type === "approved"
            ? [
                "Doctor Name",
                "Speciality",
                "MCL Code",
                "Approved On",
                "Approved By",
                "Current Status",
                "Next Action",
                "Actions",
              ]
            : [
                "Doctor Name",
                "Speciality",
                "MCL Code",
                type === "draft" ? "City" : "Submitted On",
                type === "draft" ? "Date Saved" : "Status",
                type === "draft" ? "Added By" : "Submitted By",
                "Actions",
              ]
        }
        rows={doctorData.map((doctor, i) =>
          type === "approved"
            ? [
                doctor.doctorName,
                doctor.speciality,
                doctor.mclCode,
                new Date(doctor.updatedAt).toLocaleDateString(),
                "Manager",
                doctor.approvalStatus || "-",
                "-",
                <Actions key={i} />,
              ]
            : [
                doctor.doctorName,
                doctor.speciality,
                doctor.mclCode,

                type === "draft"
                  ? doctor.city
                  : new Date(doctor.createdAt).toLocaleDateString(),

                type === "draft" ? (
                  <Badge tone="blue">Draft</Badge>
                ) : doctor.approvalStatus === "approved" ? (
                  <Badge tone="green">Approved</Badge>
                ) : (
                  <Badge tone="orange">Pending Approval</Badge>
                ),

                "You",

                <Actions key={i} edit={type === "draft"} />,
              ],
        )}
      />
    </Layout>
  );
}
