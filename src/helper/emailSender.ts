import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"Brundagowrav 👻" <oli2941993@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Confirmation link ✔", // Subject line
    html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
};

export default emailSender;
