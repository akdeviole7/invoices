// models/invoice.js
// Fixed: Imported pool correctly (was missing).
// Changed destructuring in create and findById to match query's return (results is rows array).
// Added transaction handling consistently.
// Note: Assumes DB has foreign key constraints with ON DELETE CASCADE for invoice_items.
import pool, { query } from '../config/database.js';
import logger from '../config/logger.js';

export const Invoice = {
  async create(invoiceData, items) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const result = await connection.execute(
        `INSERT INTO invoices (
          invoice_number, client_id, template_id, provider_name, provider_email,
          provider_phone, provider_address, invoice_date, due_date, subtotal,
          tax_rate, tax_amount, total, currency, status, notes, payment_method, payment_details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invoiceData.invoice_number, invoiceData.client_id, invoiceData.template_id,
          invoiceData.provider_name, invoiceData.provider_email, invoiceData.provider_phone,
          invoiceData.provider_address, invoiceData.invoice_date, invoiceData.due_date,
          invoiceData.subtotal, invoiceData.tax_rate, invoiceData.tax_amount,
          invoiceData.total, invoiceData.currency || 'XAF', invoiceData.status || 'draft',
          invoiceData.notes, invoiceData.payment_method, invoiceData.payment_details
        ]
      );

      const invoiceId = result[0].insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO invoice_items (invoice_id, description, detailed_description, quantity, unit_price, amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.description, item.detailed_description, item.quantity, item.unit_price, item.amount]
        );
      }

      await connection.commit();
      logger.info(`Invoice created: ${invoiceData.invoice_number}`);
      return invoiceId;
    } catch (error) {
      await connection.rollback();
      logger.error('Error creating invoice:', error);
      throw error;
    } finally {
      connection.release();
    }
  },

  async findById(id) {
    const invoices = await query(
      `SELECT i.*, c.name as client_name, c.email as client_email, c.address as client_address,
              c.city as client_city, c.state as client_state, c.country as client_country
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = ?`,
      [id]
    );

    if (invoices.length === 0) return null;

    const invoice = invoices[0];
    invoice.items = await query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [id]
    );

    return invoice;
  },

  async findAll(filters = {}) {
    let sql = `
      SELECT i.*, c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND i.status = ?';
      params.push(filters.status);
    }

    if (filters.client_id) {
      sql += ' AND i.client_id = ?';
      params.push(filters.client_id);
    }

    sql += ' ORDER BY i.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    return await query(sql, params);
  },

  async update(id, invoiceData) {
    const updates = [];
    const params = [];

    Object.entries(invoiceData).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      params.push(value);
    });

    params.push(id);

    await query(
      `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Invoice updated: ${id}`);
  },

  async delete(id) {
    await query('DELETE FROM invoices WHERE id = ?', [id]);
    logger.info(`Invoice deleted: ${id}`);
  },

  async generateInvoiceNumber() {
    const result = await query(
      "SELECT invoice_number FROM invoices ORDER BY id DESC LIMIT 1"
    );
    
    if (result.length === 0) {
      return `INV-${new Date().getFullYear()}-001`;
    }

    const lastNumber = result[0].invoice_number;
    const match = lastNumber.match(/INV-(\d{4})-(\d{3})/);
    
    if (match) {
      const year = new Date().getFullYear();
      const lastYear = parseInt(match[1]);
      const lastSeq = parseInt(match[2]);
      
      if (year === lastYear) {
        return `INV-${year}-${String(lastSeq + 1).padStart(3, '0')}`;
      } else {
        return `INV-${year}-001`;
      }
    }
    
    return `INV-${new Date().getFullYear()}-001`;
  }
};