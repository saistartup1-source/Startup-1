import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 50mb limit for PDF base64 payloads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads", "bills");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve stored PDF files statically
  app.use("/uploads/bills", express.static(uploadsDir));

  // Upload/Save PDF & Invoice Data to Storage
  app.post("/api/bills/upload", (req, res) => {
    try {
      const { invoiceNumber, pdfBase64, invoiceData } = req.body;
      if (!invoiceNumber) {
        return res.status(400).json({ error: "Missing invoiceNumber" });
      }

      const cleanNum = String(invoiceNumber).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const filename = `invoice_${cleanNum}.pdf`;
      const filePath = path.join(uploadsDir, filename);

      if (pdfBase64) {
        const base64Data = String(pdfBase64).replace(/^data:application\/pdf;base64,/, "");
        fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      }

      const jsonPath = path.join(uploadsDir, `invoice_${cleanNum}.json`);
      if (invoiceData) {
        fs.writeFileSync(jsonPath, JSON.stringify(invoiceData, null, 2));
      }

      let hostOrigin = req.protocol + "://" + req.get("host");
      if (hostOrigin.includes("ais-dev-")) {
        hostOrigin = hostOrigin.replace("ais-dev-", "ais-pre-");
      }

      const pdfUrl = `${hostOrigin}/uploads/bills/${filename}`;
      const billWebUrl = `${hostOrigin}/bills/${cleanNum}`;

      return res.json({
        success: true,
        filename,
        pdfUrl,
        billWebUrl,
      });
    } catch (err: any) {
      console.error("Error saving bill PDF to storage:", err);
      return res.status(500).json({ error: err?.message || "Failed to save bill PDF" });
    }
  });

  // Get Invoice Data by Invoice Number
  app.get("/api/bills/:id", (req, res) => {
    try {
      const cleanNum = req.params.id.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      const jsonPath = path.join(uploadsDir, `invoice_${cleanNum}.json`);
      if (fs.existsSync(jsonPath)) {
        const data = fs.readFileSync(jsonPath, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.status(404).json({ error: "Invoice not found" });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || "Error reading invoice" });
    }
  });

  // Serve Direct PDF or Bill Route
  app.get("/bills/:id", (req, res, next) => {
    const param = req.params.id.trim();
    const cleanNum = param.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const pdfPath = path.join(uploadsDir, `invoice_${cleanNum}.pdf`);

    // If client requested PDF file directly (e.g., /bills/SCR-1019.pdf) or pdf file exists
    if (param.endsWith(".pdf") && fs.existsSync(pdfPath)) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="invoice_${cleanNum}.pdf"`);
      return res.sendFile(pdfPath);
    }

    // Otherwise pass to Vite SPA router
    next();
  });

  // Vite middleware for development vs Production dist serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
