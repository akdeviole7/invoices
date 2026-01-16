// utils/pdfGenerator.js
import PDFDocument from 'pdfkit';

/**
 * Configuration object for customizing the PDF appearance
 */
const DEFAULT_CONFIG = {
  colors: {
    primary: '#4F46E5',
    text: '#1F2937',
    textLight: '#4B5563',
    textLighter: '#6B7280',
    background: '#F3F4F6',
    backgroundAlt: '#F9FAFB',
    border: '#E5E7EB',
    darkBg: '#111827',
    white: '#FFFFFF',
    accent: '#E0E7FF',
    error: '#DC2626'
  },
  fonts: {
    bold: 'Helvetica-Bold',
    regular: 'Helvetica'
  },
  sizes: {
    header: 32,
    subheader: 14,
    title: 14,
    subtitle: 12,
    body: 9,
    small: 8,
    tiny: 7.5,
    label: 7
  },
  spacing: {
    section: 25,
    subsection: 15,
    line: 12,
    smallLine: 8,
    paragraph: 4,
    padding: 20
  },
  layout: {
    pageWidth: 595,
    pageHeight: 842,
    margin: 50,
    headerHeight: 100,
    columnGap: 20,
    tableColumnWidths: {
      description: 290,
      quantity: 40,
      unitPrice: 60,
      amount: 85
    }
  }
};

/**
 * Helper class for managing Y position and page breaks
 */
class LayoutManager {
  constructor(doc, config) {
    this.doc = doc;
    this.config = config;
    this.currentY = config.layout.headerHeight + config.spacing.section;
    this.pageHeight = config.layout.pageHeight;
    this.margin = config.layout.margin;
    this.bottomMargin = 0;
  }

  getCurrentY() {
    return this.currentY;
  }

  moveY(amount) {
    this.currentY += amount;
  }

  setY(y) {
    this.currentY = y;
  }

  checkPageBreak(requiredSpace) {
    if (this.currentY + requiredSpace > this.pageHeight - this.bottomMargin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  reserveFooterSpace(footerHeight) {
    this.bottomMargin = this.margin + footerHeight + 20;
  }

  getAvailableHeight() {
    return this.pageHeight - this.bottomMargin - this.currentY;
  }
}

/**
 * Helper functions
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatNumber = (amount) => {
  const num = parseFloat(amount || 0);
  return num.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const formatCurrency = (amount, currency = 'XAF') => {
  const formatted = formatNumber(amount);
  if (currency === 'XAF' || currency === 'FCFA') {
    return `${formatted} FCFA`;
  }
  return `${currency} ${formatted}`;
};

/**
 * Draw the header section
 */
const drawHeader = (doc, invoice, config) => {
  const { colors, fonts, sizes, layout } = config;
  
  doc.rect(0, 0, layout.pageWidth, layout.headerHeight)
    .fillColor(colors.primary)
    .fill();

  doc.fontSize(sizes.header)
    .fillColor(colors.white)
    .font(fonts.bold)
    .text('INVOICE', layout.margin, 40);

  doc.fontSize(sizes.subheader)
    .fillColor(colors.accent)
    .font(fonts.regular)
    .text(invoice.header_subtitle || 'Professional Services', layout.margin, 75);
};

/**
 * Draw provider and client information side by side
 */
const drawParticipants = (doc, invoice, layout, config) => {
  const { colors, fonts, sizes, spacing } = config;
  const leftX = config.layout.margin;
  const rightX = config.layout.pageWidth / 2 + spacing.subsection;
  const columnWidth = (config.layout.pageWidth - config.layout.margin * 2 - spacing.subsection) / 2;
  
  let leftY = layout.getCurrentY();
  let rightY = leftY;

  // Provider (left)
  doc.fontSize(sizes.label)
    .fillColor(colors.primary)
    .font(fonts.bold)
    .text('FROM (PROVIDER)', leftX, leftY);
  leftY += spacing.subsection;

  doc.fontSize(sizes.body + 1)
    .fillColor(colors.text)
    .font(fonts.bold)
    .text(invoice.provider_name || 'Your Name', leftX, leftY, { width: columnWidth });
  leftY += spacing.line + spacing.smallLine;

  doc.fontSize(sizes.body)
    .fillColor(colors.textLight)
    .font(fonts.regular);

  const providerFields = [
    invoice.provider_address,
    invoice.provider_email,
    invoice.provider_phone
  ];

  providerFields.forEach(field => {
    if (field) {
      const lines = field.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const height = doc.heightOfString(line, { width: columnWidth });
          doc.text(line.trim(), leftX, leftY, { width: columnWidth });
          leftY += height + spacing.paragraph;
        }
      });
    }
  });

  // Client (right)
  doc.fontSize(sizes.label)
    .fillColor(colors.primary)
    .font(fonts.bold)
    .text('BILL TO (CLIENT)', rightX, rightY);
  rightY += spacing.subsection;

  doc.fontSize(sizes.body + 1)
    .fillColor(colors.text)
    .font(fonts.bold)
    .text(invoice.client_name || 'Client Name', rightX, rightY, { width: columnWidth });
  rightY += spacing.line + spacing.smallLine;

  doc.fontSize(sizes.body)
    .fillColor(colors.textLight)
    .font(fonts.regular);

  const clientFields = [
    invoice.client_address,
    [invoice.client_city, invoice.client_state].filter(Boolean).join(', '),
    invoice.client_country,
    invoice.client_email
  ];

  clientFields.forEach(field => {
    if (field) {
      const lines = field.split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          const height = doc.heightOfString(line, { width: columnWidth });
          doc.text(line.trim(), rightX, rightY, { width: columnWidth });
          rightY += height + spacing.paragraph;
        }
      });
    }
  });

  layout.setY(Math.max(leftY, rightY));
};

