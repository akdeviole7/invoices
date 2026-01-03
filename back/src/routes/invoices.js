// routes/invoices.js
// Added validation middleware from validator.js.
import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';
import { validateInvoice, validateInvoiceUpdate } from '../middleware/validator.js';

const router = express.Router();

router.post('/', validateInvoice, createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', validateInvoiceUpdate, updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;