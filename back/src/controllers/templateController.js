// controllers/templateController.js
// Refactored to use the Template model for consistency.
// Added missing updateTemplate and deleteTemplate functions for completeness (assuming needed based on model).
// If not needed, they can be removed.
import { Template } from '../models/Template.js';
import logger from '../config/logger.js';

export const createTemplate = async (req, res) => {
  try {
    const id = await Template.create(req.body);
    const template = await Template.findById(id);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    logger.error('Error creating template:', error);
    res.status(500).json({ success: false, error: 'Failed to create template' });
  }
};

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.findAll();
    res.json({ success: true, data: templates });
  } catch (error) {
    logger.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch templates' });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error fetching template:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch template' });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    await Template.update(req.params.id, req.body);
    const template = await Template.findById(req.params.id);
    res.json({ success: true, data: template });
  } catch (error) {
    logger.error('Error updating template:', error);
    res.status(500).json({ success: false, error: 'Failed to update template' });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    await Template.delete(req.params.id);
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    logger.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: 'Failed to delete template' });
  }
};