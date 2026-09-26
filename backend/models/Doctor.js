const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: true,
    },

    speciality: {
      type: String,
      required: true,
    },

    mclCode: {
      type: String,
      required: true,
      unique: true,
    },

    clinicName: String,
    city: String,
    area: String,
    brand: { type: String, trim: true },
    email: String,
    mobile: String,

    preferredContact: {
      type: String,
      enum: ["email", "mobile"],
    },

    currentBusiness: Number,
    expectedBusiness: Number,

    brandFocus: String,
    otherActivities: String,

    mr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MR",
      required: true,
    },

    // ---------------------
    // Consent Flow
    // ---------------------

    consentStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    consentSent: {  // ✅ ADD THIS FIELD
      type: Boolean,
      default: false,
    },

    consentToken: String,

    consentSentAt: Date,
    consentDate: Date,

    // ---------------------
    // Manager Approval
    // ---------------------

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
    },

    approvedByRole: {
      type: String,
      enum: ["flm", "slm", "tlm", "ho"],
    },

    approvedAt: Date,

    // ---------------------
    // Doctor Photo
    // ---------------------

    doctorPhotos: {
      type: [
        {
          url: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },

    photoUploaded: {
      type: Boolean,
      default: false,
    },

    photoUploadedAt: Date,

    // ---------------------
    // Calendar Selection
    // ---------------------

    calendarYear: Number,

    calendarSelections: [
      {
        month: {
          type: String,
          enum: [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ],
        },
        pageNumber: Number,
      },
    ],

    calendarSelected: {
      type: Boolean,
      default: false,
    },

    calendarSelectedAt: Date,

    // ---------------------
    // Delivery
    // ---------------------

    calendarDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: Date,

    calendarFrozen: {
      type: Boolean,
      default: false,
    },

    calendarFrozenAt: Date,

    inputGivenStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    inputGivenAt: Date,

    // ---------------------
    // Dashboard Status
    // ---------------------

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },

    role: {
      type: String,
      default: "doctor",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Doctor", doctorSchema);