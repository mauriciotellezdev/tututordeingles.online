import nodemailer from "nodemailer";

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

interface TransportConfig {
  host: string;
  port: number;
  ignoreTLS?: boolean;
  auth?: { user: string; pass: string };
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  alternatives?: { contentType: string; content: string | Buffer }[];
}

function resolveMailSender() {
  const mailFrom = process.env.MAIL_FROM?.trim();
  const email =
    (mailFrom
      ? mailFrom.match(/<([^>]+)>/)?.[1]?.trim() || mailFrom
      : undefined) || "noreply@tututordeingles.online";
  const name =
    (mailFrom ? mailFrom.match(/^(.*?)</)?.[1]?.trim() : undefined) ||
    "Mauricio Tellez";

  return {
    name,
    email,
    formatted: `${name} <${email}>`,
  };
}

async function sendViaBrevoApi(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  icalEvent?: { filename: string; content: string | Buffer };
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not set");
  const sender = resolveMailSender();

  const payload: Record<string, unknown> = {
    sender: { name: sender.name, email: sender.email },
    to: [{ email: options.to }],
    subject: options.subject,
    textContent: options.text,
  };

  if (options.html) payload.htmlContent = options.html;

  if (options.icalEvent) {
    payload.attachment = [
      {
        name: options.icalEvent.filename,
        content: Buffer.isBuffer(options.icalEvent.content)
          ? options.icalEvent.content.toString("base64")
          : Buffer.from(options.icalEvent.content).toString("base64"),
      },
    ];
  }

  const res = await fetch(BREVO_API, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }

  console.log(`Email sent via Brevo API to ${options.to}`);
}

function getTransporter() {
  const host = process.env.MAIL_HOST || "127.0.0.1";
  const port = parseInt(process.env.MAIL_PORT || "1026");
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;
  const transportConfig: TransportConfig = { host, port };
  const isLocal = host === "127.0.0.1" || host === "localhost";
  if (isLocal) transportConfig.ignoreTLS = true;
  if (user && pass) {
    transportConfig.auth = { user, pass };
  }
  return nodemailer.createTransport(transportConfig);
}

async function sendViaSmtp(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  icalEvent?: { filename: string; content: string | Buffer };
}) {
  const from = resolveMailSender().formatted;

  const transporter = getTransporter();

  const mailOptions: MailOptions = {
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
  console.log(`Email sent via SMTP: ${info.messageId}`);
}

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
  if (process.env.BREVO_API_KEY) {
    return sendViaBrevoApi(options);
  }

  if (
    process.env.MAIL_HOST &&
    process.env.MAIL_HOST !== "127.0.0.1" &&
    process.env.MAIL_HOST !== "localhost"
  ) {
    return sendViaSmtp(options);
  }

  console.log("\n=== MOCK EMAIL ===");
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.text}`);
  if (options.icalEvent) {
    console.log(`Calendar: ${options.icalEvent.filename}`);
  }
  console.log("==================\n");
}
