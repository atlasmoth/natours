const nodemailer = require("nodemailer");

async function sendEmail(options) {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // define mail objects
  const mailOptions = {
    from: "Natours <ebuka422@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  // send mail using transporter

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
