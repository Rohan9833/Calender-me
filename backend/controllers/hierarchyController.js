const XLSX = require("xlsx");
const TLM = require("../models/TLM");
const SLM = require("../models/SLM");
const FLM = require("../models/FLM");
const MR = require("../models/MR");

const uploadHierarchy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    const tlmMap = new Map();
    const slmMap = new Map();
    const flmMap = new Map();

    // ==========================
    // CREATE TLMS
    // ==========================

    for (const row of rows) {
      if (!tlmMap.has(row.TLMID)) {
        const tlm = await TLM.create({
          tlmId: row.TLMID,
          tlmName: row.TLMNAME,
          tlmPassword: String(row.TLMPASSWORD),
          hq: row.TLMHQ,
          zone: row.TLMZONE,
        });

        tlmMap.set(row.TLMID, tlm);
      }
    }

    // ==========================
    // CREATE SLMS
    // ==========================

    for (const row of rows) {
      if (!slmMap.has(row.SLMID)) {
        const parentTlm = tlmMap.get(row.TLMID);
        const slm = await SLM.create({
          slmId: row.SLMID,
          slmName: row.SLMNAME,
          slmPassword: String(row.SLMPASSWORD),
          hq: row.SLMHQ,
          region: row.SLMREGION,
          zone: row.SLMZONE,
          tlm: parentTlm._id,
        });

        parentTlm.slms.push(slm._id);

        await parentTlm.save();

        slmMap.set(row.SLMID, slm);
      }
    }

    // ==========================
    // CREATE FLMS
    // ==========================

    for (const row of rows) {
      if (!flmMap.has(row.FLMID)) {
        const parentSlm = slmMap.get(row.SLMID);

        const flm = await FLM.create({
          flmId: row.FLMID,
          flmName: row.FLMNAME,
          flmPassword: String(row.FLMPASSWORD),
          hq: row.FLMHQ,
          region: row.FLMREGION,
          zone: row.FLMZONE,
          slm: parentSlm._id,
        });

        parentSlm.flms.push(flm._id);

        await parentSlm.save();

        flmMap.set(row.FLMID, flm);
      }
    }

    // ==========================
    // CREATE MRS
    // ==========================

    for (const row of rows) {
      const existingMr = await MR.findOne({
        mrId: row.MRID,
      });

      if (!existingMr) {
        const parentFlm = flmMap.get(row.FLMID);

        const mr = await MR.create({
          mrId: row.MRID,
          mrName: row.MRNAME,
          mrPassword: String(row.MRPASSWORD),

          email: row.MREMAIL,

          hq: row.MRHQ,

          region: row.MRREGION,

          zone: row.MRZONE,

          businessUnit: row.MRBUSSINESSUNIT,

          flm: parentFlm._id,
        });

        // ADD THIS
        parentFlm.mrs.push(mr._id);

        await parentFlm.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Hierarchy imported successfully",
      totalRows: rows.length,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadHierarchy,
};
