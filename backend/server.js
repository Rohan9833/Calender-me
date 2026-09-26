const express = require("express");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const hierarchyroutes = require("./routes/hierarchyRoutes");
const doctorroutes = require("./routes/doctorRoutes");
const managerRoutes = require("./routes/managerRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const path = require("path");

const cors = require("cors");

const connectDB = require("./config/db");
dotenv.config();

console.log("Current Directory:", process.cwd());
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// console.log(process.env);

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);

app.use("/api/hierarchy", hierarchyroutes);

app.use("/api/createdoc", doctorroutes);
app.use("/api/doctors", doctorroutes);
app.use("/api/manager", managerRoutes);
app.use("/api/calendar", calendarRoutes);

app.use("/uploads/doctors", express.static(path.join(__dirname, "uploads/doctors")));
app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
