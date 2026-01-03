// controllers/clientController.js
// Refactored to use the Client model for consistency with other controllers.
// Removed duplicate query logic; now delegates to model.
// Removed success logger calls as they are handled in the model.
import { Client } from '../models/Client.js';
import logger from '../config/logger.js';

export const createClient = async (req, res) => {
  try {
    const id = await Client.create(req.body);
    const client = await Client.findById(id);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    logger.error('Error creating client:', error);
    res.status(500).json({ success: false, error: 'Failed to create client' });
  }
};

export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json({ success: true, data: clients });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients' });
  }
};

export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    logger.error('Error fetching client:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client' });
  }
};

export const updateClient = async (req, res) => {
  try {
    await Client.update(req.params.id, req.body);
    const client = await Client.findById(req.params.id);
    res.json({ success: true, data: client });
  } catch (error) {
    logger.error('Error updating client:', error);
    res.status(500).json({ success: false, error: 'Failed to update client' });
  }
};

export const deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    logger.error('Error deleting client:', error);
    res.status(500).json({ success: false, error: 'Failed to delete client' });
  }
};