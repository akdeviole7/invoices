// controllers/invoiceController.js
// Minor fix: Added logger.info for consistency on success (optional, but aligns with other controllers/models).
// Ensured Invoice model is used correctly.
import { Invoice } from '../models/Invoice.js';
import logger from '../config/logger.js';

export const createInvoice = async (req, res) => {
  try {
    const { invoice, items } = req.body;
    
    if (!invoice.invoice_number) {
      invoice.invoice_number = await Invoice.generateInvoiceNumber();
    }

    const invoiceId = await Invoice.create(invoice, items);
    const createdInvoice = await Invoice.findById(invoiceId);
    
    logger.info(`Invoice created: ${invoice.invoice_number}`);
    res.status(201).json({ 
      success: true, 
      data: createdInvoice 
    });
  } catch (error) {
    logger.error('Error in createInvoice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create invoice' 
    });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      client_id: req.query.client_id,
      limit: req.query.limit
    };

    const invoices = await Invoice.findAll(filters);
    res.json({ success: true, data: invoices });
  } catch (error) {
    logger.error('Error in getAllInvoices:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch invoices' 
    });
  }
};

export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invoice not found' 
      });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    logger.error('Error in getInvoiceById:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch invoice' 
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    await Invoice.update(req.params.id, req.body);
    const updatedInvoice = await Invoice.findById(req.params.id);
    
    logger.info(`Invoice updated: ${req.params.id}`);
    res.json({ success: true, data: updatedInvoice });
  } catch (error) {
    logger.error('Error in updateInvoice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update invoice' 
    });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    await Invoice.delete(req.params.id);
    logger.info(`Invoice deleted: ${req.params.id}`);
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteInvoice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete invoice' 
    });
  }
};