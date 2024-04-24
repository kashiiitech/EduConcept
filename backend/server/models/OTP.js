const mongoose = require("mongoose");
const { mailSender } = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 60 * 5, // The document will automatically deleted after 5 minutes of it's creation time.
        }
    }
);

// Define a function to send emails

async function sendVerificationEmail(email, otp) {
    try {

        const mailResponse = await mailSender(
            email,
            "Verification Email",
            emailTemplate(otp)
        );
        console.log("Email sent successfully: ", mailResponse.response);

    } catch(error) {
        console.log("Error occured while sending email: ", error);
        throw error;
    }
}

// Define a pre-save hook to send email just before the document has been saved
OTPSchema.pre("save", async function (next) {
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if(this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }

    next();
});



module.exports = mongoose.model("OTP", OTPSchema);