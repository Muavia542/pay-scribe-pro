import jsPDF from 'jspdf';

export interface InvoiceHeaderData {
  invoiceNumber: string;
  date: string;
  contractNumber: string;
  ntn: string;
  kpkGst: string;
  month: string;
  service: string;
}

export const addInvoiceHeader = (pdf: jsPDF, headerData: InvoiceHeaderData) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add company header with light blue background
  pdf.setFillColor(173, 216, 230); // Light blue color
  pdf.rect(0, 0, pageWidth, 20, 'F');
  
  // Company name - white, bold, centered
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const companyName = 'TAHIRA CONSTRUCTION & SERVICES';
  const companyNameWidth = pdf.getTextWidth(companyName);
  pdf.text(companyName, (pageWidth - companyNameWidth) / 2, 13);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  
  let yPosition = 30;
  
  // Bill To and Invoice Details in two columns
  pdf.setFont('helvetica', 'bold');
  pdf.text('Bill To:', 15, yPosition);
  pdf.text('Invoice Details:', pageWidth / 2 + 5, yPosition);
  
  yPosition += 7;
  pdf.setFont('helvetica', 'normal');
  
  // Left column - Bill To
  const billToLines = [
    'Chief Finance Officer',
    'Mol Pakistan Oil & Gas Co. B.V.',
    'Islamabad Stock Exchange Towers, Floor No. 18,',
    '55-Jinnah Avenue, Islamabad, Pakistan 4400.',
    'NTN # 1938929-9',
    'STRN: 701270001264'
  ];
  
  billToLines.forEach(line => {
    pdf.text(line, 15, yPosition);
    yPosition += 5;
  });
  
  // Right column - Invoice Details
  yPosition = 37; // Reset for right column
  const invoiceDetails = [
    `Date: ${headerData.date}`,
    `Contract #: ${headerData.contractNumber}`,
    `NTN #: ${headerData.ntn}`,
    `KPK GST #: ${headerData.kpkGst}`
  ];
  
  invoiceDetails.forEach(line => {
    pdf.text(line, pageWidth / 2 + 5, yPosition);
    yPosition += 5;
  });
  
  // Service Period section
  yPosition = Math.max(yPosition, 67) + 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Invoice For Month: ${headerData.month}`, 15, yPosition);
  yPosition += 6;
  pdf.text(`Service: ${headerData.service}`, 15, yPosition);
  
  pdf.setFont('helvetica', 'normal');
  
  return yPosition + 10; // Return Y position where content can start
};

export const addInvoiceFooter = (pdf: jsPDF) => {
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const footerY = pageHeight - 20;
  
  // Footer background
  pdf.setFillColor(173, 216, 230); // Light blue
  pdf.rect(0, footerY - 5, pageWidth, 25, 'F');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  
  // Footer text - centered and bold
  const footerLines = [
    'Address: VPO Makori Tehsil Banda Daud Shah District Karak',
    'Email: mshamidkhattak@gmail.com | Contact No: 03155157591'
  ];
  
  let footerYPos = footerY + 3;
  footerLines.forEach(line => {
    const textWidth = pdf.getTextWidth(line);
    pdf.text(line, (pageWidth - textWidth) / 2, footerYPos);
    footerYPos += 6;
  });
};
