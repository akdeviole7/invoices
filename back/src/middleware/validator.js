// config/validator.js
// Created new file as requested. Uses Joi for validation.
// Exports middleware functions for each entity.
// For updates, allows partial updates by not requiring all fields.
// For invoices, validates the structure including items array.
// Add 'joi' to package.json dependencies if not already installed (npm install joi).
import Joi from 'joi';

const clientSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  email: Joi.string().email().max(255).required(),
  phone: Joi.string().max(50).optional(),
  address: Joi.string().max(255).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  postal_code: Joi.string().max(20).optional(),
});

const clientUpdateSchema = clientSchema.min(1); // Partial update

const invoiceItemSchema = Joi.object({
  description: Joi.string().min(1).max(255).required(),
  detailed_description: Joi.string().max(1000).optional(),
  quantity: Joi.number().positive().required(),
  unit_price: Joi.number().positive().required(),
  amount: Joi.number().positive().required(),
});

const invoiceSchema = Joi.object({
  invoice_number: Joi.string().max(50).optional(),
  client_id: Joi.number().integer().positive().required(),
  template_id: Joi.number().integer().positive().optional(),
  provider_name: Joi.string().max(255).optional(),
  provider_email: Joi.string().email().max(255).optional(),
  provider_phone: Joi.string().max(50).optional(),
  provider_address: Joi.string().max(255).optional(),
  invoice_date: Joi.date().required(),
  due_date: Joi.date().required(),
  subtotal: Joi.number().positive().required(),
  tax_rate: Joi.number().min(0).required(),
  tax_amount: Joi.number().min(0).required(),
  total: Joi.number().positive().required(),
  currency: Joi.string().max(3).default('XAF'),
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue').default('draft'),
  notes: Joi.string().max(1000).optional(),
  payment_method: Joi.string().max(100).optional(),
  payment_details: Joi.string().max(1000).optional(),
});

const templateSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
  html_template: Joi.string().required(),
  css_styles: Joi.string().optional(),
  is_default: Joi.boolean().default(false),
});

const templateUpdateSchema = templateSchema.min(1); // Partial update

export const validateClient = (req, res, next) => {
  const { error } = clientSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};

export const validateClientUpdate = (req, res, next) => {
  const { error } = clientUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};

export const validateInvoice = (req, res, next) => {
  const { invoice, items } = req.body;
  const { error: invoiceError } = invoiceSchema.validate(invoice);
  if (invoiceError) return res.status(400).json({ success: false, error: invoiceError.details[0].message });

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Items must be a non-empty array' });
  }

  for (const item of items) {
    const { error } = invoiceItemSchema.validate(item);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

export const validateInvoiceUpdate = (req, res, next) => {
  const { error } = invoiceSchema.min(1).validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};

export const validateTemplate = (req, res, next) => {
  const { error } = templateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};

export const validateTemplateUpdate = (req, res, next) => {
  const { error } = templateUpdateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, error: error.details[0].message });
  next();
};