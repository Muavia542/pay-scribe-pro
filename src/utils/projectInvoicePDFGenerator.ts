import jsPDF from 'jspdf';
import { addInvoiceHeader, addInvoiceFooter, InvoiceHeaderData } from './invoicePDFGenerator';

interface ProjectLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ProjectInvoiceData {
  invoiceNumber: string;
  date: Date;
  contractNumber: string;
  ntn: string;
  kpkGst: string;
  month: string;
  year: string;
  service: string;
  projectTitle: string;
  round: string;
  lineItems: ProjectLineItem[];
  localManagement: { quantity: number; rate: number; amount: number };
  gstRate: number;
}

export const generateProjectInvoicePDF = (data: ProjectInvoiceData) => {
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
  
  // Project Title and Round
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Project: ${data.projectTitle} (${data.round})`, 15, yPosition);
  yPosition += 10;
  
  // Line items table
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setFillColor(240, 240, 240);
  
  const tableHeaders = ['Description', 'Qty', 'Rate (PKR)', 'Amount (PKR)'];
  const colWidths = [100, 20, 30, 35];
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
    const descLines = pdf.splitTextToSize(item.description, 95);
    const cellHeight = Math.max(descLines.length * 5, 8);
    
    xPos = 15;
    pdf.rect(xPos, yPosition, colWidths[0], cellHeight);
    pdf.text(descLines, xPos + 2, yPosition + 5);
    xPos += colWidths[0];
    
    pdf.rect(xPos, yPosition, colWidths[1], cellHeight);
    pdf.text(item.quantity.toString(), xPos + 2, yPosition + 5);
    xPos += colWidths[1];
    
    pdf.rect(xPos, yPosition, colWidths[2], cellHeight);
    pdf.text(item.rate.toLocaleString(), xPos + 2, yPosition + 5);
    xPos += colWidths[2];
    
    pdf.rect(xPos, yPosition, colWidths[3], cellHeight);
    pdf.text(item.amount.toLocaleString(), xPos + 2, yPosition + 5);
    
    yPosition += cellHeight;
  });
  
  // Local Management
  xPos = 15;
  pdf.rect(xPos, yPosition, colWidths[0], 8);
  pdf.text('Local Management Fee', xPos + 2, yPosition + 5.5);
  xPos += colWidths[0];
  
  pdf.rect(xPos, yPosition, colWidths[1], 8);
  pdf.text(data.localManagement.quantity.toString(), xPos + 2, yPosition + 5.5);
  xPos += colWidths[1];
  
  pdf.rect(xPos, yPosition, colWidths[2], 8);
  pdf.text(data.localManagement.rate.toLocaleString(), xPos + 2, yPosition + 5.5);
  xPos += colWidths[2];
  
  pdf.rect(xPos, yPosition, colWidths[3], 8);
  pdf.text(data.localManagement.amount.toLocaleString(), xPos + 2, yPosition + 5.5);
  yPosition += 8;
  
  // Totals
  const lineItemsTotal = data.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotal = lineItemsTotal + data.localManagement.amount;
  const gstAmount = (subTotal * data.gstRate) / 100;
  const totalAmount = subTotal + gstAmount;
  
  yPosition += 5;
  pdf.setFont('helvetica', 'bold');
  
  const totalsX = pageWidth - 70;
  pdf.text('Sub Total:', totalsX, yPosition);
  pdf.text(`PKR ${subTotal.toLocaleString()}`, totalsX + 35, yPosition);
  yPosition += 6;
  
  pdf.text(`GST (${data.gstRate}%):`, totalsX, yPosition);
  pdf.text(`PKR ${gstAmount.toLocaleString()}`, totalsX + 35, yPosition);
  yPosition += 6;
  
  pdf.setFontSize(12);
  pdf.text('Total Amount:', totalsX, yPosition);
  pdf.text(`PKR ${totalAmount.toLocaleString()}`, totalsX + 35, yPosition);
  
  // Add footer
  addInvoiceFooter(pdf);
  
  pdf.save(`Project-Invoice-${data.invoiceNumber}.pdf`);
};
