import jsPDF from 'jspdf';
import { addInvoiceHeader, addInvoiceFooter, InvoiceHeaderData } from './invoicePDFGenerator';

interface KPKLineItem {
  description: string;
  rate: number | null;
  attendance: number | null;
  pob: number | null;
  amount: number;
}

interface KPKInvoiceData {
  invoiceNumber: string;
  date: Date;
  contractNumber: string;
  ntn: string;
  kpkGst: string;
  month: string;
  year: string;
  service: string;
  department: string;
  lineItems: KPKLineItem[];
  eobi: { rate: number; pob: number; amount: number };
  subTotal: number;
  totalWithEobi: number;
  gstRate: number;
  gstAmount: number;
  finalTotal: number;
}

export const generateKPKInvoicePDF = (data: KPKInvoiceData) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add header
  const headerData: InvoiceHeaderData = {
    invoiceNumber: data.invoiceNumber,
    date: data.date.toLocaleDateString('en-GB'),
    contractNumber: data.contractNumber,
    ntn: data.ntn,
    kpkGst: data.kpkGst,
    month: `${data.month} ${data.year}`,
    service: data.service
  };
  
  let yPosition = addInvoiceHeader(pdf, headerData);
  
  // Department
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Department: ${data.department}`, 15, yPosition);
  yPosition += 10;
  
  // Table header
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(240, 240, 240);
  
  const tableHeaders = ['Description/Location', 'Rate', 'Attendance', 'POB', 'Amount'];
  const colWidths = [70, 25, 25, 20, 35];
  let xPos = 15;
  
  tableHeaders.forEach((header, i) => {
    pdf.rect(xPos, yPosition, colWidths[i], 8, 'F');
    pdf.rect(xPos, yPosition, colWidths[i], 8);
    pdf.text(header, xPos + 2, yPosition + 5.5);
    xPos += colWidths[i];
  });
  
  yPosition += 8;
  pdf.setFont('helvetica', 'normal');
  
  // Line items
  data.lineItems.forEach(item => {
    xPos = 15;
    pdf.rect(xPos, yPosition, colWidths[0], 8);
    pdf.text(item.description, xPos + 2, yPosition + 5.5);
    xPos += colWidths[0];
    
    pdf.rect(xPos, yPosition, colWidths[1], 8);
    pdf.text(item.rate ? item.rate.toLocaleString() : '-', xPos + 2, yPosition + 5.5);
    xPos += colWidths[1];
    
    pdf.rect(xPos, yPosition, colWidths[2], 8);
    pdf.text(item.attendance ? item.attendance.toLocaleString() : '-', xPos + 2, yPosition + 5.5);
    xPos += colWidths[2];
    
    pdf.rect(xPos, yPosition, colWidths[3], 8);
    pdf.text(item.pob ? item.pob.toLocaleString() : '-', xPos + 2, yPosition + 5.5);
    xPos += colWidths[3];
    
    pdf.rect(xPos, yPosition, colWidths[4], 8);
    pdf.text(item.amount.toLocaleString(), xPos + 2, yPosition + 5.5);
    
    yPosition += 8;
  });
  
  // Sub Total row
  xPos = 15;
  pdf.setFont('helvetica', 'bold');
  pdf.rect(xPos, yPosition, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 8);
  pdf.text('Sub Total', xPos + 2, yPosition + 5.5);
  xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
  
  pdf.rect(xPos, yPosition, colWidths[4], 8);
  pdf.text(data.subTotal.toLocaleString(), xPos + 2, yPosition + 5.5);
  yPosition += 8;
  
  // EOBI row
  pdf.setFont('helvetica', 'normal');
  xPos = 15;
  pdf.rect(xPos, yPosition, colWidths[0], 8);
  pdf.text('EOBI', xPos + 2, yPosition + 5.5);
  xPos += colWidths[0];
  
  pdf.rect(xPos, yPosition, colWidths[1], 8);
  pdf.text(data.eobi.rate.toLocaleString(), xPos + 2, yPosition + 5.5);
  xPos += colWidths[1];
  
  pdf.rect(xPos, yPosition, colWidths[2], 8);
  pdf.text(data.eobi.pob.toString(), xPos + 2, yPosition + 5.5);
  xPos += colWidths[2];
  
  pdf.rect(xPos, yPosition, colWidths[3], 8);
  pdf.text('-', xPos + 2, yPosition + 5.5);
  xPos += colWidths[3];
  
  pdf.rect(xPos, yPosition, colWidths[4], 8);
  pdf.text(data.eobi.amount.toLocaleString(), xPos + 2, yPosition + 5.5);
  yPosition += 8;
  
  // Total Sum row
  pdf.setFont('helvetica', 'bold');
  xPos = 15;
  pdf.rect(xPos, yPosition, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 8);
  pdf.text('Total Sum', xPos + 2, yPosition + 5.5);
  xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
  
  pdf.rect(xPos, yPosition, colWidths[4], 8);
  pdf.text(data.totalWithEobi.toLocaleString(), xPos + 2, yPosition + 5.5);
  yPosition += 8;
  
  // GST row
  xPos = 15;
  pdf.rect(xPos, yPosition, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 8);
  pdf.text(`Add KPK GST @${data.gstRate}%`, xPos + 2, yPosition + 5.5);
  xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
  
  pdf.rect(xPos, yPosition, colWidths[4], 8);
  pdf.text(data.gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), xPos + 2, yPosition + 5.5);
  yPosition += 8;
  
  // Final Total row
  pdf.setFillColor(240, 240, 240);
  xPos = 15;
  pdf.rect(xPos, yPosition, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 10, 'F');
  pdf.rect(xPos, yPosition, colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], 10);
  pdf.setFontSize(12);
  pdf.text('TOTAL AMOUNT (PKR)', xPos + 2, yPosition + 7);
  xPos += colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3];
  
  pdf.rect(xPos, yPosition, colWidths[4], 10, 'F');
  pdf.rect(xPos, yPosition, colWidths[4], 10);
  pdf.text(data.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }), xPos + 2, yPosition + 7);
  
  // Add footer
  addInvoiceFooter(pdf);
  
  pdf.save(`KPK-Invoice-${data.invoiceNumber}.pdf`);
};