/**
 * Draw invoice details box
 */
const drawInvoiceDetails = (doc, invoice, layout, config) => {
  const { colors, fonts, sizes, spacing } = config;
  const boxHeight = 35;
  const startY = layout.getCurrentY() + spacing.subsection;
  
  layout.checkPageBreak(boxHeight + spacing.section);
  
  const boxWidth = config.layout.pageWidth - config.layout.margin * 2;
  const colWidth = boxWidth / 3;

  doc.rect(config.layout.margin, startY, boxWidth, boxHeight)
    .fillColor(colors.background)
    .fill();

  const details = [
    { label: 'INVOICE NUMBER', value: invoice.invoice_number || 'AUTO-GENERATED' },
    { label: 'INVOICE DATE', value: formatDate(invoice.issue_date || invoice.invoice_date) },
    { label: 'DUE DATE', value: formatDate(invoice.due_date) }
  ];

  details.forEach((detail, i) => {
    const x = config.layout.margin + (colWidth * i);
    
    doc.fontSize(sizes.label)
      .fillColor(colors.textLighter)
      .font(fonts.bold)
      .text(detail.label, x, startY + 8, { width: colWidth, align: 'center' });

    doc.fontSize(sizes.body)
      .fillColor(colors.text)
      .font(fonts.bold)
      .text(detail.value, x, startY + 20, { width: colWidth, align: 'center' });
  });

  layout.setY(startY + boxHeight);
};

/**
 * Draw services table with dynamic row heights
 */
