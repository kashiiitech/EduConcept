const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

// create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
    try {
        // fetch the data from req body
        const {sectionId, title, description} = req.body;
        // fetch the video file
        const video = req.files.video;
        // validation
        if(!sectionId || !title || !description || !video) {
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            })
        }
        console.log(video);
        // upload the video file to cloudinary
        const uploadDetails = await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME,
        )
        console.log(uploadDetails);
        // create a new sub-section
        const SubSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        })
        // update the corresponding section with the newly created sub-section
        const updatedSection = await Section.findByIdAndUpdate(
            {_id: sectionId},
            {
                $push: { subSection: SubSectionDetails._id}
            },
            {new: true},
        ).populate("subSection").exec();
        // return the updated section in the response
        return res.status(200).json({
            success: true,
            data: updatedSection
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server Error while creating sub-section",
            error: error.message,
        })
    }
}

// update a sub-section
exports.updateSubSection = async (req, res) => {
    try {
        // fetch the data from req body
        const {sectionId, subSectionId, title, description} = req.body;
        const subSection = await SubSection.findById(subSectionId);
        // validation
        if(!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }
        // check if title and description is undefined
        if(title !== undefined) {
            subSection.title = title;
        }
        if(description !== undefined) {
            subSection.description = description;
        }
        // also check video file is undefined or not
        if(req.files && req.files.video !== undefined) {
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
            subSection.videoUrl = uploadDetails.secure_url;
            subSection.timeDuration = `${uploadDetails.duration}`;
        }

        await subSection.save();
        // find the updaated section and return it
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        console.log("updated section-> ", updatedSection);

        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the sub-section",
        })
    }
}

// delete a sub-section
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch the subsectionid, and sectionid from req body
        const { subSectionId, sectionId } = req.body;
        // delete the subsection
        await Section.findByIdAndUpdate(
            {_id: sectionId},
            {$pull: {subSection: subSectionId}}
        )

        const subSection = await SubSection.findByIdAndDelete({_id: subSectionId});
        if(!subSection) {
            return res.staus(404).json({
                success: false,
                message: "Sub Section not found"
            })
        }
        // update the section
        const updatedSection = await Section.findById(sectionId).populate("subSection");
        // return the successful response
        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        })

    } catch(error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the sub-section",
        })
    }
}