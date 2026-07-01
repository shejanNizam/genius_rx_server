/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import PDFDocument from "pdfkit";
import AppError from "../errorHelpers/AppError";

export interface IInvoiceData {
  transactionId: string;
  bookingDate: Date;
  userName: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}

const C = {
  primary: "#1B4F72",
  accent: "#C49A22",
  light: "#F8FAFC",
  text: "#1A202C",
  muted: "#718096",
  border: "#E2E8F0",
  white: "#FFFFFF",
  green: "#22543D",
  greenBg: "#F0FFF4",
  headerMuted: "#8AA4BC",
};

const hline = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  w: number,
  color = C.border,
  thickness = 0.5,
) =>
  doc
    .save()
    .strokeColor(color)
    .lineWidth(thickness)
    .moveTo(x, y)
    .lineTo(x + w, y)
    .stroke()
    .restore();

const lbl = (
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  opts?: PDFKit.Mixins.TextOptions,
) => doc.fillColor(C.muted).fontSize(8).font("Helvetica-Bold").text(text, x, y, opts);

const val = (
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  opts?: PDFKit.Mixins.TextOptions,
) => doc.fillColor(C.text).fontSize(10).font("Helvetica").text(text, x, y, opts);

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const generatePdf = async (
  invoiceData: IInvoiceData,
): Promise<Buffer> => {
  try {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 0 });
      const chunks: Uint8Array[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const PW = 595.28; // A4 width
      const M = 50; // margin
      const CW = PW - 2 * M; // content width = 495.28

      // ── 1. HEADER BAND ────────────────────────────────────────────
      doc.rect(0, 0, PW, 112).fill(C.primary);

      // Company name
      doc
        .fillColor(C.white)
        .fontSize(26)
        .font("Helvetica-Bold")
        .text("GeniusRX", M, 28);
      doc
        .fillColor(C.accent)
        .fontSize(10)
        .font("Helvetica")
        .text("Empowering Healthcare Careers", M, 60);

      // Invoice label + number (right side)
      doc
        .fillColor(C.headerMuted)
        .fontSize(10)
        .font("Helvetica")
        .text("INVOICE", 0, 28, { align: "right", width: PW - M });
      doc
        .fillColor(C.white)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(
          `#${invoiceData.transactionId.slice(-8).toUpperCase()}`,
          0,
          44,
          { align: "right", width: PW - M },
        );

      // ── 2. ACCENT STRIPE ─────────────────────────────────────────
      doc.rect(0, 112, PW, 4).fill(C.accent);

      // ── 3. BILL TO + INVOICE META ─────────────────────────────────
      const infoY = 142;

      // Left — Bill To
      lbl(doc, "BILLED TO", M, infoY);
      doc
        .fillColor(C.text)
        .fontSize(15)
        .font("Helvetica-Bold")
        .text(invoiceData.userName, M, infoY + 14);
      doc
        .fillColor(C.muted)
        .fontSize(9)
        .font("Helvetica")
        .text("Valued Customer", M, infoY + 34);

      // Right — details box
      const bx = M + CW * 0.52;
      const bw = CW * 0.48;
      const bh = 92;

      doc.rect(bx, infoY - 8, bw, bh).fill(C.light);
      doc.rect(bx, infoY - 8, 3, bh).fill(C.accent); // left accent bar

      const half = bx + bw / 2;

      lbl(doc, "TRANSACTION ID", bx + 12, infoY + 4);
      doc
        .fillColor(C.text)
        .fontSize(8)
        .font("Helvetica")
        .text(invoiceData.transactionId, bx + 12, infoY + 16, {
          width: bw - 20,
        });

      lbl(doc, "BOOKING DATE", bx + 12, infoY + 40);
      val(doc, fmtDate(invoiceData.bookingDate), bx + 12, infoY + 52);

      lbl(doc, "ISSUE DATE", half, infoY + 40);
      val(doc, fmtDate(new Date()), half, infoY + 52);

      // ── 4. DIVIDER ───────────────────────────────────────────────
      const divY = infoY + 100;
      hline(doc, M, divY, CW, C.border, 1);

      // ── 5. TABLE ─────────────────────────────────────────────────
      const tY = divY + 16;

      const cDesc = { x: M, w: CW * 0.55 };
      const cGuests = { x: M + CW * 0.55, w: CW * 0.18 };
      const cAmt = { x: M + CW * 0.73, w: CW * 0.27 };

      // Header row
      doc.rect(M, tY, CW, 26).fill(C.primary);
      const thY = tY + 8;
      doc.fillColor(C.white).fontSize(9).font("Helvetica-Bold");
      doc.text("DESCRIPTION", cDesc.x + 10, thY);
      doc.text("GUESTS", cGuests.x, thY, {
        width: cGuests.w,
        align: "center",
      });
      doc.text("AMOUNT (USD)", cAmt.x, thY, {
        width: cAmt.w - 5,
        align: "right",
      });

      // Data row
      const drY = tY + 26;
      doc.rect(M, drY, CW, 40).fill(C.light);
      const rdY = drY + 13;

      doc
        .fillColor(C.text)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(invoiceData.tourTitle, cDesc.x + 10, rdY, {
          width: cDesc.w - 20,
        });

      doc
        .fillColor(C.muted)
        .fontSize(10)
        .font("Helvetica")
        .text(`${invoiceData.guestCount} pax`, cGuests.x, rdY, {
          width: cGuests.w,
          align: "center",
        });

      doc
        .fillColor(C.text)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`$${invoiceData.totalAmount.toFixed(2)}`, cAmt.x, rdY, {
          width: cAmt.w - 5,
          align: "right",
        });

      hline(doc, M, drY + 40, CW, C.border, 0.5);

      // ── 6. TOTALS ────────────────────────────────────────────────
      const totX = M + CW * 0.58;
      const totW = CW * 0.42;
      let totY = drY + 58;

      const totRow = (label: string, amount: string, bold = false) => {
        doc
          .fillColor(C.muted)
          .fontSize(9)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .text(label, totX, totY);
        doc
          .fillColor(C.text)
          .fontSize(9)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .text(amount, totX, totY, { width: totW, align: "right" });
        totY += 18;
      };

      totRow("Subtotal", `$${invoiceData.totalAmount.toFixed(2)}`);
      totRow("Tax (0%)", "$0.00");
      hline(doc, totX, totY, totW, C.border, 0.5);
      totY += 10;

      // Total box
      doc.rect(totX, totY, totW, 36).fill(C.primary);
      doc
        .fillColor(C.white)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("TOTAL DUE", totX + 12, totY + 11);
      doc
        .fillColor(C.accent)
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`$${invoiceData.totalAmount.toFixed(2)}`, totX, totY + 10, {
          width: totW - 10,
          align: "right",
        });

      // ── 7. PAID BADGE ────────────────────────────────────────────
      const badgeY = totY + 54;
      doc.rect(M, badgeY, 64, 22).fill(C.greenBg);
      doc.rect(M, badgeY, 3, 22).fill(C.green);
      doc
        .fillColor(C.green)
        .fontSize(9.5)
        .font("Helvetica-Bold")
        .text("PAID", M + 11, badgeY + 6);

      // ── 8. NOTES ─────────────────────────────────────────────────
      const noteY = badgeY + 44;
      lbl(doc, "NOTES & TERMS", M, noteY);
      hline(doc, M, noteY + 13, CW, C.border, 0.5);
      doc
        .fillColor(C.text)
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Thank you for choosing GeniusRX! This invoice serves as your official payment confirmation. " +
            "Please retain a copy for your records. For any questions or amendments, " +
            "contact us at support@geniusrx.com within 7 days of your booking date.",
          M,
          noteY + 20,
          { width: CW },
        );

      // ── 9. FOOTER ────────────────────────────────────────────────
      doc.rect(0, 792, PW, 50).fill(C.primary);
      doc.rect(0, 792, PW, 3).fill(C.accent);

      doc
        .fillColor(C.white)
        .fontSize(9)
        .font("Helvetica")
        .text(
          "GeniusRX  ·  support@geniusrx.com  ·  +1 (800) 123-4567  ·  www.geniusrx.com",
          0,
          807,
          { align: "center", width: PW },
        );
      doc
        .fillColor(C.headerMuted)
        .fontSize(8)
        .font("Helvetica")
        .text(
          `Generated on ${fmtDate(new Date())}  ·  Page 1 of 1`,
          0,
          824,
          { align: "center", width: PW },
        );

      doc.end();
    });
  } catch (error: any) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Pdf creation error ${error.message}`,
    );
  }
};
