const Doctor = require("../models/Doctor");
const MR = require("../models/MR");
const { sendConsentMail } = require("../services/mailService");

// Create doctor
const Createdoc = async (req, res) => {
  try {
    const mr = await MR.findOne({
      mrId: req.body.mrId,
    });

    if (!mr) {
      return res.status(404).json({
        success: false,
        message: "MR not found",
      });
    }

    const isDraft = req.body.status === "draft";
    const doctorStatus = isDraft ? "draft" : "pending";
    
    const doctor = await Doctor.create({
      doctorName: req.body.doctorName,
      speciality: req.body.speciality,
      mclCode: req.body.mclCode,
      clinicName: req.body.clinicName,
      city: req.body.city,
      area: req.body.area,
      email: req.body.email,
      brand: req.body.brand,
      mobile: req.body.mobile,
      preferredContact: req.body.preferredContact,
      currentBusiness: req.body.currentBusiness,
      expectedBusiness: req.body.expectedBusiness,
      brandFocus: req.body.brandFocus,
      otherActivities: req.body.otherActivities,
      
      status: doctorStatus,
      approvalStatus: isDraft ? null : "pending",
      consentStatus: "pending",
      consentSent: false,
      photoUploaded: false,
      mr: mr._id,
    });

    await MR.findByIdAndUpdate(mr._id, {
      $push: { doctors: doctor._id }
    });

    // ─── LOG ACTIVITY ──────────────────────────────
    if (!isDraft) {
      try {
        await Activity.create({
          action: `Doctor Added: ${doctor.doctorName}`,
          doctor: doctor._id,
          mr: mr._id,
          performedBy: mr._id,
          role: "mr",
          status: "Pending",
          details: `Doctor ${doctor.doctorName} added by ${mr.mrName}`
        });
        console.log(`✅ Activity logged: Doctor Added - ${doctor.doctorName}`);
      } catch (err) {
        console.log("⚠️ Error logging activity:", err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: isDraft ? "Doctor saved as draft" : "Doctor submitted for approval",
      doctor,
    });
  } catch (error) {
    console.log("FULL ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// In doctorController.js - Update getDashboardData
// Replace your existing getDashboardData function with this:
const getDashboardData = async (req, res) => {
  try {
    const { mrId } = req.params;
    
    console.log("Looking for MR with ID:", mrId);
    
    // Try to find MR by mrId (string) OR by _id (ObjectId)
    let mr;
    
    // Check if it's a valid ObjectId format (24 hex chars)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(mrId);
    
    if (isValidObjectId) {
      mr = await MR.findById(mrId);
    }
    
    // If not found by _id, try by mrId string
    if (!mr) {
      mr = await MR.findOne({ mrId: mrId });
    }
    
    if (!mr) {
      console.log("MR not found for ID:", mrId);
      return res.status(404).json({
        success: false,
        message: "MR not found",
      });
    }

    console.log("Found MR:", mr.mrName);

    const doctors = await Doctor.find({ mr: mr._id });

    const draftDoctors = doctors.filter((d) => d.status === "draft");
    const submittedDoctors = doctors.filter((d) => d.status === "pending");
    const approvedDoctors = doctors.filter((d) => d.approvalStatus === "approved");
    
    const consentPendingDoctors = doctors.filter((d) => 
      d.approvalStatus === "approved" && 
      (!d.consentSent || d.consentStatus === "pending")
    );
    
    const photoPendingDoctors = doctors.filter((d) => 
      d.consentStatus === "approved" && !d.photoUploaded
    );

    const calendarFrozenDoctors = doctors.filter((d) => 
      d.calendarFrozen === true || d.calendarStatus === "frozen"
    );
    
    const inputGivenPendingDoctors = doctors.filter((d) => 
      (d.calendarFrozen === true || d.calendarStatus === "frozen") && 
      d.inputGivenStatus === "pending"
    );
    
    const calendarDeliveredDoctors = doctors.filter((d) => 
      d.calendarDelivered === true
    );
    
    const sendConsentCount = doctors.filter((d) => 
      d.approvalStatus === "approved" && !d.consentSent
    ).length;

    const uploadPhotoCount = doctors.filter((d) => 
      d.consentStatus === "approved" && !d.photoUploaded
    ).length;

    const calendarSelectionCount = doctors.filter((d) => 
      d.photoUploaded === true && d.calendarSelected === false && d.calendarFrozen !== true
    ).length;

    const inputGivenCount = doctors.filter((d) => 
      d.calendarSelected === true && d.calendarDelivered === false && d.calendarFrozen !== true
    ).length;

    const frozenDoctors = calendarFrozenDoctors.map(d => ({
      _id: d._id,
      doctorName: d.doctorName,
      speciality: d.speciality,
      city: d.city,
      mclCode: d.mclCode,
      calendarFrozenAt: d.calendarFrozenAt,
      calendarFrozen: d.calendarFrozen
    }));

    res.status(200).json({
      success: true,
      draftCount: draftDoctors.length,
      submittedCount: submittedDoctors.length,
      approvedCount: approvedDoctors.length,
      consentPendingCount: consentPendingDoctors.length,
      photoPendingCount: photoPendingDoctors.length,
      calendarFrozenCount: calendarFrozenDoctors.length,
      inputGivenPendingCount: inputGivenPendingDoctors.length,
      calendarDeliveredCount: calendarDeliveredDoctors.length,
      sendConsentCount: sendConsentCount,
      uploadPhotoCount: uploadPhotoCount,
      calendarSelectionCount: calendarSelectionCount,
      inputGivenCount: inputGivenCount,
      frozenDoctors: frozenDoctors,
      recentDoctors: doctors.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findByIdAndDelete(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDoctorPhoto = async (req, res) => {
  try {
    const { doctorId, photoId } = req.params;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Find the photo index
    const photoIndex = doctor.doctorPhotos.findIndex(p => p._id.toString() === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }

    // Remove from array
    doctor.doctorPhotos.splice(photoIndex, 1);
    if (doctor.doctorPhotos.length === 0) {
      doctor.photoUploaded = false;
    }
    await doctor.save();

    res.status(200).json({ success: true, message: "Photo deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send consent to doctor - FIXED with better logging
const sendConsentToDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("=== SENDING CONSENT ===");
    console.log("Doctor ID:", doctorId);
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      console.log("Doctor not found");
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    
    console.log("Doctor found:", doctor.doctorName);
    console.log("Current consentSent:", doctor.consentSent);
    console.log("Current consentStatus:", doctor.consentStatus);
    console.log("ApprovalStatus:", doctor.approvalStatus);
    
    if (doctor.approvalStatus !== "approved") {
      console.log("Doctor not approved");
      return res.status(400).json({
        success: false,
        message: "Doctor must be approved by FLM before sending consent",
      });
    }
    
    if (doctor.consentSent) {
      console.log("Consent already sent");
      return res.status(400).json({
        success: false,
        message: "Consent email already sent to this doctor",
      });
    }
    
    // Send consent email
    console.log("Sending consent email to:", doctor.email);
    await sendConsentMail(doctor);
    
    // UPDATE ALL CONSENT FIELDS
    doctor.consentSent = true;
    doctor.consentStatus = "pending";
    doctor.consentSentAt = new Date();
    await doctor.save();
    
    console.log("Doctor updated successfully!");
    console.log("New consentSent:", doctor.consentSent);
    console.log("New consentStatus:", doctor.consentStatus);
    console.log("New consentSentAt:", doctor.consentSentAt);
    
    // Fetch the updated doctor to verify
    const updatedDoctor = await Doctor.findById(doctorId);
    console.log("Verified from DB - consentSent:", updatedDoctor.consentSent);
    
    return res.status(200).json({
      success: true,
      message: "Consent email sent successfully",
      doctor: {
        _id: doctor._id,
        doctorName: doctor.doctorName,
        consentSent: doctor.consentSent,
        consentStatus: doctor.consentStatus,
        consentSentAt: doctor.consentSentAt
      }
    });
  } catch (error) {
    console.error("Error sending consent:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Give consent (doctor clicks email link)
const giveConsent = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("=== DOCTOR GIVING CONSENT ===");
    console.log("Doctor ID:", doctorId);
    
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      console.log("Doctor not found");
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }
    
    console.log("Doctor found:", doctor.doctorName);
    console.log("Current consentStatus:", doctor.consentStatus);
    
    doctor.consentStatus = "approved";
    doctor.consentDate = new Date();
    await doctor.save();
    
    console.log("Consent approved successfully!");
    console.log("New consentStatus:", doctor.consentStatus);
    
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Consent Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .success { color: green; }
          .container { max-width: 600px; margin: 0 auto; }
          .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1 class="success">✓ Thank You!</h1>
          <p>Your consent has been successfully submitted.</p>
          <p>The MR will now be able to upload your photo for the calendar.</p>
        
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Error in giveConsent:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get doctors with filters
// Replace your existing getDoctors function with this:
const getDoctors = async (req, res) => {
  try {
    const { mrId } = req.params;
    const { status, approvalStatus, city, speciality } = req.query;

    console.log("getDoctors called with mrId:", mrId);

    // Try to find MR by mrId or _id
    let mr;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(mrId);
    
    if (isValidObjectId) {
      mr = await MR.findById(mrId);
    }
    
    if (!mr) {
      mr = await MR.findOne({ mrId: mrId });
    }

    if (!mr) {
      return res.status(404).json({
        success: false,
        message: "MR not found",
      });
    }

    const filter = { mr: mr._id };

    if (status) {
      if (status === 'submitted') {
        filter.status = 'pending';
      } else {
        filter.status = status;
      }
    }
    
    if (approvalStatus) filter.approvalStatus = approvalStatus;
    if (city) filter.city = city;
    if (speciality) filter.speciality = speciality;

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    
    console.log(`Found ${doctors.length} doctors for MR ${mr.mrName}`);
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Error in getDoctors:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Replace your existing getDoctorById function with this:
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    console.log("getDoctorById called with doctorId:", doctorId);
    
    let doctor;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(doctorId);
    
    if (isValidObjectId) {
      doctor = await Doctor.findById(doctorId);
    }
    
    if (!doctor) {
      doctor = await Doctor.findOne({ mclCode: doctorId });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await doctor.populate({
      path: "mr",
      select: "mrName hq region zone",
      populate: {
        path: "flm",
        select: "flmName",
      },
    });

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Error in getDoctorById:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const uploadDoctorPhotos = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if consent is approved
    if (doctor.consentStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot upload photo. Doctor consent not approved yet.",
      });
    }

    if (doctor.doctorPhotos.length + req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 photos allowed",
      });
    }

    const uploadedPhotos = req.files.map((file) => ({
      url: `/uploads/doctors/${file.filename}`,
      uploadedAt: new Date(),
    }));

    doctor.doctorPhotos.push(...uploadedPhotos);
    doctor.photoUploaded = true;
    doctor.photoUploadedAt = new Date();

    await doctor.save();
    
    console.log(`Photos uploaded for ${doctor.doctorName}. Total: ${doctor.doctorPhotos.length}`);
    
    res.status(200).json({
      success: true,
      message: "Photos uploaded successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Replace your existing getDoctorsByMR function with this:
const getDoctorsByMR = async (req, res) => {
  try {
    const { mrId } = req.params;
    
    console.log("getDoctorsByMR called with mrId:", mrId);
    
    let mr;
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(mrId);
    
    if (isValidObjectId) {
      mr = await MR.findById(mrId);
    }
    
    if (!mr) {
      mr = await MR.findOne({ mrId: mrId });
    }
    
    if (!mr) {
      return res.status(404).json({
        success: false,
        message: "MR not found",
      });
    }

    const doctors = await Doctor.find({ mr: mr._id });

    const CalendarSelection = require("../models/CalendarSelection");
    
    const doctorsWithCalendar = await Promise.all(
      doctors.map(async (doctor) => {
        const calendar = await CalendarSelection.findOne({
          doctor: doctor._id,
          year: 2027,
        });
        
        return {
          ...doctor.toObject(),
          calendarStatus: calendar ? calendar.status : "not_started",
          calendarFrozen: calendar?.status === "frozen",
          inputGiven: calendar?.inputGiven || false,
          inputGivenAt: calendar?.inputGivenAt || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: doctorsWithCalendar.length,
      doctors: doctorsWithCalendar,
    });
  } catch (error) {
    console.error("Error in getDoctorsByMR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// In doctorController.js - Add update function
const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = req.body;

    delete updateData.mclCode;
    delete updateData.mrId;
    delete updateData._id;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // ✅ Allow editing for DRAFT (null) or PENDING approval status
    if (doctor.approvalStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Cannot edit doctor after approval",
      });
    }

    // Update doctor fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined && updateData[key] !== "") {
        doctor[key] = updateData[key];
      }
    });

    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor,
    });
  } catch (error) {
    console.error("Error updating doctor:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  Createdoc,
  getDashboardData,
  giveConsent,
  getDoctors,
  getDoctorById,
  uploadDoctorPhotos,
  getDoctorsByMR,
  sendConsentToDoctor,
  updateDoctor,
  deleteDoctor,
  deleteDoctorPhoto,
};