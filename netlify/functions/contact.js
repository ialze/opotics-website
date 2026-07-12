exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body);

    if (!name || !email || !message) {
      return { statusCode: 400, body: "Missing required fields." };
    }

    const auth = Buffer.from(`${process.env.SMTP_USER}:${process.env.SMTP_PASS}`).toString("base64");

    // 1. Send the inquiry notification to Issa
    const notificationResponse = await fetch("https://api.forwardemail.net/v1/emails", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "solutions@opotics.com",
        to: "issa@orientalpress.com",
        subject: `New Inquiry from ${name}`,
        text: `You have received a new inquiry from the OPOTICS website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        replyTo: email
      }),
    });

    if (!notificationResponse.ok) {
      const errorText = await notificationResponse.text();
      console.error("Failed to send notification:", errorText);
      return { statusCode: 500, body: "Failed to send notification email." };
    }

    // 2. Send the auto-reply to the inquirer
    const autoReplyResponse = await fetch("https://api.forwardemail.net/v1/emails", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "solutions@opotics.com",
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
                Dear <strong>${name}</strong>,
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
      }),
    });

    if (!autoReplyResponse.ok) {
      console.error("Failed to send auto-reply");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
      headers: { "Content-Type": "application/json" }
    };

  } catch (error) {
    console.error("Error processing form:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
