import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.O365_USER,
    pass: process.env.O365_APP_PASSWORD,
  },
});

export async function sendMail({
  to,
  subject,
  html,
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.O365_USER,
      to,
      subject,
      html,
    });

    console.log(
      "Mail Sent Successfully:",
      info.messageId
    );

    return info;
  } catch (error) {
    console.error(
      "Mail Sending Error:",
      error
    );

    throw error;
  }
}