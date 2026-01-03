// models/clients.js
// No changes needed (already uses query correctly).
// Note: File name is "clients.js" but model is singular "Client" - consider renaming to client.js for convention, but kept as is.
import { query } from '../config/database.js';
import logger from '../config/logger.js';

export const Client = {
  async create(clientData) {
    const result = await query(
      `INSERT INTO clients (name, email, phone, address, city, state, country, postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientData.name, clientData.email, clientData.phone, clientData.address,
        clientData.city, clientData.state, clientData.country, clientData.postal_code
      ]
    );

    logger.info(`Client created: ${clientData.name}`);
    return result.insertId;
  },

  async findAll() {
    return await query('SELECT * FROM clients ORDER BY name');
  },

  async findById(id) {
    const clients = await query('SELECT * FROM clients WHERE id = ?', [id]);
    return clients.length > 0 ? clients[0] : null;
  },

  async update(id, clientData) {
    const updates = [];
    const params = [];

    Object.entries(clientData).forEach(([key, value]) => {
      updates.push(`${key} = ?`);
      params.push(value);
    });

    params.push(id);

    await query(
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Client updated: ${id}`);
  },

  async delete(id) {
    await query('DELETE FROM clients WHERE id = ?', [id]);
    logger.info(`Client deleted: ${id}`);
  }
};