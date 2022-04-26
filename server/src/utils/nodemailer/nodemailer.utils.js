const nodemailer = require("nodemailer");
const CustomError = require("../../errors");
const crypto = require("crypto");
const sendEmail = async (email) => {

    const transporter = nodemailer.createTransport({
        host: process.env.ETHEREAL_HOST,
        port: process.env.ETHEREAL_PORT,
        auth: {
            user: process.env.ETHEREAL_EMAIL,
            pass: process.env.ETHEREAL_PASSWORD
        }
    });

    try {
        const verificationToken = crypto.randomBytes(40).toString("hex");
        // Change the URL to FE domain.
        const webURL = "http://localhost:3000";
        // Change the url to web url.
        await transporter.sendMail({
            from: "\"Fred Foo 👻\" <foo@example.com>", // sender address
            to: email,
            subject: "Password reset", // Subject line
            html: "<h4>Hello,</h4>" +
                "<p>We have received your request to reset password. Please follow the provided link. " +
                `<strong><a href='${webURL}/password-reset?key=${verificationToken}?email=${email}'>Password reset</a></strong></p>`, // html body
        });
    } catch (e) {
        console.error("Error occurred on sending email. Handle incoming error request by e.code");
        if (e) throw new CustomError.InternalServer("Something went wrong... Please try again later");
    }


};

module.exports = {sendEmail};