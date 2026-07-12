import nodemailer from "nodemailer";

export const handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields." }) };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.forwardemail.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 1. Notify you (Issa) about the new inquiry
    await transporter.sendMail({
      from: '"OPOTICS" <solutions@opotics.com>',
      to: "issa@orientalpress.com",
      replyTo: email,
      subject: `New Inquiry from ${name}`,
      text: `You have a new inquiry from the OPOTICS website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    // 2. Send auto-reply to the inquirer
    await transporter.sendMail({
      from: '"OPOTICS" <solutions@opotics.com>',
      to: email,
      subject: "Thank you for contacting OPOTICS",
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;">
          <div style="text-align:center;margin-bottom:30px;">
            <h1 style="color:#0a0a0a;font-size:24px;margin:0;">OPOTICS</h1>
            <p style="color:#666;font-size:13px;margin:5px 0 0 0;">Advanced Robotics Solutions</p>
          </div>
          <div style="background:#f8f9fa;border-radius:12px;padding:30px;margin-bottom:20px;">
            <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 15px 0;">Dear <strong>${name}</strong>,</p>
            <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 15px 0;">
              Thank you for reaching out to OPOTICS. We have successfully received your inquiry and our team is reviewing it now.
            </p>
            <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 15px 0;">
              We typically respond within <strong>24 hours</strong> during business days.
            </p>
            <p style="color:#333;font-size:16px;line-height:1.6;margin:0;">
              Best regards,<br><strong>The OPOTICS Team</strong>
            </p>
          </div>
          <div style="text-align:center;padding-top:20px;border-top:1px solid #eee;">
            <p style="color:#999;font-size:12px;margin:0;">&copy; 2026 OPOTICS. Premium Robotics Solutions for the GCC.</p>
            <p style="color:#999;font-size:12px;margin:5px 0 0 0;"><a href="https://www.opotics.com" style="color:#666;">www.opotics.com</a></p>
          </div>
        </div>
      `,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Email error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
