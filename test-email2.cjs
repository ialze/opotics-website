const nodemailer = require("nodemailer");

async function test() {
  const transporter = nodemailer.createTransport({
    host: "smtp.forwardemail.net",
    port: 465,
    secure: true,
    auth: {
      user: "solutions@opotics.com",
      pass: "9rFcX44cdmS$E#f",
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"OPOTICS" <solutions@opotics.com>',
      to: "issa@orientalpress.com",
      subject: "Test via nodemailer",
      text: "Testing nodemailer SMTP",
    });
    console.log("Success:", info.messageId);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
