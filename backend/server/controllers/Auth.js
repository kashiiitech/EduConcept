const OTP = require("../models/OTP");
const User = require("../models/User");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");
const {passwordUpdated} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();

// send OTP for Email Verification

exports.sendotp = async (req, res) => {
    try {

        // fetch email from req body
        const { email } = req.body;

        // Validation: Check if the User already exist with the same email or not
        const checkUserPresent = await User.findOne({ email });

        // If user found with provided email
        if(checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User Already Registered, try with different email address",
            })
        }

        // Generate otp

        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        const result = await OTP.findOne({ otp: otp });
        console.log("Generated OTP: ", otp);

        // check if the otp is unique or not -> check if it already exist in our DB or not

        while(result) {

            // if it is already available in our DB then create a different one

            otp = otpGenerator.generate(6,{
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });

            result = await OTP.findOne({ otp: otp });

        }

        // create a payload and add the entry in DB

        const otpPayload = {email, otp};
        const otpBody = await OTP.create(otpPayload);

        console.log("OTP Body: ", otpBody);

        res.status(200).json({
            success: true,
            message: "OTP sent sucessfully",
            otp,
        })

    } catch(error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            error: error.message,
        })
    }
}



// signup

exports.signup = async (req, res) => {
    try {
        // fetch data from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // data validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || ! otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        // Check if password and confirmPassword match or not
        if(password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password do not match, Please try again.",
            })
        }

        // Check if user already exist in the Database with the same email
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        // Find the most recent OTP for the email
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);
        if(recentOtp.length === 0) {
            // OTP not found for the email
            return res.status(400).json({
                success: false,
                message: "OTP not found!",
            })
        } else if (otp !== recentOtp[0].otp) {
            // invalid OTP 

            return res.status(400).json({
                success: false,
                message: "The OTP is not valid",
            })
        }

        // Hash the password 

        const hashedPassword = await bcrypt.hash(password, 10);

        // create the user 
        let approved = "";
        approved === "Instructor" ? (approved=false) : (approved=true);

        // create the Additional Profile for the User
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/8.x/initials/svg?seed=${firstName}`
        });

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })

    } catch(error) {

        console.error(error)
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        })

    }
}

// login

exports.login = async (req, res) => {
    try {

        // get email and password from request body
        const {email, password} = req.body;

        // Data validation: Check if email or password is missing
        if(!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            })
        }

        // Find the user with provided email
        const user = await User.findOne({ email }).populate("additionalDetails").exec();

        // If user not found with the given email
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User is not Registered with the email Please SignUp first.",
            })
        }

        // compare password
        if(await bcrypt.compare(password, user.password)) {
            // Generate jwt token

            const payload = {
                email: user.email,
                id: user._id,
                role: user.role,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "24h",
            });

            // save token to user document in database
            user.token = token;
            user.password = undefined;

            // set the cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "User login success",
            })
            
        } else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect",
            })
        }

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure Please try again.",
        })
    }
}

// change password
exports.changePassword = async(req, res) => {
    try {

        /// get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req body
        const {oldPassword, newPassword} = req.body;

        // validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        // if password do not match
        if(!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({
                success: false,
                message: "The password is incorrect",
            })
        }

        // update the password in the database
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            {password: encryptedPassword},
            {new: true}
        )

        // send notification email
        try {

            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )

            console.log("Email sent successfully: ", emailResponse.response);

        } catch(error) {
            // if there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.log("Error occured while sending email: ", error);
            return res.status(500).json({
                success: false,
                message: "Error occured while sending email",
                error: error.message,
            })
        }

        // return successful response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        })

    } catch(error) {
        console.error("Error occurred while updating password:", error)
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }
}