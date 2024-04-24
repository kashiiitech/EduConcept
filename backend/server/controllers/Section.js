const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

// create a new Section
exports.createSection = async (req, res) => {
    try {
        // fetch the data section name and current course id
        const {sectionName, courseId} = req.body;
        // validate the input
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            })
        }
        // create a new section with the given name
        const newSection = await Section.create({sectionName});
        // update the course with this new section name add this to courseContent array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            {new: true},
        )
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            }
        })
        .exec();

        // return the updated course object in the response
        res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error while creating the section",
            error: error.message,
        })
    }
}

// update the Section
exports.updateSection = async(req, res) => {
    try {
        // fetch the new section name and sectionid from request body
        const {sectionName, sectionId, courseId} = req.body;
        // find the section with the given sectionId and update the name
        const section = await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new: true},
        )
        // find the updated course with the given courseId
        const course = await Course.findById(courseId)
                    .populate({
                        path: "courseContent",
                        populate: {
                            path: "subSection"
                        }
                    })
                    .exec();
        // return successful response
        res.status(200).json({
            success: true,
            message: section,
            data: course,
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error while updating the section",
            error: error.message,
        })
    }
}
// delete a section
exports.deleteSection = async(req, res) => {
    try {
        // fetch sectionId and courseId from req body
        const {sectionId, courseId} = req.body;
        // remove the section from the courseContent arrayy
        await Course.findByIdAndUpdate(courseId, {
            $pull: {
                courseContent: sectionId,
            }
        })

        // find the section
        const section = await Section.findById(sectionId);
        console.log(sectionId, courseId);
        
        if(!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            })
        }

        // delete sub sections 
        await SubSection.deleteMany({_id: {$in: section.subSection}});

        // delete the section 
        await Section.findByIdAndDelete(sectionId);

        // return successful response with updated course

        const course = await Course.findById(courseId).populate({
            path: "courseContent",
            populate: {
                path: "subSection",
            }
        })
        .exec();

        res.status(200).json({
            success: true,
            message: "Section deleted",
            data: course,
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error while deleting the section",
            error: error.message,
        })
    }
}