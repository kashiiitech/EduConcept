const jwt = require("jsonwebtoken");
const User = require("../models/User");

require("dotenv").config();

// middleware function to authenticate user requests
exports.auth = async(req, res, next) => {
    try {

        // Extracting JWT token from request cookie, body, or header
        const token = 
                    req.cookies.token ||
                    req.body.token ||
                    req.header("Authorization").replace("Bearer ", "");

        // If JWT is missing, return response
        if(!token) {
            return res.staus(401).json({
                success: false,
                message: "Token is missing",
            })
        }

        try {
            // Verify the JWT using the secret key stored in environment variables
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);

            // Storing the decoded JWT payload in the request object for furthure use
            req.user = decode;

        } catch(error) {
            // If Jwt verification fails, return response
            return res.status(401).json({
                success: false,
                message: "Token is invalid",
            })
        }

        // If JWT is valid, move on to the next middleware or request handler
        next();

    } catch(error) {
        // If there is an error during the authentication process, return 401 Unauthorized response
        return res.status(401).json({
            success: false,
            message: "Something went wrong while validating and authenticating the User", 
        })
    }
}

exports.isStudent = async (req, res, next) => {
    try {

        const userDetails = await User.findOne({ email: req.user.email });

        if(userDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Students."
            })
        }

        next();

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User Role Can't be verified"
        })
    }
}


exports.isAdmin = async (req, res, next) => {
    try {

        const userDetails = await User.findOne({ email: req.user.email });

        if(userDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin."
            })
        }

        next();

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User Role Can't be verified"
        })
    }
}


exports.isInstructor = async (req, res, next) => {
    try {

        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);


        if(userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructors."
            })
        }

        next();

    } catch(error) {
        return res.status(500).json({
            success: false,
            message: "User Role Can't be verified"
        })
    }
}