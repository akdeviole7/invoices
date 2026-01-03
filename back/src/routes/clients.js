// routes/clients.js
// Added validation middleware from validator.js.
import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController.js';
import { validateClient, validateClientUpdate } from '../middleware/validator.js';

const router = express.Router();

router.post('/', validateClient, createClient);
router.get('/', getAllClients);
router.get('/:id', getClientById);
router.put('/:id', validateClientUpdate, updateClient);
router.delete('/:id', deleteClient);

export default router;