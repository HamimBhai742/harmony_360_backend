import PDFDocument from "pdfkit";
import path from "path";

export const reportService = {
  async buildPdfBuffer(lead: any, result: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
        autoFirstPage: true,
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const band: any = result.band || {};
      const dimensionScores: any[] = (result.dimensionScores as any[]) || [];

      const logoPath = path.join(process.cwd(), "src/assets/harmony-logo.png");

      const colors = {
        primary: "#F5A623", // Harmony yellow/orange
        secondary: "#4B5563", // Harmony logo gray
        accent: "#E85D2A", // orange/red accent
        blue: "#2D8FD5", // Harmony logo blue

        success: "#22C55E",
        warning: "#F5A623",
        danger: "#EF4444",

        text: "#1F2937",
        subText: "#6B7280",
        light: "#F8FAFC",
        border: "#E5E7EB",

        softPrimary: "#FFF7E6",
        softBlue: "#EAF5FC",
        softGreen: "#ECFDF5",
        softAmber: "#FFFBEB",
        softRed: "#FEF2F2",
        white: "#FFFFFF",
      };

      // -------------------------
      // Normalized Dimension Score
      // Example: raw 7/10 => 14/20
      // -------------------------
      const getNormalizedDimensionScore = (score: any) => {
        const rawScore = Number(score.rawScore || 0);
        const maxScore = Number(score.maxScore || 1);

        return Math.round((rawScore / maxScore) * 20);
      };

      // -------------------------
      // Rank Based Color Logic
      // Lowest = Red, then Yellow, then Blue, Highest = Green
      // Same score হলেও 4টা dimension different color পাবে
      // -------------------------
      const rankColors = [
        colors.danger,
        colors.warning,
        colors.blue,
        colors.success,
      ];

      const rankedDimensionScores = [...dimensionScores]
        .map((score, index) => ({
          ...score,
          originalIndex: index,
        }))
        .sort((a, b) => {
          if (a.percentage === b.percentage) {
            return a.originalIndex - b.originalIndex;
          }

          return a.percentage - b.percentage;
        });

      const dimensionColorMap: Record<number, string> = {};

      rankedDimensionScores.forEach((score, rank) => {
        dimensionColorMap[score.originalIndex] =
          rankColors[rank] || colors.blue;
      });

      const getBarColor = (index: number) => {
        return dimensionColorMap[index] || colors.blue;
      };

      const getSoftBgColor = (color: string) => {
        if (color === colors.success) return colors.softGreen;
        if (color === colors.warning) return colors.softAmber;
        if (color === colors.danger) return colors.softRed;
        if (color === colors.blue) return colors.softBlue;
        return colors.softPrimary;
      };

      // -------------------------
      // Page Helpers
      // -------------------------
      const pageBottom = () => doc.page.height - 55;

      const addCleanPage = () => {
        doc.addPage();
        doc.y = 50;
        doc.x = 40;
      };

      const ensureSpace = (needed = 100) => {
        if (doc.y + needed > pageBottom()) {
          addCleanPage();
        }
      };

      const drawSectionTitle = (title: string, color = colors.primary) => {
        ensureSpace(45);

        const y = doc.y;

        doc.roundedRect(40, y, 515, 28, 6).fillColor(color).fill();

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(title, 52, y + 8);

        doc.y = y + 42;
      };

      const drawInfoRow = (label: string, value: string) => {
        doc
          .font("Helvetica-Bold")
          .fontSize(9.2)
          .fillColor(colors.secondary)
          .text(`${label}: `, {
            continued: true,
          });

        doc
          .font("Helvetica")
          .fontSize(9.2)
          .fillColor(colors.text)
          .text(value || "N/A");
      };

      const drawBox = (
        title: string,
        body: string,
        options?: {
          bgColor?: string;
          titleColor?: string;
          bodyColor?: string;
          borderColor?: string;
        },
      ) => {
        const bgColor = options?.bgColor || colors.light;
        const titleColor = options?.titleColor || colors.secondary;
        const bodyColor = options?.bodyColor || colors.text;
        const borderColor = options?.borderColor || colors.border;

        const bodyHeight = doc.heightOfString(body || "N/A", {
          width: 475,
          align: "left",
          lineGap: 2,
        });

        const boxHeight = Math.max(bodyHeight + 48, 75);

        ensureSpace(boxHeight + 15);

        const startY = doc.y;

        doc
          .roundedRect(40, startY, 515, boxHeight, 8)
          .fillColor(bgColor)
          .fill();

        doc
          .roundedRect(40, startY, 515, boxHeight, 8)
          .strokeColor(borderColor)
          .lineWidth(1)
          .stroke();

        doc
          .fillColor(titleColor)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(title || "N/A", 55, startY + 12, {
            width: 475,
          });

        doc
          .fillColor(bodyColor)
          .font("Helvetica")
          .fontSize(10)
          .text(body || "N/A", 55, startY + 34, {
            width: 475,
            align: "left",
            lineGap: 2,
          });

        doc.y = startY + boxHeight + 14;
      };

      const drawMiniBandCard = (
        label: string,
        value: string,
        x: number,
        y: number,
        w: number,
        bgColor: string,
        accentColor: string,
      ) => {
        doc
          .roundedRect(x + 1, y + 2, w, 58, 8)
          .fillColor("#E5E7EB")
          .fill();

        doc.roundedRect(x, y, w, 58, 8).fillColor(bgColor).fill();

        doc
          .roundedRect(x, y, w, 58, 8)
          .strokeColor(colors.border)
          .lineWidth(1)
          .stroke();

        doc.rect(x, y, 4, 58).fillColor(accentColor).fill();

        doc
          .font("Helvetica")
          .fontSize(8.5)
          .fillColor(colors.subText)
          .text(label, x + 14, y + 10, {
            width: w - 24,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(10.5)
          .fillColor(colors.secondary)
          .text(value || "N/A", x + 14, y + 29, {
            width: w - 24,
            lineGap: 1,
          });
      };

      const drawScoreBar = (
        label: string,
        valueText: string,
        percentage: number,
        index: number,
      ) => {
        ensureSpace(45);

        const startX = 45;
        const startY = doc.y;
        const barX = 45;
        const barY = startY + 20;
        const barWidth = 360;
        const barHeight = 9;

        const fillWidth = Math.max(
          0,
          Math.min(barWidth, (percentage / 100) * barWidth),
        );

        const barColor = getBarColor(index);

        doc
          .font("Helvetica-Bold")
          .fontSize(10.5)
          .fillColor(colors.secondary)
          .text(label || "N/A", startX, startY, {
            width: 310,
          });

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(colors.subText)
          .text(valueText, 410, startY, {
            width: 70,
            align: "right",
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(9)
          .fillColor(barColor)
          .text(`${percentage || 0}%`, 485, startY, {
            width: 45,
            align: "right",
          });

        doc
          .roundedRect(barX, barY, barWidth, barHeight, 4)
          .fillColor("#E5E7EB")
          .fill();

        doc
          .roundedRect(barX, barY, fillWidth, barHeight, 4)
          .fillColor(barColor)
          .fill();

        doc.y = startY + 36;
      };

      const drawDimensionDetailCard = (
        score: any,
        index: number,
        x: number,
        y: number,
        w: number,
        h: number,
      ) => {
        const color = getBarColor(index);
        const bgColor = getSoftBgColor(color);
        const normalizedScore = getNormalizedDimensionScore(score);

        const radius = 8;

        // Shadow
        doc
          .roundedRect(x + 2, y + 3, w, h, radius)
          .fillColor("#E2E8F0")
          .fill();

        // Main card
        doc.roundedRect(x, y, w, h, radius).fillColor(colors.white).fill();

        doc
          .roundedRect(x, y, w, h, radius)
          .strokeColor(colors.border)
          .lineWidth(1)
          .stroke();

        // Top color line
        doc.rect(x, y, w, 4).fillColor(color).fill();

        // Header background
        doc
          .rect(x, y + 4, w, 50)
          .fillColor(bgColor)
          .fill();

        doc
          .font("Helvetica")
          .fontSize(7.2)
          .fillColor(color)
          .text(`Dimension 0${index + 1}`, x + 12, y + 12, {
            width: w - 95,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(8.8)
          .fillColor(color)
          .text(score.title || "N/A", x + 12, y + 26, {
            width: w - 110,
            lineGap: 0,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(12.5)
          .fillColor(color)
          .text(`${normalizedScore}/20`, x + w - 82, y + 24, {
            width: 68,
            align: "right",
          });

        const percentage = Number(score.percentage || 0);

        const insight =
          percentage >= 80
            ? "This dimension shows strong alignment and reliable execution across the organization."
            : percentage >= 60
              ? "This dimension has a developing foundation, but consistency still needs improvement."
              : percentage >= 40
                ? "This dimension shows visible alignment gaps that may affect customer and employee experience."
                : "This dimension is currently a critical alignment risk and should be improved first.";

        const nextStep =
          percentage >= 80
            ? "Maintain this strength and use it as a model for other weaker dimensions."
            : percentage >= 60
              ? "Improve ownership, communication, and process consistency across teams."
              : percentage >= 40
                ? "Create clearer standards and reinforce expectations with leadership support."
                : "Prioritize this area immediately and remove blockers affecting execution.";

        doc
          .font("Helvetica")
          .fontSize(7.6)
          .fillColor(colors.text)
          .text(insight, x + 12, y + 66, {
            width: w - 24,
            lineGap: 1,
          });

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(colors.secondary)
          .text("Operational Reality", x + 12, y + 108);

        doc
          .font("Helvetica")
          .fontSize(7.2)
          .fillColor(colors.text)
          .text(
            `• Normalized score: ${normalizedScore}/20\n• Alignment percentage: ${percentage}%\n• Priority based on relative performance`,
            x + 12,
            y + 122,
            {
              width: w - 24,
              lineGap: 1,
            },
          );

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor(colors.secondary)
          .text("Next Step", x + 12, y + 164);

        doc
          .font("Helvetica")
          .fontSize(7.2)
          .fillColor(colors.text)
          .text(nextStep, x + 12, y + 178, {
            width: w - 24,
            lineGap: 1,
          });
      };

      // -------------------------
      // HEADER WITH LOGO
      // -------------------------
      doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);

      doc.roundedRect(40, 22, 515, 76, 12).fillColor(colors.white).fill();

      doc
        .roundedRect(40, 22, 515, 76, 12)
        .strokeColor("#FDE68A")
        .lineWidth(1)
        .stroke();

      try {
        doc.image(logoPath, 58, 38, {
          width: 160,
        });
      } catch (error) {
        doc
          .fillColor(colors.secondary)
          .font("Helvetica-Bold")
          .fontSize(20)
          .text("Harmony 360", 58, 42);
      }

      doc
        .fillColor(colors.secondary)
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("Brand & Culture Alignment Snapshot", 235, 34, {
          width: 290,
          align: "right",
        });


      doc
        .font("Helvetica")
        .fontSize(9.5)
        .fillColor(colors.subText)
        .text(
          "A structured overview of your organization’s alignment health",
          235,
          80,
          {
            width: 290,
            align: "right",
          },
        );

      doc.y = 145;

      // -------------------------
      // LEAD INFO + SCORE CARD
      // -------------------------
      ensureSpace(145);

      const infoTop = doc.y + 20;

      doc.roundedRect(40, infoTop, 330, 125, 10).fillColor(colors.light).fill();

      doc
        .roundedRect(40, infoTop, 330, 125, 10)
        .strokeColor(colors.border)
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(colors.secondary)
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Participant Information", 55, infoTop + 12);

      doc.y = infoTop + 34;
      doc.x = 55;

      drawInfoRow("Name", `${lead.firstName || ""} ${lead.lastName || ""}`);
      doc.y += 2;
      drawInfoRow("Email", `${lead.email || "N/A"}`);
      doc.y += 2;
      drawInfoRow("Company", `${lead.companyName || "N/A"}`);
      doc.y += 2;
      drawInfoRow("Role", `${lead.role || "N/A"}`);
      doc.y += 2;
      drawInfoRow("Industry", `${lead.industry || "N/A"}`);
      doc.y += 2;
      drawInfoRow("Goal", `${lead.assessmentGoal || "N/A"}`);

      doc
        .roundedRect(385, infoTop, 170, 125, 10)
        .fillColor(colors.softPrimary)
        .fill();

      doc
        .roundedRect(385, infoTop, 170, 125, 10)
        .strokeColor("#FDE68A")
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(colors.primary)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Overall Score", 385, infoTop + 15, {
          width: 170,
          align: "center",
        });

      doc
        .fillColor(colors.secondary)
        .font("Helvetica-Bold")
        .fontSize(28)
        .text(`${result.normalizedScore || 0}/80`, 385, infoTop + 40, {
          width: 170,
          align: "center",
        });

      doc
        .fillColor(colors.subText)
        .font("Helvetica")
        .fontSize(11)
        .text(
          `${result.finalPercentage || 0}% Alignment Score`,
          385,
          infoTop + 78,
          {
            width: 170,
            align: "center",
          },
        );

      doc
        .fillColor(colors.primary)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(band.diagnosis || "N/A", 385, infoTop + 101, {
          width: 170,
          align: "center",
        });

      doc.y = infoTop + 145;

      // -------------------------
      // BAND SUMMARY
      // -------------------------
      doc.y += 30;
      drawSectionTitle("Band Summary", colors.primary);

      ensureSpace(150);

      const bandY = doc.y;

      drawMiniBandCard(
        "Diagnosis",
        band.diagnosis || "N/A",
        40,
        bandY,
        245,
        colors.softGreen,
        colors.success,
      );

      drawMiniBandCard(
        "Maturity Level",
        band.maturityInterpretation || "N/A",
        310,
        bandY,
        245,
        colors.softBlue,
        colors.blue,
      );

      drawMiniBandCard(
        "Score Range",
        band.scoreRange || `${band.min || "N/A"}–${band.max || "N/A"}`,
        40,
        bandY + 70,
        245,
        colors.softAmber,
        colors.warning,
      );

      drawMiniBandCard(
        "Percentage Range",
        band.percentageRange || "N/A",
        310,
        bandY + 70,
        245,
        colors.light,
        colors.secondary,
      );

      doc.y = bandY + 145;

      drawBox("Band Insight", band.insight || "N/A", {
        bgColor: colors.light,
        titleColor: colors.secondary,
        bodyColor: colors.text,
      });

      drawBox("Band Tension", band.tension || "N/A", {
        bgColor: colors.softAmber,
        titleColor: colors.warning,
        bodyColor: colors.text,
        borderColor: "#FDE68A",
      });

      // -------------------------
      // DIMENSION SCORES
      // -------------------------
      doc.y += 40;
      drawSectionTitle("Your Four Dimension Scores", colors.primary);

      dimensionScores.forEach((score, index) => {
        const normalizedScore = getNormalizedDimensionScore(score);

        doc.y += 8;

        drawScoreBar(
          score.title,
          `${normalizedScore}/20`,
          Number(score.percentage || 0),
          index,
        );
      });

      doc.y += 16;

      // -------------------------
      // DIMENSION DETAILS
      // -------------------------
      const cardW = 252;
      const cardH = 210;
      const gap = 16;
      const gridHeight = cardH * 2 + gap;

      if (doc.y + 45 + gridHeight > pageBottom()) {
        addCleanPage();
      }

      drawSectionTitle("Where Each Dimension Stands", colors.secondary);

      const startX = 40;
      const startY = doc.y;

      dimensionScores.forEach((score, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);

        const x = startX + col * (cardW + gap);
        const y = startY + row * (cardH + gap);

        drawDimensionDetailCard(score, index, x, y, cardW, cardH);
      });

      doc.y = startY + gridHeight + 25;

      // -------------------------
      // PRIMARY TENSION
      // -------------------------
      drawSectionTitle("Primary Tension", colors.warning);

      drawBox(
        result.primaryTensionTitle || "Primary Tension",
        result.primaryTensionBody || "N/A",
        {
          bgColor: colors.softAmber,
          titleColor: colors.secondary,
          bodyColor: colors.text,
          borderColor: "#FDE68A",
        },
      );

      // -------------------------
      // CUSTOMER GOAL
      // -------------------------
      if (result.customerGoalTitle && result.customerGoalBody) {
        drawSectionTitle("Goal-Based Insight", colors.blue);

        drawBox(result.customerGoalTitle, result.customerGoalBody, {
          bgColor: colors.softBlue,
          titleColor: colors.blue,
          bodyColor: colors.text,
          borderColor: "#BFDBFE",
        });
      }

      // -------------------------
      // BRIDGE / CTA
      // -------------------------
      drawSectionTitle("Bridge Statement & Next Step", colors.secondary);

      drawBox("Recommended Next Step", band.bridgeStatement || "N/A", {
        bgColor: colors.softPrimary,
        titleColor: colors.primary,
        bodyColor: colors.text,
        borderColor: "#FDE68A",
      });

      // -------------------------
      // Footer
      // -------------------------
      ensureSpace(65);

      doc
        .moveDown(0.4)
        .font("Helvetica-Oblique")
        .fontSize(10)
        .fillColor(colors.subText)
        .text(
          "Alignment is not accidental — it is designed, measured, and corrected.",
          40,
          doc.y,
          {
            align: "center",
            width: 515,
          },
        );

      doc.moveDown(0.4);

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor("#9CA3AF")
        .text("Generated by Harmony 360 Assessment System", {
          align: "center",
        });

      doc.end();
    });
  },
};

// import puppeteer from "puppeteer";
// import { AssessmentResult, Lead } from "@prisma/client";
// import { generateReportHtml } from "../../utils/generateHtm";

// export const reportService = {
//   async buildPdfBuffer(lead: Lead, result: AssessmentResult): Promise<Buffer> {
//     const html = generateReportHtml(lead, result);

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     await page.setContent(html, {
//       waitUntil: "networkidle0",
//     });

//     const pdfBuffer = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: {
//         top: "0px",
//         right: "0px",
//         bottom: "0px",
//         left: "0px",
//       },
//     });

//     await browser.close();

//     return Buffer.from(pdfBuffer);
//   },
// };
