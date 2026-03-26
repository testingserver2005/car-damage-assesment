import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const app = express();
app.use(cors());

// Multer config: store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ============================
// 🚗 Route: Send Assessment Email
// ============================
// ✅ IMPROVED EMAIL SENDING WITH SPAM PREVENTION

app.post("/api/sendEmail", upload.any(), async (req, res) => {
  try {
    const fields = req.body;
    const files = req.files || [];

    // Parse data
    const name = fields.name || "N/A";
    const email = fields.email || "N/A";
    const mobile = fields.mobile || "N/A";
    const address = fields.address || "N/A";
    const carNumberPlate = fields.carNumberPlate || "N/A";
    const serviceType = fields.serviceType || "N/A";
    const carMake = fields.car_make || "N/A";
    const carModel = fields.car_model || "N/A";
    const totalDamageAreas = fields.totalDamageAreas || "0";
    const submittedAt = fields.submittedAt || new Date().toISOString();

    // Collect damages
    const damages = Object.keys(fields)
      .filter((key) => key.startsWith("damage_"))
      .map((key) => fields[key]);

    // Prepare attachments
    const attachments = [];
    let imagesHTML = `
<table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
  <tr>
`;

    files.forEach((file, i) => {
      const cid = `image${i}@damage`;
      attachments.push({
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
        cid,
      });

      // Use table instead of flexbox
      imagesHTML += `
    <td style="padding: 4px;">
      <img 
        src="cid:${cid}" 
        alt="damage ${i + 1}" 
        width="100" 
        height="100"
        style="
          border: 1px solid #ddd;
          border-radius: 6px;
          display: block;
        "
      />
    </td>
  `;
    });

    imagesHTML += `
  </tr>
</table>`;

    // ✅ IMPROVED HTML - Table-based, no flexbox
    const adminHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="700" style="background-color: #ffffff; border: 1px solid #eeeeee; border-radius: 8px; overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #fb5c14; color: #ffffff; padding: 18px 24px; text-align: center;">
            <h2 style="margin: 0; font-family: Arial, sans-serif; font-weight: 600;">Rapport for skadesanmeldelse</h2>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 24px;">
            
            <!-- Customer Details -->
            <h3 style="font-family: Arial, sans-serif; color: #333333; border-bottom: 2px solid #fb5c14; padding-bottom: 6px; margin-bottom: 12px;">Kundedetaljer</h3>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Navn:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>E-mail:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Mobil:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${mobile}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Adresse:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${address}</td>
              </tr>
            </table>

            <!-- Vehicle Details -->
            <h3 style="font-family: Arial, sans-serif; color: #333333; border-bottom: 2px solid #fb5c14; padding-bottom: 6px; margin-bottom: 12px;">Køretøjsoplysninger</h3>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Nummerplade:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${carNumberPlate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Servicetype:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${serviceType}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Mærke:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${carMake}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;"><strong>Model:</strong></td>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; color: #333333;">${carModel}</td>
              </tr>
            </table>

            <!-- Damages -->
            <h3 style="font-family: Arial, sans-serif; color: #333333; border-bottom: 2px solid #fb5c14; padding-bottom: 6px; margin-bottom: 12px;">Rapporterede skader</h3>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 20px;">
              ${damages.map((d) => `<tr><td style="padding: 4px 0; font-family: Arial, sans-serif; color: #333333;">• ${d}</td></tr>`).join("")}
            </table>

            <!-- Images -->
            <h3 style="font-family: Arial, sans-serif; color: #333333; border-bottom: 2px solid #fb5c14; padding-bottom: 6px; margin-bottom: 12px;">Vedhæftede billeder</h3>
            ${imagesHTML}

            <!-- Summary -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eeeeee;">
              <tr>
                <td style="padding: 6px 0; font-family: Arial, sans-serif; font-size: 13px; color: #777777;">
                  <strong>Samlet antal skadede områder:</strong> ${totalDamageAreas}<br/>
                  <strong>Indsendt den:</strong> ${new Date(submittedAt).toLocaleString('da-DK')}
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #fafafa; text-align: center; padding: 12px; font-family: Arial, sans-serif; font-size: 12px; color: #999999;">
            © ${new Date().getFullYear()} Quick Repair – Rapport for skadesanmeldelse
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

    // ✅ IMPROVED User Thank You Email
    const userHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #f9f9f9; border: 1px solid #dddddd; border-radius: 8px; padding: 20px;">
        
        <tr>
          <td style="font-family: Arial, sans-serif; color: #333333;">
            <h2 style="margin: 0 0 16px 0;">Hej ${name},</h2>
            <p style="margin: 0 0 16px 0; line-height: 1.6;">Tak fordi du valgte at anmelde din skade hos QuickRepair.dk.</p>
          </td>
        </tr>

        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 20px 0; border-collapse: collapse;">
              <tr style="background-color: #ececec;">
                <th style="padding: 10px; text-align: left; font-family: Arial, sans-serif; border: 1px solid #dddddd;">Mærke</th>
                <th style="padding: 10px; text-align: left; font-family: Arial, sans-serif; border: 1px solid #dddddd;">Model</th>
              </tr>
              <tr>
                <td style="padding: 10px; font-family: Arial, sans-serif; border: 1px solid #dddddd;">${carMake}</td>
                <td style="padding: 10px; font-family: Arial, sans-serif; border: 1px solid #dddddd;">${carModel}</td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="font-family: Arial, sans-serif; color: #333333;">
            <p style="margin: 0 0 16px 0; line-height: 1.6;">Vi har registreret din skadesanmeldelse og går i gang med behandlingen hurtigst muligt. Som regel hører du fra os inden for 1-2 hverdage, hvor vi kontakter dig telefonisk.</p>
            
            <p style="margin: 30px 0 8px 0;">Med venlig hilsen,<br/><strong>QuickRepair.dk</strong></p>
            
            <a href="http://quickrepair.dk/" target="_blank">
            <img 
  src="https://skadesanmeldelse.quickrepair.dk/logo.png" 
  alt="QuickRepair.dk"
  style="display:block;"
/>
</a>
          </td>
        </tr>

        <tr>
          <td style="padding-top: 20px; border-top: 1px solid #dddddd; margin-top: 20px;">
            <p style="font-family: Arial, sans-serif; font-size: 12px; color: #888888; margin: 0;">Dette er en automatisk genereret besked. Besvar venligst ikke denne e-mail.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

    // ✅ Nodemailer with improved headers
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Send to admin with improved headers
    await transporter.sendMail({
      from: `"QuickRepair.dk" <${process.env.SMTP_USER}>`,
      to: process.env.TO_email,
      replyTo: email,
      subject: `Ny skadesanmeldelse fra ${name} - ${carMake} ${carModel}`,
      html: adminHTML,
      attachments: [
        // Inline images (CID for email body)
        ...attachments,
        // Full-size downloadable copies
        ...files.map((file, i) => ({
          filename: `skade_${i + 1}_${file.originalname}`,
          content: file.buffer,
          contentType: file.mimetype,
        })),
      ],
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    });

    // ✅ Send thank you to user with improved headers
    await transporter.sendMail({
      from: `"QuickRepair.dk" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Din skadesanmeldelse er nu modtaget ✓",
      html: userHTML,
      headers: {
        'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
        'X-Entity-Ref-ID': `damage-report-${Date.now()}`
      }
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ✅ Export for serverless
export default app;
// export const handler = serverless(app);
