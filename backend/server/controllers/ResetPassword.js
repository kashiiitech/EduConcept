const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const email = req.body.email;
        // email validation
        if(!email) {
            return res.status(401).json({
                success: false,
                message: "Email is required",
            })
        }
        // // Find User against the email from DB
        const user = await User.findOne({ email: email });
        if(!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered with us Enter a valid email`,
            })
        }

        // generate token
        const token = crypto.randomBytes(20).toString("hex");

        // update user by adding token and expiration date
        const updatedDetails = await User.findOneAndUpdate(
            {email: email},
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000, // expires in 5 minutes = 5 * 60 * 1000
            },
            {new: true}
        );

        console.log("Updated User Details: ", updatedDetails);

        // create url
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the url
        
        await mailSender (
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        );

        // return successful response

        res.json({
            success: true,
            message: "Email send Successfully, Please check your email to confirm Further."
        })

    } catch(error) {
        return res.json({
            error: error.message,
            success: false,
            message: "Some Error in Sending the Reset Message", 
        });
    }
}

// resetPassword
exports.resetPassword = async (req, res) => {
    try {
        //  get password, confirmPassword, token from req body
        const {password, confirmPassword, token} = req.body;
        // validation 
        // check password and confirm Password or same or not
        if (password !== confirmPassword) {
            return res.json({
                success: false,
                message: "Password and Confirm Password does not Match",
            })
        }
        // find userDetails from database using token that we have inserted previously
        const userDetails = await User.findOne({ token: token });
        // user validation
        if(!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Token is invalid, or user not found",
            })
        }
        // check token time expiration
        if(!(userDetails.resetPasswordExpires > Date.now())) {
            return res.json({
                success: false,
                message: "Token is Expired, Please Regenerate Your token and try again",
            })
        }

        // encrypt the password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // update the password in db

        await User.findOneAndUpdate(
            {token: token},
            {password: encryptedPassword},
            {new: true},
        );

        res.json({
            success: true,
            message: "Password Reset Successful",
        })

    } catch(error) {

        return res.json({
            error: error.message,
            success: false,
            message: "Some Error in Updating the Password",
        })

    }
}