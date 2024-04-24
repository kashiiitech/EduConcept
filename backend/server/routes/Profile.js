const express = require("express");
const router = express.Router();
const {auth, isInstructor} = require("../middlewares/auth");

// import controllers
const {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
    getEnrolledCourses,
    instructorDashboard,

} = require("../controllers/Profile")

// define api routes

router.put("/updateProfile", auth, updateProfile)
router.delete("/deleteProfile", auth, deleteAccount)
router.get("/getUserDetails", auth, getAllUserDetails);
// Get Enrolled Courses
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)


// export

module.exports = router;