const drawServicesTable = (doc, invoice, layout, config) => {
  const { colors, fonts, sizes, spacing } = config;
  const colWidths = config.layout.tableColumnWidths;
  const tableX = config.layout.margin;
  const tableWidth = config.layout.pageWidth - config.layout.margin * 2;
  
  layout.moveY(spacing.section);
  layout.checkPageBreak(100);

  // Section title
  doc.fontSize(sizes.title)
    .fillColor(colors.text)
    .font(fonts.bold)
    .text('Services Provided', tableX, layout.getCurrentY());
  
  layout.moveY(spacing.section);

  // Table header
  const headerHeight = 20;
  doc.rect(tableX, layout.getCurrentY(), tableWidth, headerHeight)
    .fillColor(colors.backgroundAlt)
    .fill();

  doc.fontSize(sizes.small)
    .fillColor(colors.textLight)
    .font(fonts.bold);

  const headers = [
    { text: 'DESCRIPTION', x: tableX + 5, width: colWidths.description },
    { text: 'QTY', x: tableX + colWidths.description + 5, width: colWidths.quantity, align: 'center' },
    { text: 'UNIT PRICE', x: tableX + colWidths.description + colWidths.quantity + 5, width: colWidths.unitPrice, align: 'right' },
    { text: 'AMOUNT', x: tableX + colWidths.description + colWidths.quantity + colWidths.unitPrice + 5, width: colWidths.amount, align: 'right' }
  ];

  headers.forEach(header => {
    doc.text(header.text, header.x, layout.getCurrentY() + 6, {
      width: header.width,
      align: header.align || 'left'
    });
  });

  layout.moveY(headerHeight);

  // Table rows
  const items = invoice.items || [];
  items.forEach((item, index) => {
    const description = item.description || 'Service Description';
    const detailedDesc = item.detailed_description || '';

    // Calculate row height
    doc.font(fonts.bold).fontSize(sizes.body);
    const descHeight = doc.heightOfString(description, { width: colWidths.description - 10, lineGap: 2 });
    
    let detailHeight = 0;
    if (detailedDesc) {
      doc.font(fonts.regular).fontSize(sizes.tiny);
      detailHeight = doc.heightOfString(detailedDesc, { width: colWidths.description - 10, lineGap: 2 }) + spacing.paragraph;
    }

    const rowHeight = Math.max(descHeight + detailHeight + 16, 30);

    // Check page break
    layout.checkPageBreak(rowHeight);

    // Alternating row background
    const rowY = layout.getCurrentY();
    doc.rect(tableX, rowY, tableWidth, rowHeight)
      .fillColor(index % 2 === 0 ? colors.white : colors.backgroundAlt)
      .fill();

    let contentY = rowY + 8;

    // Description
    doc.fillColor(colors.text)
      .font(fonts.bold)
      .fontSize(sizes.body)
      .text(description, tableX + 5, contentY, { width: colWidths.description - 10, lineGap: 2 });
    
    contentY += descHeight + spacing.paragraph;

    // Detailed description
    if (detailedDesc) {
      doc.font(fonts.regular)
        .fontSize(sizes.tiny)
        .fillColor(colors.textLighter)
        .text(detailedDesc, tableX + 5, contentY, { width: colWidths.description - 10, lineGap: 2 });
    }

    // Quantity
    const qtyX = tableX + colWidths.description + 5;
    doc.font(fonts.regular)
      .fontSize(sizes.body)
      .fillColor(colors.text)
      .text(item.quantity?.toString() || '1', qtyX, rowY + 8, {
        width: colWidths.quantity,
        align: 'center'
      });

    // Unit Price
    const priceX = qtyX + colWidths.quantity;
    doc.text(formatNumber(item.unit_price || 0), priceX, rowY + 8, {
      width: colWidths.unitPrice,
      align: 'right'
    });

    // Amount
    const amount = (item.quantity || 1) * (item.unit_price || 0);
    const amountX = priceX + colWidths.unitPrice;
    doc.font(fonts.bold)
      .text(formatNumber(amount), amountX, rowY + 8, {
        width: colWidths.amount,
        align: 'right'
      });

    layout.moveY(rowHeight);
  });

  return items.length;
};

/**
 * Draw totals section
 */
