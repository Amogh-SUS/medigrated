// server/controllers/reports/report-controller.js

const path = require("path");
const fs = require("fs");
const Report = require("../../models/Report");

/*
  MOCK REPORT PARSER FOR NOW 
  - If PDF/image contains keywords like 'hemoglobin' etc.
  - Later replaced by:
      - Tesseract OCR
      - OpenAI Vision
      - Cloud API medical parsers
      - Your ML model
*/
function mockParseReport(file) {
  const filename = file.originalname.toLowerCase();

  if (filename.includes("cbc") || filename.includes("blood")) {
    return {
      summary: "Detected blood report.",
      values: {
        hemoglobin: "13.2 g/dL",
        wbc: "6,700 /µL",
        platelets: "220,000 /µL"
      },
      flags: ["Hemoglobin slightly low"],
    };
  }

  if (filename.includes("xray")) {
    return {
      summary: "Detected X-ray image.",
      findings: "Lungs appear normal. No obvious issues.",
      confidence: "Mock 82%"
    };
  }

  return {
    summary: "Unrecognized report type. Basic storage only.",
  };
}

/*
  POST /api/reports/upload  
  Protected (authMiddleware)
*/
const uploadReport = async (req, res) => {
  try {
    // multer places file in req.file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // user info from JWT
    const userId = req.user.id;

    const file = req.file;

    // parse mock
    const parsed = mockParseReport(file);

    const report = await Report.create({
      user: userId,
      filename: file.originalname,
      storedFilename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path,
      reportType: parsed?.summary?.toLowerCase().includes("blood")
        ? "blood"
        : parsed?.summary?.toLowerCase().includes("x-ray")
        ? "xray"
        : "other",
      parsedData: parsed,
    });

    return res.json({
      success: true,
      message: "Report uploaded and parsed successfully",
      report,
    });

  } catch (err) {
    console.error("uploadReport error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading report",
    });
  }
};

/*
  GET /api/reports/my
  Returns all reports uploaded by logged-in user
*/
const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const reports = await Report.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      reports,
    });

  } catch (err) {
    console.error("getMyReports error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching reports",
    });
  }
};

module.exports = { uploadReport, getMyReports };
