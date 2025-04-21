const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const os = require("os");

let client;

const initWhatsapp = async () => {
  if (client) return client; // Return if already initialized

  // Base puppeteer options
  const puppeteerOptions = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  };

  // Check if running on Linux (likely Azure VM)
  if (os.platform() === "linux") {
    puppeteerOptions.executablePath = "/usr/bin/google-chrome-stable";
  }

  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: puppeteerOptions,
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
