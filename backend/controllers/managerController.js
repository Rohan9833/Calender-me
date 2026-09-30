const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");
const MR = require("../models/MR");
const Doctor = require("../models/Doctor");
const Activity = require("../models/activitymodel");
const CalendarSelection = require("../models/CalendarSelection");


const attachCalendarStatus = async (doctors) => {
  return Promise.all(
    doctors.map(async (doctor) => {
      const calendar = await CalendarSelection.findOne({
        doctor: doctor._id,
        year: 2027,
      });

      return {
        ...doctor.toObject(),
        calendarStatus: calendar ? calendar.status : "not_started",
        calendarFrozen: calendar
          ? calendar.status === "frozen" || doctor.calendarFrozen === true
          : doctor.calendarFrozen === true,
        inputGiven: calendar?.inputGiven || doctor.inputGiven || false,
        inputGivenAt: calendar?.inputGivenAt || doctor.inputGivenAt || null,
      };
    })
  );
};

// =====================================
// FLM DOCTORS
// =====================================

const getFLMDoctors = async (req, res) => {
  try {
    const { flmId } = req.params;

    const flm = await FLM.findOne({ flmId });

    if (!flm) {
      return res.status(404).json({
        success: false,
        message: "FLM not found",
      });
    }

    const mrs = await MR.find({
      flm: flm._id,
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    }).populate("mr", "mrName mrId");

    const doctorsWithCalendar = await attachCalendarStatus(doctors);

    res.status(200).json({
      success: true,
      count: doctorsWithCalendar.length,
      doctors: doctorsWithCalendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Return only the MRs that belong to the requesting FLM.
// Used by the FLM doctor-creation screen to prevent cross-team assignment.
const getFLMMRs = async (req, res) => {
  try {
    const { flmId } = req.params;

    const flm = await FLM.findOne({ flmId });

    if (!flm) {
      return res.status(404).json({
        success: false,
        message: "FLM not found",
      });
    }

    const mrs = await MR.find({ flm: flm._id })
      .select("_id mrId mrName hq region zone businessUnit")
      .sort({ mrName: 1 });

    return res.status(200).json({
      success: true,
      count: mrs.length,
      mrs,
    });
  } catch (error) {
    console.error("Error getting FLM MRs:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      mrs: [],
    });
  }
};


// Return the MRs a manager is allowed to act on behalf of.
// =====================================
// SLM DOCTORS
// =====================================

const getSLMDoctors = async (req, res) => {
  try {
    const { slmId } = req.params;

    const slm = await SLM.findOne({ slmId });

    if (!slm) {
      return res.status(404).json({
        success: false,
        message: "SLM not found",
      });
    }

    const flms = await FLM.find({
      slm: slm._id,
    });

    const flmIds = flms.map((flm) => flm._id);

    const mrs = await MR.find({
      flm: { $in: flmIds },
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    }).populate("mr", "mrName mrId");

    const doctorsWithCalendar = await attachCalendarStatus(doctors);

    res.status(200).json({
      success: true,
      count: doctorsWithCalendar.length,
      doctors: doctorsWithCalendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================
// TLM DOCTORS
// =====================================

const getTLMDoctors = async (req, res) => {
  try {
    const { tlmId } = req.params;

    const tlm = await TLM.findOne({ tlmId });

    if (!tlm) {
      return res.status(404).json({
        success: false,
        message: "TLM not found",
      });
    }

    const slms = await SLM.find({
      tlm: tlm._id,
    });

    const slmIds = slms.map((slm) => slm._id);

    const flms = await FLM.find({
      slm: { $in: slmIds },
    });

    const flmIds = flms.map((flm) => flm._id);

    const mrs = await MR.find({
      flm: { $in: flmIds },
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    }).populate("mr", "mrName mrId");

    const doctorsWithCalendar = await attachCalendarStatus(doctors);

    res.status(200).json({
      success: true,
      count: doctorsWithCalendar.length,
      doctors: doctorsWithCalendar,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// api/managerAPI.js - Add this function
// Add this CORRECT function to managerController.js (replace the incorrect one)
const getPendingActions = async (req, res) => {
  try {
    const userRole = req.headers["x-user-role"];
    const userId = req.headers["x-user-id"];

    if (!userRole) {
      return res.status(400).json({
        success: false,
        message: "User role is required",
        actions: [],
      });
    }

    let mrIds = [];

    if (userRole === "flm") {
      const flm = await FLM.findOne({ flmId: userId });
      if (!flm) return res.status(404).json({ success: false, message: "FLM not found", actions: [] });

      const mrs = await MR.find({ flm: flm._id });
      mrIds = mrs.map((mr) => mr._id);
    } else if (userRole === "slm") {
      const slm = await SLM.findOne({ slmId: userId });
      if (!slm) return res.status(404).json({ success: false, message: "SLM not found", actions: [] });

      const flms = await FLM.find({ slm: slm._id });
      const flmIds = flms.map((flm) => flm._id);
      const mrs = await MR.find({ flm: { $in: flmIds } });
      mrIds = mrs.map((mr) => mr._id);
    } else if (userRole === "tlm") {
      const tlm = await TLM.findOne({ tlmId: userId });
      if (!tlm) return res.status(404).json({ success: false, message: "TLM not found", actions: [] });

      const slms = await SLM.find({ tlm: tlm._id });
      const slmIds = slms.map((slm) => slm._id);
      const flms = await FLM.find({ slm: { $in: slmIds } });
      const flmIds = flms.map((flm) => flm._id);
      const mrs = await MR.find({ flm: { $in: flmIds } });
      mrIds = mrs.map((mr) => mr._id);
    } else if (userRole === "ho") {
      const doctors = await Doctor.find({ status: { $ne: "draft" } })
        .select("doctorName speciality city approvalStatus calendarSelected calendarFrozen inputGivenStatus")
        .sort({ updatedAt: -1 });

      return res.status(200).json({
        success: true,
        actions: buildPendingActions(doctors),
      });
    } else {
      return res.status(200).json({ success: true, actions: [] });
    }

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    })
      .select("doctorName speciality city approvalStatus calendarSelected calendarFrozen inputGivenStatus")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      actions: buildPendingActions(doctors),
    });
  } catch (error) {
    console.error("Error getting pending actions:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      actions: [],
    });
  }
};

function buildPendingActions(doctors) {
  const pendingApprovals = doctors.filter(
    (doctor) => doctor.approvalStatus === "pending",
  );

  const pendingFreeze = doctors.filter(
    (doctor) => doctor.calendarSelected === true && doctor.calendarFrozen !== true,
  );

  const actions = [];

  if (pendingApprovals.length > 0) {
    actions.push({
      id: "pending-approvals",
      title: "Doctors awaiting approval",
      description: "Submitted by MRs and waiting for manager approval",
      count: pendingApprovals.length,
      route: "/manager/approvals",
      icon: "approval",
      items: pendingApprovals.slice(0, 10).map((doctor) => ({
        id: doctor._id,
        name: doctor.doctorName,
        speciality: doctor.speciality,
        city: doctor.city,
      })),
    });
  }

  if (pendingFreeze.length > 0) {
    actions.push({
      id: "pending-freeze",
      title: "Calendars pending freeze",
      description: "Calendar selections are complete but not frozen",
      count: pendingFreeze.length,
      route: "/manager/calendar-designs",
      icon: "calendar",
      items: pendingFreeze.slice(0, 10).map((doctor) => ({
        id: doctor._id,
        name: doctor.doctorName,
        speciality: doctor.speciality,
        city: doctor.city,
      })),
    });
  }

  const inputGivenPending = doctors.filter(
    (doctor) => doctor.calendarFrozen === true && doctor.inputGivenStatus === "pending",
  );

  if (inputGivenPending.length > 0) {
    actions.push({
      id: "input-given-pending",
      title: "Input given pending",
      description: "Frozen calendars are waiting to be marked as input given",
      count: inputGivenPending.length,
      route: "/manager/input-given",
      icon: "input",
      items: inputGivenPending.slice(0, 10).map((doctor) => ({
        id: doctor._id,
        name: doctor.doctorName,
        speciality: doctor.speciality,
        city: doctor.city,
      })),
    });
  }

  return actions;
}

const getPendingActionsCount = async (req, res) => {
  try {
    // Get user info from headers (sent from frontend)
    const userRole = req.headers['x-user-role'];
    const userId = req.headers['x-user-id'];
    
    console.log("Getting pending count for:", { userRole, userId });
    
    let pendingCount = 0;
    
    if (userRole === "flm") {
      const flm = await FLM.findOne({ flmId: userId });
      if (flm) {
        const mrs = await MR.find({ flm: flm._id });
        const mrIds = mrs.map(mr => mr._id);
        const doctors = await Doctor.find({
          mr: { $in: mrIds },
          status: { $ne: "draft" }
        });
        
        const pendingApprovals = doctors.filter(d => d.approvalStatus === "pending").length;
        const pendingFreeze = doctors.filter(d => d.calendarSelected === true && d.calendarFrozen !== true).length;
        const inputGivenPending = doctors.filter(d => d.calendarFrozen === true && d.inputGivenStatus === "pending").length;
        pendingCount = pendingApprovals + pendingFreeze + inputGivenPending;
      }
    } else if (userRole === "slm") {
      const slm = await SLM.findOne({ slmId: userId });
      if (slm) {
        const flms = await FLM.find({ slm: slm._id });
        const flmIds = flms.map(flm => flm._id);
        const mrs = await MR.find({ flm: { $in: flmIds } });
        const mrIds = mrs.map(mr => mr._id);
        const doctors = await Doctor.find({
          mr: { $in: mrIds },
          status: { $ne: "draft" }
        });
        
        const pendingApprovals = doctors.filter(d => d.approvalStatus === "pending").length;
        const pendingFreeze = doctors.filter(d => d.calendarSelected === true && d.calendarFrozen !== true).length;
        const inputGivenPending = doctors.filter(d => d.calendarFrozen === true && d.inputGivenStatus === "pending").length;
        pendingCount = pendingApprovals + pendingFreeze + inputGivenPending;
      }
    } else if (userRole === "tlm") {
      const tlm = await TLM.findOne({ tlmId: userId });
      if (tlm) {
        const slms = await SLM.find({ tlm: tlm._id });
        const slmIds = slms.map(slm => slm._id);
        const flms = await FLM.find({ slm: { $in: slmIds } });
        const flmIds = flms.map(flm => flm._id);
        const mrs = await MR.find({ flm: { $in: flmIds } });
        const mrIds = mrs.map(mr => mr._id);
        const doctors = await Doctor.find({
          mr: { $in: mrIds },
          status: { $ne: "draft" }
        });
        
        const pendingApprovals = doctors.filter(d => d.approvalStatus === "pending").length;
        const pendingFreeze = doctors.filter(d => d.calendarSelected === true && d.calendarFrozen !== true).length;
        const inputGivenPending = doctors.filter(d => d.calendarFrozen === true && d.inputGivenStatus === "pending").length;
        pendingCount = pendingApprovals + pendingFreeze + inputGivenPending;
      }
    }
    
    console.log("Pending count calculated:", pendingCount);
    
    res.status(200).json({
      success: true,
      count: pendingCount
    });
  } catch (error) {
    console.error("Error getting pending actions count:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      count: 0
    });
  }
};

const getFLMDashboard = async (req, res) => {
  try {
    const { flmId } = req.params;

    const flm = await FLM.findOne({
      flmId,
    });

    if (!flm) {
      return res.status(404).json({
        success: false,
        message: "FLM not found",
      });
    }

    const mrs = await MR.find({
      flm: flm._id,
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    });

    const approvedDoctors = doctors.filter(
      (d) => d.approvalStatus === "approved",
    );

    const pendingDoctors = doctors.filter(
      (d) => d.approvalStatus === "pending",
    );

    const rejectedDoctors = doctors.filter(
      (d) => d.approvalStatus === "rejected",
    );

    const inputGivenDoctors = doctors.filter(
      (d) => d.inputGivenStatus === "completed",
    );

    const pendingApprovals = doctors.filter(
      (d) => d.approvalStatus === "pending",
    );

    const pendingFreeze = doctors.filter(
      (d) => d.calendarSelected === true && d.calendarFrozen === false,
    );

    const inputGivenPending = doctors.filter(
      (d) => d.calendarFrozen === true && d.inputGivenStatus === "pending",
    );

    const mrPerformance = await Promise.all(
      mrs.map(async (mr) => {
        const mrDoctors = await Doctor.find({
          mr: mr._id,
          status: { $ne: "draft" },
        });

        const totalDoctors = mrDoctors.length;

        const approvedDoctors = mrDoctors.filter(
          (d) => d.approvalStatus === "approved",
        ).length;

        const inputGivenDoctors = mrDoctors.filter(
          (d) => d.inputGivenStatus === "completed",
        ).length;

        const pendingDoctors = mrDoctors.filter(
          (d) => d.approvalStatus === "pending",
        ).length;

        return {
          mrName: mr.mrName,

          totalDoctors,

          approvedDoctors,

          approvedPercentage:
            totalDoctors > 0
              ? Math.round((approvedDoctors / totalDoctors) * 100)
              : 0,

          inputGivenDoctors,

          inputGivenPercentage:
            totalDoctors > 0
              ? Math.round((inputGivenDoctors / totalDoctors) * 100)
              : 0,

          pendingDoctors,
        };
      }),
    );
    const recentActivities = await Activity.find({
      doctor: { $in: doctors.map((doctor) => doctor._id) },
    })
      .populate("doctor", "doctorName")
      .sort({
        createdAt: -1,
      })
      .limit(5);
    res.status(200).json({
      success: true,

      totalMRs: mrs.length,

      totalDoctors: doctors.length,

      approvedDoctors: approvedDoctors.length,

      inputGiven: inputGivenDoctors.length,

      pendingActions:
        pendingDoctors.length + pendingFreeze.length + inputGivenPending.length,

      rejectedDoctors: rejectedDoctors.length,

      pendingApprovals: pendingApprovals.length,

      pendingFreeze: pendingFreeze.length,

      inputGivenPending: inputGivenPending.length,

      recentActivities,

      recentDoctors: doctors
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),

      mrPerformance,

      funnel: {
        registered: doctors.length,

        approved: approvedDoctors.length,

        inputGiven: inputGivenDoctors.length,

        frozen: doctors.filter((d) => d.calendarFrozen).length,

        rejected: rejectedDoctors.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const updateDoctorApproval = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { approvalStatus, approvedBy, approvedByRole } = req.body;

    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid approval status",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // A TLM rejection cannot be reversed by FLM or SLM.
    // TLM can change its own decision, and HO can override it.
    if (
      doctor.approvalStatus === "rejected" &&
      doctor.approvedByRole === "tlm" &&
      approvedByRole !== "tlm" &&
      approvedByRole !== "ho"
    ) {
      return res.status(403).json({
        success: false,
        message: "This doctor was disapproved by TLM. FLM and SLM cannot approve it again.",
        lockedByRole: "tlm",
      });
    }

    // Update approval status
    doctor.approvalStatus = approvalStatus;
    doctor.approvedAt = new Date();
    doctor.approvedBy = approvedBy;
    doctor.approvedByRole = approvedByRole;
    
    if (approvalStatus === "approved") {
      doctor.status = "approved";
    } else if (approvalStatus === "rejected") {
      doctor.status = "rejected";
    }
    
    await doctor.save();
    
    // ─── CREATE ACTIVITY LOG ──────────────────────────
    try {
      // Get user name
      let userName = "Manager";
      let userRole = approvedByRole;
      
      if (approvedByRole === "flm") {
        const flm = await FLM.findById(approvedBy);
        if (flm) userName = flm.flmName;
      } else if (approvedByRole === "slm") {
        const slm = await SLM.findById(approvedBy);
        if (slm) userName = slm.slmName;
      } else if (approvedByRole === "tlm") {
        const tlm = await TLM.findById(approvedBy);
        if (tlm) userName = tlm.tlmName;
      } else {
        const mr = await MR.findById(approvedBy);
        if (mr) userName = mr.mrName;
      }
      
      await Activity.create({
        action: `${approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}: ${doctor.doctorName}`,
        doctor: doctor._id,
        mr: doctor.mr,
        flm: approvedByRole === "flm" ? approvedBy : null,
        performedBy: approvedBy,
        role: approvedByRole,
        status: approvalStatus === "approved" ? "Completed" : "Rejected",
        details: `Doctor ${approvalStatus} by ${userName} (${approvedByRole.toUpperCase()})`
      });
      
      console.log(`✅ Activity logged: ${approvalStatus} - ${doctor.doctorName}`);
    } catch (err) {
      console.log("⚠️ Error logging activity:", err.message);
    }
    
    await doctor.populate('mr', 'mrName mrId');

    res.status(200).json({
      success: true,
      message: `Doctor ${approvalStatus}`,
      doctor,
    });
  } catch (error) {
    console.error("Error updating doctor approval:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getPendingApprovals = async (req, res) => {
  try {
    const { flmId } = req.params;

    const flm = await FLM.findOne({
      flmId,
    });

    const mrs = await MR.find({
      flm: flm._id,
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: {
        $in: mrIds,
      },

      approvalStatus: "pending",
    }).populate("mr", "mrName mrId");

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getSLMDashboard = async (req, res) => {
  try {
    const { slmId } = req.params;

    const slm = await SLM.findOne({
      slmId,
    });

    if (!slm) {
      return res.status(404).json({
        success: false,
        message: "SLM not found",
      });
    }

    const flms = await FLM.find({
      slm: slm._id,
    });

    const flmIds = flms.map((flm) => flm._id);

    const mrs = await MR.find({
      flm: { $in: flmIds },
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    });

    const approvedDoctors = doctors.filter(
      (d) => d.approvalStatus === "approved",
    );

    const pendingDoctors = doctors.filter(
      (d) => d.approvalStatus === "pending",
    );

    const rejectedDoctors = doctors.filter(
      (d) => d.approvalStatus === "rejected",
    );

    const inputGivenDoctors = doctors.filter(
      (d) => d.inputGivenStatus === "completed",
    );

    const pendingFreeze = doctors.filter(
      (d) => d.calendarSelected === true && d.calendarFrozen === false,
    );

    const inputGivenPending = doctors.filter(
      (d) => d.calendarFrozen === true && d.inputGivenStatus === "pending",
    );

    const mrPerformance = await Promise.all(
      mrs.map(async (mr) => {
        const mrDoctors = await Doctor.find({
          mr: mr._id,
          status: { $ne: "draft" },
        });

        const totalDoctors = mrDoctors.length;

        const approvedDoctors = mrDoctors.filter(
          (d) => d.approvalStatus === "approved",
        ).length;

        const inputGivenDoctors = mrDoctors.filter(
          (d) => d.inputGivenStatus === "completed",
        ).length;

        const pendingDoctors = mrDoctors.filter(
          (d) => d.approvalStatus === "pending",
        ).length;

        return {
          mrName: mr.mrName,

          totalDoctors,

          approvedDoctors,

          approvedPercentage:
            totalDoctors > 0
              ? Math.round((approvedDoctors / totalDoctors) * 100)
              : 0,

          inputGivenDoctors,

          inputGivenPercentage:
            totalDoctors > 0
              ? Math.round((inputGivenDoctors / totalDoctors) * 100)
              : 0,

          pendingDoctors,
        };
      }),
    );

    const recentActivities = await Activity.find({
      doctor: { $in: doctors.map((doctor) => doctor._id) },
    })
      .populate("doctor", "doctorName")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.status(200).json({
      success: true,

      totalMRs: mrs.length,

      totalDoctors: doctors.length,

      approvedDoctors: approvedDoctors.length,

      inputGiven: inputGivenDoctors.length,

      pendingActions:
        pendingDoctors.length + pendingFreeze.length + inputGivenPending.length,

      rejectedDoctors: rejectedDoctors.length,

      pendingApprovals: pendingDoctors.length,

      pendingFreeze: pendingFreeze.length,

      inputGivenPending: inputGivenPending.length,

      recentActivities,

      recentDoctors: doctors
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),

      mrPerformance,

      funnel: {
        registered: doctors.length,

        approved: approvedDoctors.length,

        inputGiven: inputGivenDoctors.length,

        frozen: doctors.filter((d) => d.calendarFrozen).length,

        rejected: rejectedDoctors.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const getTLMDashboard = async (req, res) => {
  try {
    const { tlmId } = req.params;

    const tlm = await TLM.findOne({
      tlmId,
    });

    if (!tlm) {
      return res.status(404).json({
        success: false,
        message: "TLM not found",
      });
    }

    const slms = await SLM.find({
      tlm: tlm._id,
    });

    const slmIds = slms.map((slm) => slm._id);

    const flms = await FLM.find({
      slm: { $in: slmIds },
    });

    const flmIds = flms.map((flm) => flm._id);

    const mrs = await MR.find({
      flm: { $in: flmIds },
    });

    const mrIds = mrs.map((mr) => mr._id);

    const doctors = await Doctor.find({
      mr: { $in: mrIds },
      status: { $ne: "draft" },
    });

    const approvedDoctors = doctors.filter(
      (d) => d.approvalStatus === "approved",
    );

    const pendingDoctors = doctors.filter(
      (d) => d.approvalStatus === "pending",
    );

    const rejectedDoctors = doctors.filter(
      (d) => d.approvalStatus === "rejected",
    );

    const inputGivenDoctors = doctors.filter(
      (d) => d.inputGivenStatus === "completed",
    );

    const pendingFreeze = doctors.filter(
      (d) => d.calendarSelected === true && d.calendarFrozen === false,
    );

    const inputGivenPending = doctors.filter(
      (d) => d.calendarFrozen === true && d.inputGivenStatus === "pending",
    );

    const recentActivities = await Activity.find({
      doctor: { $in: doctors.map((doctor) => doctor._id) },
    })
      .populate("doctor", "doctorName")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.status(200).json({
      success: true,

      totalMRs: mrs.length,

      totalDoctors: doctors.length,

      approvedDoctors: approvedDoctors.length,

      inputGiven: inputGivenDoctors.length,

      pendingActions:
        pendingDoctors.length + pendingFreeze.length + inputGivenPending.length,

      rejectedDoctors: rejectedDoctors.length,

      pendingApprovals: pendingDoctors.length,

      pendingFreeze: pendingFreeze.length,

      inputGivenPending: inputGivenPending.length,

      recentActivities,

      recentDoctors: doctors
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5),

      mrPerformance: [],

      funnel: {
        registered: doctors.length,

        approved: approvedDoctors.length,

        inputGiven: inputGivenDoctors.length,

        frozen: doctors.filter((d) => d.calendarFrozen).length,

        rejected: rejectedDoctors.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getFLMDoctors,
  getFLMMRs,
  getSLMDoctors,
  getTLMDoctors,

  getFLMDashboard,
  getSLMDashboard,
  getTLMDashboard,

  updateDoctorApproval,
  getPendingApprovals,
  getPendingActionsCount,
  getPendingActions
};
