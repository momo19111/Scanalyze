const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let client;

const initWhatsapp = async () => {
  if (client) return client; // Return if already initialized

  client = new Client({
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ],
    },
    authStrategy: new LocalAuth(),
  });

  return new Promise((resolve, reject) => {
    client.on("qr", (qr) => {
      console.log("📲 Scan this QR code to login:");
      qrcode.generate(qr, { small: true });
    });

    client.on("ready", () => {
      console.log("✅ WhatsApp client is ready!");
      resolve(client);
    });

    client.on("authenticated", () => {
      console.log("✅ AUTHENTICATED");
    });

    client.on("auth_failure", (message) => {
      console.error("❌ AUTHENTICATION FAILURE", message);
      reject(new Error("WhatsApp authentication failed."));
    });

    client.on("disconnected", (reason) => {
      console.log("⚠️ Client was logged out", reason);
      client = null;
    });

    client.initialize().catch((err) => {
      reject(err);
    });
  });
};

module.exports = { initWhatsapp };
