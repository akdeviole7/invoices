// models/template.js
// No changes needed.
import { query } from '../config/database.js';
import logger from '../config/logger.js';

export const Template = {
  async create(templateData) {
    if (templateData.is_default) {
      await query('UPDATE invoice_templates SET is_default = FALSE');
    }

    const result = await query(
      `INSERT INTO invoice_templates (name, description, html_template, css_styles, is_default)
       VALUES (?, ?, ?, ?, ?)`,
      [
        templateData.name, templateData.description, templateData.html_template,
        templateData.css_styles, templateData.is_default || false
      ]
    );

    logger.info(`Template created: ${templateData.name}`);
    return result.insertId;
  },

  async findAll() {
    return await query('SELECT * FROM invoice_templates ORDER BY is_default DESC, name');
  },

  async findById(id) {
    const templates = await query('SELECT * FROM invoice_templates WHERE id = ?', [id]);
    return templates.length > 0 ? templates[0] : null;
  },

  async update(id, templateData) {
    if (templateData.is_default) {
      await query('UPDATE invoice_templates SET is_default = FALSE WHERE id != ?', [id]);
    }

    const updates = [];
    const params = [];

    Object.entries(templateData).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      params.push(value);
    });

    params.push(id);

    await query(
      `UPDATE invoice_templates SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Template updated: ${id}`);
  },

  async delete(id) {
    await query('DELETE FROM invoice_templates WHERE id = ?', [id]);
    logger.info(`Template deleted: ${id}`);
  }
};