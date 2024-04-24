const nodemailer = require("nodemailer");
require("dotenv").config();

mailSender = async (email, title, body) => {
    try {

        // create transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        });

        // send email using transporter

        let info = await transporter.sendMail({
            from: "EduConcept || Kashiiitech - By Kashif Ali",
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        });

        console.log(info);

        return info;
         
    } catch(error) {
        console.log(error.message);
    }
}

module.exports = mailSender;
