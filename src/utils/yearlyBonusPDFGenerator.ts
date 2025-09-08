import jsPDF from 'jspdf';

interface BonusRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  category: string;
  bonusAmount: number;
}

export const generateYearlyBonusPDF = (
  bonusRecords: BonusRecord[],
  year: string
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add company header with sky blue background
  pdf.setFillColor(135, 206, 235); // Sky blue color
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Add logo/company name
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  const companyName = 'Tahira Construction & Services';
  const companyNameWidth = pdf.getTextWidth(companyName);
  pdf.text(companyName, (pageWidth - companyNameWidth) / 2, 25);
  
  // Reset text color for rest of document
  pdf.setTextColor(0, 0, 0);
  
  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const title = `Yearly Bonus Report - ${year}`;
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 55);
  
  // Add date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const currentDate = new Date().toLocaleDateString();
  pdf.text(`Generated on: ${currentDate}`, 20, 70);
  
  // Define columns and their widths
  const columns = [
    { header: 'S.No', width: 20 },
    { header: 'Employee Name', width: 60 },
    { header: 'Department', width: 40 },
    { header: 'Category', width: 30 },
    { header: 'Bonus Amount (PKR)', width: 40 }
  ];
  
  let yPosition = 85;
  
  // Table header with better styling
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  // Header background
  pdf.setFillColor(240, 240, 240); // Light gray background
  let xPosition = 10;
  let totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  pdf.rect(xPosition, yPosition, totalWidth, 12, 'F');
  
  // Header borders and text
  pdf.setDrawColor(0, 0, 0); // Black border
  pdf.setLineWidth(0.5);
  xPosition = 10;
  columns.forEach((col) => {
    pdf.rect(xPosition, yPosition, col.width, 12);
    pdf.text(col.header, xPosition + 2, yPosition + 8);
    xPosition += col.width;
  });
  
  yPosition += 12;
  
  // Table rows with better formatting
  pdf.setFont('helvetica', 'normal');
  
  // Group records by department
  const groupedRecords = bonusRecords.reduce((acc, record) => {
    if (!acc[record.department]) {
      acc[record.department] = [];
    }
    acc[record.department].push(record);
    return acc;
  }, {} as Record<string, BonusRecord[]>);
  
  let serialNumber = 1;
  
  Object.entries(groupedRecords).forEach(([department, records]) => {
    // Department header
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setFillColor(200, 220, 255); // Light blue background for department
    pdf.rect(10, yPosition, totalWidth, 10, 'F');
    pdf.text(`${department} Department`, 12, yPosition + 7);
    yPosition += 10;
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    records.forEach((record) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 30;
        
        // Repeat header on new page
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
        let headerX = 10;
        pdf.rect(headerX, yPosition, totalWidth, 12, 'F');
        
        headerX = 10;
        columns.forEach((col) => {
          pdf.rect(headerX, yPosition, col.width, 12);
          pdf.text(col.header, headerX + 2, yPosition + 8);
          headerX += col.width;
        });
        yPosition += 12;
        pdf.setFont('helvetica', 'normal');
      }
      
      // Alternating row colors for better readability
      if (serialNumber % 2 === 0) {
        pdf.setFillColor(250, 250, 250); // Very light gray
        pdf.rect(10, yPosition, totalWidth, 10, 'F');
      }
      
      let rowX = 10;
      const rowData = [
        serialNumber.toString(),
        record.employeeName,
        record.department,
        record.category,
        `PKR ${record.bonusAmount.toLocaleString()}`
      ];
      
      columns.forEach((col, index) => {
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.3);
        pdf.rect(rowX, yPosition, col.width, 10);
        
        let displayText = rowData[index];
        
        // Text truncation for long content
        if (col.header === 'Employee Name' && displayText.length > 30) {
          displayText = displayText.substring(0, 27) + '...';
        } else if (col.header === 'Department' && displayText.length > 20) {
          displayText = displayText.substring(0, 17) + '...';
        }
        
        // Right align bonus amount
        if (col.header === 'Bonus Amount (PKR)') {
          const textWidth = pdf.getTextWidth(displayText);
          pdf.text(displayText, rowX + col.width - textWidth - 2, yPosition + 7);
        } else {
          pdf.text(displayText, rowX + 2, yPosition + 7);
        }
        
        rowX += col.width;
      });
      
      yPosition += 10;
      serialNumber++;
    });
    
    // Department subtotal
    const departmentTotal = records.reduce((sum, record) => sum + record.bonusAmount, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(255, 255, 200); // Light yellow background
    pdf.rect(10, yPosition, totalWidth, 10, 'F');
    
    rowX = 10 + columns[0].width + columns[1].width + columns[2].width;
    pdf.text('Subtotal:', rowX + 2, yPosition + 7);
    
    rowX += columns[3].width;
    const subtotalText = `PKR ${departmentTotal.toLocaleString()}`;
    const subtotalWidth = pdf.getTextWidth(subtotalText);
    pdf.text(subtotalText, rowX + columns[4].width - subtotalWidth - 2, yPosition + 7);
    
    yPosition += 15;
    pdf.setFont('helvetica', 'normal');
  });
  
  // Grand total
  yPosition += 10;
  const grandTotal = bonusRecords.reduce((sum, record) => sum + record.bonusAmount, 0);
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setFillColor(255, 200, 200); // Light red background
  pdf.rect(10, yPosition, totalWidth, 12, 'F');
  
  let rowX = 10 + columns[0].width + columns[1].width + columns[2].width;
  pdf.text('GRAND TOTAL:', rowX + 2, yPosition + 8);
  
  rowX += columns[3].width;
  const grandTotalText = `PKR ${grandTotal.toLocaleString()}`;
  const grandTotalWidth = pdf.getTextWidth(grandTotalText);
  pdf.text(grandTotalText, rowX + columns[4].width - grandTotalWidth - 2, yPosition + 8);
  
  // Add summary
  yPosition += 25;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(`Total Employees Receiving Bonus: ${bonusRecords.length}`, 20, yPosition);
  pdf.text(`Total Departments: ${Object.keys(groupedRecords).length}`, 20, yPosition + 10);
  
  // Add footer with company information
  const footerY = pageHeight - 20;
  pdf.setFillColor(135, 206, 235); // Sky blue color
  pdf.rect(0, footerY - 5, pageWidth, 25, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  
  // Footer content
  const leftText = 'Address: VPO Makori Tehsil Banda Daud Shah District Karak';
  const centerText = 'Email: mshamidkhattak@gmail.com';
  const rightText = 'Contact No: 03155157591';
  
  pdf.text(leftText, 10, footerY + 5, { maxWidth: pageWidth / 3 - 15 });
  
  const centerTextWidth = pdf.getTextWidth(centerText);
  pdf.text(centerText, (pageWidth - centerTextWidth) / 2, footerY + 5);
  
  const rightTextWidth = pdf.getTextWidth(rightText);
  pdf.text(rightText, pageWidth - rightTextWidth - 10, footerY + 5);
  
  // Save the PDF
  pdf.save(`yearly-bonus-report-${year}.pdf`);
};