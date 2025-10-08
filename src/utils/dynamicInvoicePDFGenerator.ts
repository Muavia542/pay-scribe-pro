import jsPDF from 'jsp
import { addInvoiceHeader, addInvoiceFooter, InvoiceHeaderData } from './invoicePDFGenerator';
import jsPDF from 'jspdf';
import { addInvoiceHeader, addInvoiceFooter, InvoiceHeaderData } from './invoicePDFGenerator';

interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'calculated';
  value: string | number;
}

interface LineItem {
  id: string;
  fields: { [fieldId: string]: string | number };
}

interface DynamicInvoiceData {
  contractType: string;
  date: Date;
  contractNumber: string;
  ntn: string;
  kpkGst: string;
  month: string;
  year: string;
  service: string;
  dynamicFields: DynamicField[];
  lineItems: LineItem[];
  localManagementRate: number;
  gstRate: number;
}

export const generateDynamicInvoicePDF = (data: DynamicInvoiceData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Add header
  const headerData: InvoiceHeaderData = {
    invoiceNumber: `${data.contractType}-001`,
    date: data.date.toLocaleDateString('en-GB'),
    contractNumber: data.contractNumber,
    ntn: data.ntn,
    kpkGst: data.kpkGst,
    month: `${data.month} ${data.year}`,
    service: data.service
  };

  let yPosition = addInvoiceHeader(pdf, headerData);

  // Contract Type
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Contract Type: ${data.contractType}`, 15, yPosition);
  yPosition += 10;

  // Table Header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');

  const tableHeaders = data.dynamicFields.map(f => f.label);
  const numCols = tableHeaders.length;
  const colWidth = (pageWidth - 30) / numCols;

  let xPos = 15;
  pdf.setFillColor(220, 220, 220); // darker gray header
  pdf.setTextColor(0, 0, 0);

  tableHeaders.forEach(header => {
    pdf.rect(xPos, yPosition, colWidth, 8, 'FD');
    const truncated = header.length > 15 ? header.substring(0, 13) + '...' : header;
    pdf.text(truncated, xPos + 2, yPosition + 5.5);
    xPos += colWidth;
  });

  yPosition += 8;
  pdf.setFont('helvetica', 'normal');

  // Table Rows (Alternating Backgrounds)
  data.lineItems.forEach((item, index) => {
    xPos = 15;
    const isGray = index % 2 === 0;
    const bgColor = isGray ? [245, 245, 245] : [255, 255, 255];

    data.dynamicFields.forEach(field => {
      const value = item.fields[field.id];
      const displayValue = typeof value === 'number' ? value.toLocaleString() : String(value);

      pdf.setFillColor(...bgColor);
      pdf.rect(xPos, yPosition, colWidth, 8, 'F');
      pdf.setTextColor(0, 0, 0);

      const truncated = displayValue.length > 20 ? displayValue.substring(0, 18) + '...' : displayValue;
      pdf.text(truncated, xPos + 2, yPosition + 5.5);
      xPos += colWidth;
    });

    yPosition += 8;
  });

  // Totals Calculation
  const amountField = data.dynamicFields.find(f =>
    f.type === 'calculated' && (f.label.toLowerCase().includes('amount') || f.label.toLowerCase().includes('total'))
  );

  let lineItemsTotal = 0;
  if (amountField) {
    lineItemsTotal = data.lineItems.reduce((sum, item) => {
      const amount = item.fields[amountField.id];
      return sum + (typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0);
    }, 0);
  }

  const totalQty = data.lineItems.length;
  const localMgmtAmount = totalQty * data.localManagementRate;
  const subTotal = lineItemsTotal + localMgmtAmount;
  const gstAmount = (subTotal * data.gstRate) / 100;
  const totalAmount = subTotal + gstAmount;

  // Local Management Fee
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Local Management Fee (${totalQty} × ${data.localManagementRate.toLocaleString()}):`, 15, yPosition);
  pdf.text(`PKR ${localMgmtAmount.toLocaleString()}`, pageWidth - 15, yPosition, { align: 'right' });

  // Sub Total
  yPosition += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sub Total:', 15, yPosition);
  pdf.text(`PKR ${subTotal.toLocaleString()}`, pageWidth - 15, yPosition, { align: 'right' });

  // GST
  yPosition += 6;
  pdf.text(`Add KPK GST @${data.gstRate}%:`, 15, yPosition);
  pdf.text(`PKR ${gstAmount.toLocaleString()}`, pageWidth - 15, yPosition, { align: 'right' });

  // TOTAL AMOUNT Section (No Background)
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('TOTAL AMOUNT (PKR):', 20, yPosition + 7);
  pdf.text(`PKR ${totalAmount.toLocaleString()}`, pageWidth - 20, yPosition + 7, { align: 'right' });

  // Add footer
  addInvoiceFooter(pdf);

  pdf.save(`${data.contractType}-Invoice.pdf`);
};
