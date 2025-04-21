const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let client;

const initWhatsapp = async () => {
  if (client) return client; // Return if already initialized

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      executablePath: "/usr/bin/google-chrome-stable",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
        "--disable-popup-blocking",
      ],
    },
  });

  client.on("qr", (qr) => {
    console.log("📲 Scan this QR code to login:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
  });

  client.on("authenticated", (session) => {
    console.log("✅ AUTHENTICATED");
  });

  client.on("auth_failure", (message) => {
    console.error("❌ AUTHENTICATION FAILURE", message);
  });

  client.on("disconnected", (reason) => {
    console.log("⚠️ Client was logged out", reason);
  });

  await client.initialize();

  return client;
};

module.exports = { initWhatsapp };
