const nodemailer = require("nodemailer");

exports.handler = async function (event, context) {
  try {
    const { payload } = JSON.parse(event.body);
    const { name, email, message } = payload.data;

    // Don't send if no email was provided
    if (!email) {
      return { statusCode: 200, body: "No email address provided, skipping auto-reply." };
    }

    // Create SMTP transporter using ForwardEmail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.forwardemail.net",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send the auto-reply email
    await transporter.sendMail({
      from: '"OPOTICS" <solutions@opotics.com>',
      to: email,
      subject: "Thank you for contacting OPOTICS",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0a0a0a; font-size: 24px; margin: 0;">OPOTICS</h1>
            <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Advanced Robotics Solutions</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Dear <strong>${name || "Valued Customer"}</strong>,
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Thank you for reaching out to OPOTICS. We have successfully received your inquiry and our team is reviewing it now.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              We typically respond within <strong>24 hours</strong> during business days. In the meantime, if you have any urgent questions, feel free to reply directly to this email.
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
              Best regards,<br>
              <strong>The OPOTICS Team</strong>
            </p>
          </div>
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              &copy; 2026 OPOTICS. Premium Robotics Solutions for the GCC.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
              <a href="https://www.opotics.com" style="color: #666;">www.opotics.com</a>
            </p>
          </div>
        </div>
      `,
    });

    return {
      statusCode: 200,
      body: "Auto-reply sent successfully.",
    };
  } catch (error) {
    console.error("Auto-reply error:", error);
    return {
      statusCode: 500,
      body: `Auto-reply failed: ${error.message}`,
    };
  }
};
