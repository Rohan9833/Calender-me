// const MR = require("../models/MR");
// const FLM = require("../models/FLM");
// const SLM = require("../models/SLM");
// const TLM = require("../models/TLM");

// const login = async (req, res) => {
//   try {
//     const { userId, password } = req.body;
//     let user = null;

//     // Check MR
//     user = await MR.findOne({ mrId: userId });

//     // Check FLM
//     if (!user) {
//       user = await FLM.findOne({ flmId: userId });
//     }

//     // Check SLM
//     if (!user) {
//       user = await SLM.findOne({ slmId: userId });
//     }

//     // Check TLM
//     if (!user) {
//       user = await TLM.findOne({ tlmId: userId });
//     }

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }
//     console.log("User Found:");
//     console.log(user);

//     console.log("Password from DB:", user.Password);
//     console.log("Password from Request:", password);

//     if (user.Password != password) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid Password",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Login Successful",
//       user,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   login,
// };


const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");

const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    let user = null;

    // Check MR
    user = await MR.findOne({ mrId: userId });

    // Check FLM
    if (!user) {
      user = await FLM.findOne({ flmId: userId });
    }

    // Check SLM
    if (!user) {
      user = await SLM.findOne({ slmId: userId });
    }

    // Check TLM
    if (!user) {
      user = await TLM.findOne({ tlmId: userId });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let dbPassword = "";

    if (user.role === "mr") {
      dbPassword = user.mrPassword;
    } else if (user.role === "flm") {
      dbPassword = user.flmPassword;
    } else if (user.role === "slm") {
      dbPassword = user.slmPassword;
    } else if (user.role === "tlm") {
      dbPassword = user.tlmPassword;
    }

    console.log("User Found:", user.userId);
    console.log("Password from DB:", dbPassword);
    console.log("Password from Request:", password);

    if (String(dbPassword) !== String(password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user,
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
  login,
};