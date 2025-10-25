require('dotenv').config();
const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function sendMail({ to, subject, html }) {
  try {
    const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

    const rawMessage = [
      `From: "${process.env.FROM_NAME}" <${process.env.SMTP_USER}>`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
      "MIME-Version: 1.0",
      "Content-Type: text/html; charset=UTF-8",
      "",
      html
    ].join("\n");

    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });
  } catch (error) {
    console.error("❌ Lỗi gửi mail:", error);
  }
}

module.exports = sendMail;
