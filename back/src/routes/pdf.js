// routes/pdf.js
import express from 'express';
import { generatePDF } from '../controllers/pdfController.js';

const router = express.Router();

// Generate PDF for a specific invoice
router.get('/invoice/:id', generatePDF);

export default router;