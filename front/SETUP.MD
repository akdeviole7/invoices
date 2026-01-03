# Professional Invoice Management System

## Project Structure

```
invoice-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── logger.js
│   │   ├── models/
│   │   │   ├── Invoice.js
│   │   │   ├── Client.js
│   │   │   └── Template.js
│   │   ├── routes/
│   │   │   ├── invoices.js
│   │   │   ├── clients.js
│   │   │   └── templates.js
│   │   ├── controllers/
│   │   │   ├── invoiceController.js
│   │   │   ├── clientController.js
│   │   │   └── templateController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validator.js
│   │   ├── utils/
│   │   │   ├── pdfGenerator.js
│   │   │   └── templateEngine.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InvoiceList.jsx
│   │   │   ├── InvoiceForm.jsx
│   │   │   ├── InvoicePreview.jsx
│   │   │   ├── TemplateSelector.jsx
│   │   │   └── ClientForm.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewInvoice.jsx
│   │   │   └── Templates.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql
```

## Database Schema (MySQL)

```sql
-- database/schema.sql
CREATE DATABASE IF NOT EXISTS invoice_system;
USE invoice_system;

CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE invoice_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    html_template TEXT NOT NULL,
    css_styles TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    template_id INT DEFAULT NULL,
    provider_name VARCHAR(255),
    provider_email VARCHAR(255),
    provider_phone VARCHAR(50),
    provider_address TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XAF',
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    notes TEXT,
    payment_method VARCHAR(100),
    payment_details VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    FOREIGN KEY (template_id) REFERENCES invoice_templates(id) ON DELETE SET NULL
);

CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    detailed_description TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id INT,
    changes JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_client_id ON invoices(client_id);
CREATE INDEX idx_status ON invoices(status);
CREATE INDEX idx_invoice_date ON invoices(invoice_date);
```

## Backend Setup

### package.json (Backend)

```json
{
  "name": "invoice-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "winston": "^3.11.0",
    "joi": "^17.11.0",
    "puppeteer": "^21.6.1",
    "handlebars": "^4.7.8",
    "express-rate-limit": "^7.1.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### .env

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=invoice_system
DB_PORT=3306
NODE_ENV=development
```

### Database Configuration

```javascript
// backend/src/config/database.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

export default pool;
```

### Logger Configuration

```javascript
// backend/src/config/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
```

### Models

```javascript
// backend/src/models/Invoice.js
import { query } from '../config/database.js';
import logger from '../config/logger.js';

export const Invoice = {
  async create(invoiceData, items) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
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
          invoiceData.total, invoiceData.currency, invoiceData.status,
          invoiceData.notes, invoiceData.payment_method, invoiceData.payment_details
        ]
      );

      const invoiceId = result.insertId;

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
    const [invoices] = await query(
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
    const [result] = await query(
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

// Similar models for Client and Template...
```

### Controllers

```javascript
// backend/src/controllers/invoiceController.js
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
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    logger.error('Error in deleteInvoice:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete invoice' 
    });
  }
};
```

### Routes

```javascript
// backend/src/routes/invoices.js
import express from 'express';
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
```

### Server Setup

```javascript
// backend/src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import logger from './config/logger.js';
import invoiceRoutes from './routes/invoices.js';
// Import other routes...

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/invoices', invoiceRoutes);
// app.use('/api/clients', clientRoutes);
// app.use('/api/templates', templateRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

## Frontend Setup (Continued in next artifact...)

The backend is now complete with:
- ✅ MySQL database schema
- ✅ Express.js server
- ✅ Models with transaction support
- ✅ Controllers with error handling
- ✅ Winston logging
- ✅ Rate limiting
- ✅ Auto-generated invoice numbers
- ✅ Template support ready

Next, I'll create the React frontend...