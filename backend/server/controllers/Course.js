const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {convertSecondsToDuration} = require("../utils/secToDuration");

require("dotenv").config();

// function to create a new course
exports.createCourse = async (req, res) => {
    try {
        // Get the user Id from request object
        const userId = req.user.id;

        // Get all required fields from request body 
        let {
            courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            tag: _tag,
            category,
            status,
            instructions: _instructions,

        } = req.body;
        // Get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringifiedArray to Array
        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions);

        console.log("TAG", tag);
        console.log("INSTRUCTIONS: ", instructions);

        // Check if any of the required fields are missing
        if(
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn ||
            !price ||
            !tag.length ||
            !thumbnail ||
            !category ||
            !instructions.length
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mendatory",
            })
        }
        if(!status || status === undefined) {
            status = "Draft"
        }

        // Check if the user is an instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        })

        if(!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            })
        }

        // Check if the given category is valid
        const categoryDetails = await Category.findById(category);
        if(!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details Not Found",
            })
        }

        // Upload the Thumbnail to Cloudinary
        const thumbnailImage = uploadImageToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME,
        )
        console.log("THUMBNAIL IMAGE: ", thumbnailImage);

        // Create a new course with the given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: (await thumbnailImage).secure_url,
            status: status,
            instructions,
        });


        // Add the new course to the User Schema of the Instructor
        await User.findOneAndUpdate({
            _id: instructorDetails._id,
        },
        {
            $push: {
                courses: newCourse._id,
            },
        },
        {new: true},
        )

        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            {new: true,}
        )

        console.log("CATEGORYDETAILS: ", categoryDetails);

        // return the new course and success message
        res.status(200).json({
            success: true,
            data: newCourse,
            message: "Course Created Successfully",
        })

    } catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }
}

// update an existing course
exports.editCourse = async (req, res) => {
    try {
        // get course Id from req body
        const {courseId} = req.body;
        const course = await Course.findById(courseId)
        // get the updates from req body
        const updates = req.body;
        // find the course with the given course id
        if(!course) {
            return res.status(404).json({
                error: "Course not found",
            })
        }

        // If Thumbnail Image is found, update it
        if(req.files) {
            console.log("THUMBNAIL UPDATE");
            const thumbnail = req.files.thumbnailImage;
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME,
            )

            // update the url in db
            course.thumbnail = thumbnailImage.secure_url;
        }

        // update only the fields that are present in the request body
        for(const key in updates) {
            if(updates.hasOwnProperty(key)) {
                if(key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key]);
                } else {
                    course[key] = updates[key];
                }
            }
        }

        // save the course
        await course.save();

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populates: {
                path: "additionalDetails",
            },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            }
        }).exec();

        // return response
        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })

    } catch(error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// Get Course List
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            { status: "Published"},
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }
        )
        .populate("instructor").exec();

        
        // return response

        return res.status(200).json({
            success: true,
            data: allCourses,
        })

    } catch(error) {
        console.error(error);

        return res.status(404).json({
            success: false,
            message: "Can't Fetch Course Data",
            error: error.message,
        })
    }
}

// Get one Single Course Details 

exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body;
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
        .populate({
            path: "instructor",
            populate: {
                path: "additionalDetails",
            },

        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
                select: "-videoUrl",
            },
        }).exec();

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        let totalDurationInSeconds = 0;
        courseDetails.courseContent.forEach((content) => {
            content.subSection.forEach((subSection) => {
                const timeDurationInSeconds = parseInt(subSection.timeDuration)
                totalDurationInSeconds += timeDurationInSeconds
            })
        })

        const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
            }
        })

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internel server error",
            error: error.message,
        })
    }
}