import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

/** Add this attribute to any element that must NOT appear in the PDF. */
export const BROCHURE_IGNORE_ATTR = "data-brochure-ignore";

const DEFAULT_ELEMENT_ID = "property-detail-content";
const RENDER_SCALE = 2; // 2x for crisp text
const MAX_CANVAS_PX = 16000; // stay under browser canvas size limits

export interface BrochurePdfOptions {
  /** id of the element to capture. Default: "property-detail-content" */
  elementId?: string;
  /**
   * "single" = one continuous tall page that looks exactly like the screen.
   * "a4"     = multi-page A4 (content may be cut across page boundaries).
   */
  mode?: "single" | "a4";
  /**
   * White space around the content.
   * single mode: pixels (default 64). a4 mode: millimetres (default 15).
   */
  padding?: number;
}

/** Wait until every <img> inside the element has finished loading (or failed). */
async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map((img) => {
      img.loading = "eager";
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
}

export async function generateBrochurePdf(
  fileName: string,
  options: BrochurePdfOptions = {},
): Promise<void> {
  const { elementId = DEFAULT_ELEMENT_ID, mode = "single" } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Brochure element #${elementId} not found`);
  }

  if (document.fonts?.ready) await document.fonts.ready;
  await waitForImages(element);

  const scale = Math.min(RENDER_SCALE, MAX_CANVAS_PX / element.scrollHeight);

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.clientWidth,
    ignoreElements: (el) => el.hasAttribute(BROCHURE_IGNORE_ATTR),
    onclone: (clonedDoc) => {
      // Sticky elements render at the wrong offset in captures; pin them to normal flow
      clonedDoc
        .getElementById(elementId)
        ?.querySelectorAll<HTMLElement>('[class*="sticky"]')
        .forEach((el) => {
          el.style.position = "static";
          el.style.top = "auto";
        });
    },
  });

  // Strip any extension the caller passed so we never end up with ".pdf.pdf"
  const safeName =
    fileName
      .replace(/\.(pdf|html?)$/i, "")
      .replace(/[\\/:*?"<>|]+/g, "")
      .trim() || "brochure";

  if (mode === "single") {
    const pad = options.padding ?? 64; // px of white space on every side
    const contentW = canvas.width / scale;
    const contentH = canvas.height / scale;
    const pageW = contentW + pad * 2;
    const pageH = contentH + pad * 2;

    const pdf = new jsPDF({
      orientation: pageW > pageH ? "landscape" : "portrait",
      unit: "px",
      format: [pageW, pageH],
      hotfixes: ["px_scaling"],
      compress: true,
    });

    // Page is white by default; place the content inside the padding
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.92),
      "JPEG",
      pad,
      pad,
      contentW,
      contentH,
    );
    pdf.save(`${safeName}.pdf`);
    return;
  }

  // ---- A4 multi-page ----
  const margin = options.padding ?? 15; // mm on every side
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageW = pdf.internal.pageSize.getWidth(); // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const contentW = pageW - margin * 2;
  const contentH = pageH - margin * 2;

  // Canvas pixels that fit in one page's content area
  const sliceHeightPx = Math.floor((canvas.width * contentH) / contentW);
  const totalPages = Math.ceil(canvas.height / sliceHeightPx);

  for (let page = 0; page < totalPages; page++) {
    const sy = page * sliceHeightPx;
    const sh = Math.min(sliceHeightPx, canvas.height - sy);

    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sh;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D canvas context");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, sy, canvas.width, sh, 0, 0, canvas.width, sh);

    if (page > 0) pdf.addPage();
    pdf.addImage(
      slice.toDataURL("image/jpeg", 0.92),
      "JPEG",
      margin,
      margin,
      contentW,
      (sh * contentW) / canvas.width,
    );
  }

  pdf.save(`${safeName}.pdf`);
}
