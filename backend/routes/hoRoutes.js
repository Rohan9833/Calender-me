const express = require("express");
const router = express.Router();
const requireHO = require("../middleware/requireHO");
const { getDashboard, getDoctors, getHierarchy, getActivity } = require("../controllers/hoController");
const { createUser, deleteUser, getDeletedUsers, restoreUser } = require("../controllers/hoUserController");

// Every HO endpoint is protected, including reports/data-management APIs.
router.use(requireHO);
router.get("/dashboard", getDashboard);
router.get("/doctors", getDoctors);
router.get("/hierarchy", getHierarchy);
router.get("/activity", getActivity);
router.post("/users", createUser);
router.delete("/users/:role/:userId", deleteUser);
router.get("/deleted-users", getDeletedUsers);
router.post("/deleted-users/:deletedId/restore", restoreUser);

module.exports = router;
