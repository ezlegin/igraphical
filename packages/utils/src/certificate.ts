// Server-only: NOT a "use server" module (that made it a public endpoint) and
// not re-exported from @igraph/utils. Import from "@igraph/utils/src/certificate".
import { User } from "@igraph/database";
import path from "path";
import PDFDocument from "pdfkit";
import { formatDurationToWords } from "./format";
import moment from "moment-jalaali";
import {
  LOGO_PNG,
  SIGNATURE_PNG,
  STAMP_PNG,
  VERIFY_QR_PNG,
} from "./certificate-assets";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/**
 * pdfkit lays an "rtla" line out fully reversed, so left-to-right runs
 * (numbers, Latin words such as "UI" or "2025") are reversed up front to come
 * out readable. Digits are shown as Persian digits.
 */
function rtl(text: string): string {
  return String(text)
    .replace(/[A-Za-z0-9][A-Za-z0-9 .:/\-+&]*[A-Za-z0-9]|[A-Za-z0-9]/g, (m) =>
      m.split("").reverse().join(""),
    )
    .replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]!);
}

const INK = "#16122B";
const PRIMARY = "#6D4AFF";
const LIME = "#D4FF3F";
const PAPER = "#FEFEFE";
const MUTED = "#7A7688";

const image = (base64: string) => Buffer.from(base64, "base64");

type LineOptions = {
  x?: number;
  width?: number;
  align?: "right" | "center" | "left";
};

/**
 * Draws the course-completion certificate (A4 landscape) and returns the PDF.
 * Everything is vector-drawn here; only the signature, stamp, logo and QR are
 * images (see certificate-assets.ts). Fonts come from the app's public/fonts.
 */
