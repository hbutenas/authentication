const nodemailer = require("nodemailer");
const sendEmail = async (authKey, email) => {

    const transporter = nodemailer.createTransport({
        host: process.env.ETHEREAL_HOST,
        port: process.env.ETHEREAL_PORT,
        auth: {
            user: process.env.ETHEREAL_EMAIL,
            pass: process.env.ETHEREAL_PASSWORD
        }
    });


    const webURL = "http://localhost:8080";

    // send the email
    await transporter.sendMail({
        from: "\"Fred Foo 👻\" <foo@example.com>",
        to: email,
        subject: "Password reset",
        html: "<h4>Hello,</h4>" +
            "<p>We have received your request to reset password. Please follow the provided link. " +
            `<strong><a href='${webURL}/forgot-password?authKey=${authKey}?email=${email}'>Password reset</a></strong></p>`, // html body
    });
};

module.exports = {sendEmail};