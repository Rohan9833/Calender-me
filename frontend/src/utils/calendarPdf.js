// src/utils/calendarPdf.js
import jsPDF from "jspdf";
import api from "../api/axios";
import { designAssets } from "./designAssets";

export const downloadCalendarPDF = async (doctorId, doctorName) => {
  try {
    const response = await api.get(`/calendar/${doctorId}?year=2027`);
    if (!response.data.success) {
      throw new Error("Could not fetch calendar data.");
    }

    const { selections, status } = response.data;

    if (!selections || selections.length === 0) {
      throw new Error("No calendar designs found for this doctor.");
    }

    if (status !== "frozen") {
      throw new Error("Calendar is not frozen. Please freeze the calendar first.");
    }

    // A4 landscape: 297 x 210 mm
    const doc = new jsPDF("landscape", "mm", "a4");
    let isFirstPage = true;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    for (const month of monthNames) {
      const sel = selections.find(s => s.month === month);
      if (!sel) continue;

      const design = designAssets[month]?.find(d => d.id === sel.designId);
      if (!design) continue;

      if (!isFirstPage) doc.addPage();
      isFirstPage = false;

      // Fetch the image as a Blob (full quality)
      const imgResponse = await fetch(design.file);
      const blob = await imgResponse.blob();

      // Convert to base64
      const reader = new FileReader();
      const imageData = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      // Get original dimensions
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

      // Calculate dimensions to fit within A4 landscape (with margins)
      const margin = 10;
      const maxWidth = 297 - 2 * margin;
      const maxHeight = 210 - 2 * margin;

      let imgWidth = img.width;
      let imgHeight = img.height;

      // Scale down only if necessary (maintain aspect ratio)
      if (imgWidth > maxWidth) {
        const ratio = maxWidth / imgWidth;
        imgWidth = maxWidth;
        imgHeight = imgHeight * ratio;
      }
      if (imgHeight > maxHeight) {
        const ratio = maxHeight / imgHeight;
        imgHeight = maxHeight;
        imgWidth = imgWidth * ratio;
      }

      // Center the image
      const x = (297 - imgWidth) / 2;
      const y = (210 - imgHeight) / 2;

      // Add image with original quality (no extra compression)
      // Use PNG if original was PNG, else JPEG with quality 1.0
      const isPng = blob.type === "image/png";
      doc.addImage(
        imageData,
        isPng ? "PNG" : "JPEG",
        x,
        y,
        imgWidth,
        imgHeight,
        undefined,
        isPng ? "FAST" : "NONE" // no compression for JPEG
      );
    }

    doc.save(`Calendar_${doctorName.replace(/\s/g, "_")}_2027.pdf`);
    return { success: true };
  } catch (error) {
    console.error("Calendar PDF error:", error);
    throw error;
  }
};