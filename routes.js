const express = require("express");
const router = express.Router();

// Import route modules
const sessionRoutes = require("./controllers/sessionController");
const documentRoutes = require("./controllers/documentController");
const demandaRoutes = require("./controllers/demandaController");

// Import middlewares
const auth = require("./middlewares/auth");

// Public routes (no authentication required)
router.use("/sessions", sessionRoutes);

// Protected routes (authentication required)
router.use("/documents", auth, documentRoutes);
router.use("/demandas", auth, demandaRoutes);

// API Info route
router.get("/", (req, res) => {
  res.json({
    name: "CRM LRM Backend API",
    version: "1.0.0",
    description: "Backend API for CRM LRM system",
    endpoints: {
      sessions: "/api/sessions",
      documents: "/api/documents (protected)",
      demandas: "/api/demandas (protected)",
    },
  });
});

module.exports = router;
