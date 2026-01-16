// controllers/pdfController.js
import { Invoice } from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';
import logger from '../config/logger.js';

export const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch invoice with items
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invoice not found' 
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    // Send PDF
    res.send(pdfBuffer);
    
    logger.info(`PDF generated for invoice: ${invoice.invoice_number}`);
  } catch (error) {
    logger.error('Error generating PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate PDF' 
    });
  }
};