export async function generateCertificate(
  user: User,
  courseTitle: string,
  courseDuration: number,
  completedAt: Date,
  serialNumber: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const fonts = path.join(process.cwd(), "public/fonts");
      moment.loadPersian({
        dialect: "persian-modern",
        usePersianDigits: false,
      });
      const completedOn = moment(completedAt).format("jYYYY/jMM/jDD");

      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 0,
        font: path.join(fonts, "Kalameh-Medium.ttf"),
      });
      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      doc.registerFont("medium", path.join(fonts, "Kalameh-Medium.ttf"));
      doc.registerFont(
        "regular",
        path.join(fonts, "woff/KalamehWeb-Regular.woff"),
      );
      doc.registerFont(
        "semi",
        path.join(fonts, "woff/KalamehWeb-SemiBold.woff"),
      );
      doc.registerFont("bold", path.join(fonts, "woff/KalamehWeb-Bold.woff"));

      const W = 842;
      const H = 595;
      const BAND = 172; // dark band on the right
      const MAIN = W - BAND;
      const PAD = 60;
      const right = MAIN - PAD; // right edge of text in the main area
      const textW = right - PAD;

      // one right-to-left line of text
      const line = (
        font: string,
        size: number,
        color: string,
        text: string,
        y: number,
        opts: LineOptions = {},
      ) =>
        doc
          .font(font)
          .fontSize(size)
          .fillColor(color)
          .text(rtl(text), opts.x ?? PAD, y, {
            width: opts.width ?? textW,
            align: opts.align ?? "right",
            features: ["rtla"],
            lineBreak: false,
          });

      // ---------- paper ----------
      doc.rect(0, 0, W, H).fill(PAPER);
      doc
        .save()
        .moveTo(-20, 470)
        .bezierCurveTo(140, 250, 300, 620, 440, 380)
        .bezierCurveTo(520, 250, 600, 300, 660, 180)
        .lineWidth(40)
        .strokeOpacity(0.03)
        .stroke("#000000")
        .restore();
      // frame with "anchor point" corners
      doc.lineWidth(0.8).strokeColor("#DCDCDC");
      doc.rect(22, 22, MAIN - 34, H - 44).stroke();
      for (const [cx, cy] of [
        [22, 22],
        [MAIN - 12, 22],
        [22, H - 22],
        [MAIN - 12, H - 22],
      ] as const) {
        doc.rect(cx - 4, cy - 4, 8, 8).fillAndStroke(PAPER, PRIMARY);
      }

      // ---------- heading, recipient, facts ----------
      // drawn 12% larger as one block, anchored top-right
      const SCALE = 1.12;
      doc.save().scale(SCALE, SCALE, { origin: [right, 78] });
      doc
        .font("bold")
        .fontSize(7.5)
        .fillColor(PRIMARY)
        .text("CERTIFICATE OF COMPLETION", PAD, 84, {
          width: textW,
          align: "right",
          characterSpacing: 2.8,
          lineBreak: false,
        });
      line("bold", 24, INK, "گواهینامه پایان دوره", 100);
      doc.roundedRect(right - 44, 140, 44, 3.5, 1.75).fill(LIME);

      line(
        "regular",
        10,
        MUTED,
        "این گواهینامه با افتخار تقدیم می‌شود به",
        172,
      );
      line("bold", 20, INK, user.fullName, 190);
      line(
        "regular",
        10,
        MUTED,
        `با کد ملی ${user.nationalId}، به پاس گذراندن موفقیت‌آمیز`,
        228,
      );

      // course title, shrunk to fit one line
      let titleSize = 16;
      doc.font("bold");
      while (
        titleSize > 9 &&
        doc.fontSize(titleSize).widthOfString(courseTitle) > textW / SCALE
      )
        titleSize -= 0.5;
      line("bold", titleSize, PRIMARY, courseTitle, 248);

      const facts: [string, string][] = [
        ["مدت دوره", `بیش از ${formatDurationToWords(courseDuration)}`],
        ["تاریخ پایان", completedOn],
        ["شماره سریال", serialNumber],
      ];
      const fw = 112;
      const fy = 296;
      facts.forEach(([label, value], i) => {
        const x = right - fw - i * (fw + 8);
        doc
          .lineWidth(0.6)
          .roundedRect(x, fy, fw, 40, 8)
          .fillAndStroke("#FFFFFF", "#E6E6E6");
        line("regular", 7.5, MUTED, label, fy + 8, {
          x: x + 11,
          width: fw - 22,
        });
        line("semi", 10, INK, value, fy + 20, { x: x + 11, width: fw - 22 });
      });
      doc.restore();

      // ---------- signature (left) and issuer with stamp (right) ----------
      const sx = PAD;
      const sy = 392;

      // stamp: just left of the text edge, over the issuer lines, slightly tilted
      const stampX = right - 68 - 34;
      const stampY = sy + 26;
      doc.save().rotate(-5, { origin: [stampX + 34, stampY + 34] });
      doc.image(image(STAMP_PNG), stampX, stampY, { width: 68 });
      doc.restore();

      doc.image(image(SIGNATURE_PNG), sx + 25, sy + 2, { width: 118 });
      doc
        .moveTo(sx, sy + 86)
        .lineTo(sx + 168, sy + 86)
        .lineWidth(0.8)
        .stroke("#D2D2D2");
      line("semi", 10.5, INK, "علیرضا ازلگینی", sy + 93, {
        x: sx,
        width: 168,
        align: "center",
      });
      line("regular", 8, MUTED, "مدیرعامل شرکت افق برنامه هوشمند", sy + 109, {
        x: sx,
        width: 168,
        align: "center",
      });

      const issuer = { x: right - 240, width: 240 };
      line("regular", 8, MUTED, "صادر شده توسط", sy + 78, issuer);
      line("semi", 10.5, INK, "شرکت افق برنامه هوشمند", sy + 91, issuer);
      line("regular", 8, MUTED, "مدرسه آنلاین آی‌گرافیکال", sy + 109, issuer);

      // ---------- dark band ----------
      doc.rect(MAIN, 0, BAND, H).fill(INK);
      doc.save().rect(MAIN, 0, BAND, H).clip();
      doc
        .circle(W + 20, -10, 130)
        .fillOpacity(0.5)
        .fill(PRIMARY);
      doc
        .circle(MAIN - 10, H + 30, 100)
        .fillOpacity(0.1)
        .fill(LIME);
      doc.fillOpacity(1);
      // lime pen stroke with anchor points
      doc
        .moveTo(MAIN + 30, 318)
        .bezierCurveTo(MAIN + 66, 236, MAIN + 100, 346, MAIN + 142, 262)
        .lineWidth(1.6)
        .stroke(LIME);
      for (const [cx, cy] of [
        [MAIN + 30, 318],
        [MAIN + 142, 262],
      ] as const)
        doc
          .rect(cx - 3, cy - 3, 6, 6)
          .lineWidth(1.2)
          .fillAndStroke(INK, LIME);
      doc.restore();

      const bandCenter = MAIN + BAND / 2;
      doc.image(image(LOGO_PNG), bandCenter - 32, 56, {
        fit: [64, 64],
        align: "center",
        valign: "center",
      });
      doc
        .font("bold")
        .fontSize(13)
        .fillColor("#FFFFFF")
        .text("iGraphical", MAIN, 126, { width: BAND, align: "center" });
      doc
        .font("medium")
        .fontSize(6)
        .fillColor("#B9B2D6")
        .text("ONLINE SCHOOL", MAIN, 144, {
          width: BAND,
          align: "center",
          characterSpacing: 2.4,
        });

      // QR to the verification page
      const q = 66;
      const qy = 412;
      doc
        .roundedRect(bandCenter - q / 2 - 7, qy - 7, q + 14, q + 14, 11)
        .fill("#FFFFFF");
      doc.image(image(VERIFY_QR_PNG), bandCenter - q / 2, qy + 2, { width: q });
      line("semi", 8.5, "#FFFFFF", "اعتبارسنجی مدرک", qy + q + 15, {
        x: MAIN,
        width: BAND,
        align: "center",
      });
      doc
        .font("medium")
        .fontSize(7)
        .fillColor("#B9B2D6")
        .text("igraphical.ir/verify-cert", MAIN, qy + q + 30, {
          width: BAND,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
