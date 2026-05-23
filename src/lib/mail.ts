import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.MAIL_HOST || "127.0.0.1";
  const port = parseInt(process.env.MAIL_PORT || "1026");
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  const transportConfig: any = {
    host,
    port,
  };

  const isLocal = host === "127.0.0.1" || host === "localhost";
  if (isLocal) {
    transportConfig.ignoreTLS = true;
  }

  // Only append auth if credentials are provided
  if (user && pass) {
    transportConfig.auth = { user, pass };
  } else {
    // If not localhost/local network and no auth, warn and mock
    if (!isLocal) {
      console.warn(
        "Mail environment variables (MAIL_USER / MAIL_PASS) are not set. Emails will be logged to console in mock format."
      );
      return null;
    }
  }

  return nodemailer.createTransport(transportConfig);
};

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  icalEvent?: {
    filename: string;
    content: string | Buffer;
  };
}) {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || "Tu Tutor de Inglés <noreply@tututordeingles.online>";

  if (!transporter) {
    console.log("\n=== MOCK EMAIL SENT ===");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text}`);
    if (options.icalEvent) {
      console.log(`Calendar Attachment Included: ${options.icalEvent.filename}`);
    }
    console.log("=======================\n");
    return { mock: true };
  }

  const mailOptions: any = {
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  if (options.icalEvent) {
    mailOptions.alternatives = [
      {
        contentType: "text/calendar; charset=utf-8; method=REQUEST",
        content: options.icalEvent.content,
      },
    ];
  }

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully: ${info.messageId}`);
  return info;
}
