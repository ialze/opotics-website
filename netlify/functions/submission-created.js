const tls = require("tls");

/**
 * Minimal SMTP client using Node.js built-in tls module.
 * No external dependencies required.
 */
function sendSmtpEmail({ host, port, user, pass, from, fromName, to, subject, html }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, host, { rejectUnauthorized: true }, () => {
      let buffer = "";
      let commandQueue = [];
      let currentStep = 0;
      let dataMode = false;

      const commands = [
        { cmd: `EHLO opotics.com`, expect: "250" },
        { cmd: `AUTH LOGIN`, expect: "334" },
        { cmd: Buffer.from(user).toString("base64"), expect: "334" },
        { cmd: Buffer.from(pass).toString("base64"), expect: "235" },
        { cmd: `MAIL FROM:<${from}>`, expect: "250" },
        { cmd: `RCPT TO:<${to}>`, expect: "250" },
        { cmd: `DATA`, expect: "354" },
        {
          cmd: [
            `From: "${fromName}" <${from}>`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=UTF-8`,
            ``,
            html,
            `.`,
          ].join("\r\n"),
          expect: "250",
        },
        { cmd: `QUIT`, expect: "221" },
      ];

      function processResponse(response) {
        const code = response.substring(0, 3);

        if (currentStep === 0) {
          // Initial server greeting
          if (code === "220") {
            socket.write(commands[currentStep].cmd + "\r\n");
          } else {
            reject(new Error(`Unexpected greeting: ${response}`));
            socket.destroy();
          }
          return;
        }

        const expected = commands[currentStep - 1].expect;
        if (!code.startsWith(expected.substring(0, 1))) {
          reject(new Error(`SMTP error at step ${currentStep}: expected ${expected}, got ${response.trim()}`));
          socket.destroy();
          return;
        }

        if (currentStep < commands.length) {
          socket.write(commands[currentStep].cmd + "\r\n");
          currentStep++;
        } else {
          resolve();
          socket.destroy();
        }
      }

      socket.on("data", (data) => {
        buffer += data.toString();
        const lines = buffer.split("\r\n");
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.length > 0) {
            // Multi-line responses have a dash after the code (e.g., "250-")
            // Only process the final line (e.g., "250 " or just "250")
            if (line.length >= 4 && line[3] === "-") continue;
            processResponse(line);
          }
        }
      });

      socket.on("error", (err) => {
        reject(new Error(`SMTP connection error: ${err.message}`));
      });

      socket.on("timeout", () => {
        reject(new Error("SMTP connection timed out"));
        socket.destroy();
      });

      socket.setTimeout(10000);
    });
  });
}

exports.handler = async function (event, context) {
  try {
    const { payload } = JSON.parse(event.body);
    const submitterName = payload.data.name || "Valued Customer";
    const submitterEmail = payload.data.email;

    if (!submitterEmail) {
      console.log("No email provided in submission, skipping auto-reply.");
      return { statusCode: 200, body: "No email provided." };
    }

    console.log(`Sending auto-reply to: ${submitterEmail}`);

    await sendSmtpEmail({
      host: process.env.SMTP_HOST || "smtp.forwardemail.net",
      port: parseInt(process.env.SMTP_PORT || "465"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: "solutions@opotics.com",
      fromName: "OPOTICS",
      to: submitterEmail,
      subject: "Thank you for contacting OPOTICS",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0a0a0a; font-size: 24px; margin: 0;">OPOTICS</h1>
            <p style="color: #666; font-size: 13px; margin: 5px 0 0 0;">Advanced Robotics Solutions</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 12px; padding: 30px; margin-bottom: 20px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
              Dear <strong>${submitterName}</strong>,
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

    console.log(`Auto-reply sent successfully to: ${submitterEmail}`);
    return { statusCode: 200, body: "Auto-reply sent successfully." };
  } catch (error) {
    console.error("Auto-reply error:", error.message);
    return { statusCode: 500, body: `Auto-reply failed: ${error.message}` };
  }
};