const drawTotals = (doc, invoice, layout, config, itemCount) => {
  const { colors, fonts, sizes } = config;
  const colWidths = config.layout.tableColumnWidths;
  const tableX = config.layout.margin;
  const tableWidth = config.layout.pageWidth - config.layout.margin * 2;
  
  const labelX = tableX + 5;
  const labelWidth = colWidths.description + colWidths.quantity;
  const valueX = labelX + labelWidth;
  const valueWidth = colWidths.amount + colWidths.unitPrice;
  const rowHeight = 20;

  const totals = [
    { label: 'Subtotal:', value: formatNumber(invoice.subtotal), color: colors.text },
    { label: `Tax (${invoice.tax_rate || 0}%):`, value: formatNumber(invoice.tax_amount), color: colors.text }
  ];

  if (invoice.discount_amount && parseFloat(invoice.discount_amount) > 0) {
    totals.push({
      label: 'Discount:',
      value: '-' + formatNumber(invoice.discount_amount),
      color: colors.error
    });
  }

  totals.forEach((total, index) => {
    const rowY = layout.getCurrentY();
    const fillColor = ((itemCount + index) % 2 === 0) ? colors.white : colors.backgroundAlt;
    
    doc.rect(tableX, rowY, tableWidth, rowHeight)
      .fillColor(fillColor)
      .fill();

    doc.fontSize(sizes.body)
      .font(fonts.regular)
      .fillColor(colors.textLight)
      .text(total.label, labelX, rowY + 4, { width: labelWidth, align: 'left' });

    doc.font(fonts.bold)
      .fillColor(total.color)
      .text(total.value, valueX, rowY + 4, { width: valueWidth, align: 'right' });

    layout.moveY(rowHeight);
  });

  // Divider
  const dividerY = layout.getCurrentY() + 5;
  doc.moveTo(tableX, dividerY)
    .lineTo(tableX + tableWidth, dividerY)
    .lineWidth(2)
    .strokeColor(colors.primary)
    .stroke();

  layout.moveY(15);

  // Total row
  const totalHeight = 25;
  const totalY = layout.getCurrentY();
  const fillColor = ((itemCount + totals.length) % 2 === 0) ? colors.white : colors.backgroundAlt;
  
  doc.rect(tableX, totalY, tableWidth, totalHeight)
    .fillColor(fillColor)
    .fill();

  doc.fontSize(sizes.title)
    .font(fonts.bold)
    .fillColor(colors.primary)
    .text('TOTAL DUE:', labelX, totalY + 5, { width: labelWidth, align: 'left' });

  doc.fillColor(colors.text)
    .text(formatCurrency(invoice.total_amount || invoice.total, invoice.currency),
      valueX, totalY + 5, { width: valueWidth, align: 'right' });

  layout.moveY(totalHeight);
};

/**
 * Draw footer with payment info and notes
 */

const drawFooter = (doc, invoice, config) => {
  const { colors, fonts, sizes, layout } = config;

  const footerHeight = 90;
  const footerY = doc.page.height - footerHeight;

  // Background full-width, no margins
  doc.rect(
    0,
    footerY,
    layout.pageWidth,
    footerHeight
  )
  .fillColor(colors.darkBg)
  .fill();

  let y = footerY + 15;

  doc.font(fonts.bold)
    .fontSize(sizes.subtitle)
    .fillColor(colors.white)
    .text(
      'Payment Information',
      0,
      y,
      { width: layout.pageWidth, align: 'center' }
    );

  y += 16;

  doc.font(fonts.regular)
    .fontSize(8)
    .fillColor(colors.white)
    .text(
      'Thank you for your business!',
      0,
      y,
      { width: layout.pageWidth, align: 'center' }
    );
};


/**
 * Main PDF generation function
 */
export const generateInvoicePDF = async (invoice, customConfig = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Merge custom config with defaults
      const config = {
        ...DEFAULT_CONFIG,
        ...customConfig,
        colors: { ...DEFAULT_CONFIG.colors, ...customConfig.colors },
        fonts: { ...DEFAULT_CONFIG.fonts, ...customConfig.fonts },
        sizes: { ...DEFAULT_CONFIG.sizes, ...customConfig.sizes },
        spacing: { ...DEFAULT_CONFIG.spacing, ...customConfig.spacing },
        layout: { ...DEFAULT_CONFIG.layout, ...customConfig.layout }
      };

      const doc = new PDFDocument({
        size: 'A4',
        margin: config.layout.margin,
        bufferPages: true
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Initialize layout manager
      const layout = new LayoutManager(doc, config);

      // Draw sections
      drawHeader(doc, invoice, config);
      drawParticipants(doc, invoice, layout, config);
      drawInvoiceDetails(doc, invoice, layout, config);
      const itemCount = drawServicesTable(doc, invoice, layout, config);
      drawTotals(doc, invoice, layout, config, itemCount);
      drawFooter(doc, invoice, config);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};