const QRCode = require("qrcode");

async function generateQrCode(link) {
  try {
    const buffer = await QRCode.toBuffer(link, {
      type: "png",
      errorCorrectionLevel: "H",
      margin: 2,
      width: 256,
    });
    return buffer;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw error;
  }
}

module.exports = {
  generateQrCode,
};
