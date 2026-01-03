// routes/templates.js
// Added validation middleware from validator.js.
// Added routes for update and delete for completeness.
import express from 'express';
import { createTemplate, getAllTemplates, getTemplateById, updateTemplate, deleteTemplate } from '../controllers/templateController.js';
import { validateTemplate, validateTemplateUpdate } from '../middleware/validator.js';

const router = express.Router();

router.post('/', validateTemplate, createTemplate);
router.get('/', getAllTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', validateTemplateUpdate, updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;