import jsPDF from 'jspdf';
import { Employee } from '@/types/employee';

// Custom rounding function for invoice totals
export const roundInvoiceAmount = (amount: number): number => {
  const decimal = amount - Math.floor(amount);
  if (decimal > 0.60) {
    return Math.ceil(amount);
  } else if (decimal < 0.50) {
    return Math.floor(amount);
  } else {
    return Math.round(amount);
  }
};

export const generateEmployeesPDF = (employees: Employee[], month: string, year: string, selectedColumns?: any, department?: string) => {
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
  const departmentText = department && department !== 'all' ? ` - ${department}` : '';
  const title = `Employee Details Report${departmentText} - ${month} ${year}`;
  const titleWidth = pdf.getTextWidth(title);
  pdf.text(title, (pageWidth - titleWidth) / 2, 55);
  
  // Define columns and their widths
  const columns = [
    { header: 'S.No', dataKey: 'serialNumber', width: 15 },
    ...(selectedColumns?.name !== false ? [{ header: 'Name', dataKey: 'name', width: 50 }] : []),
    ...(selectedColumns?.department !== false ? [{ header: 'Department', dataKey: 'department', width: 35 }] : []),
    ...(selectedColumns?.workingDays !== false ? [{ header: 'Working Days', dataKey: 'workingDays', width: 25 }] : []),
    ...(selectedColumns?.totalSalary !== false ? [{ header: 'Total Salary', dataKey: 'calculatedSalary', width: 30 }] : []),
    ...(selectedColumns?.signature !== false ? [{ header: 'Signature', dataKey: 'signature', width: 30 }] : []),
    ...(selectedColumns?.basicSalary === true ? [{ header: 'Basic Salary', dataKey: 'basicSalary', width: 30 }] : []),
    ...(selectedColumns?.category === true ? [{ header: 'Category', dataKey: 'category', width: 25 }] : []),
    ...(selectedColumns?.cnic === true ? [{ header: 'CNIC', dataKey: 'cnic', width: 35 }] : [])
  ];

  // Prepare data for the table with serial numbers
  const data = employees.map((emp, index) => ({
    serialNumber: (index + 1).toString(),
    name: emp.name,
    department: emp.department,
    workingDays: emp.workingDays?.toString() || '0',
    calculatedSalary: `PKR ${emp.calculatedSalary?.toLocaleString() || '0'}`,
    signature: '',
    basicSalary: `PKR ${emp.basicSalary?.toLocaleString() || '0'}`,
    category: emp.category || '',
    cnic: emp.cnic || ''
  }));

  let yPosition = 75;

  // Table header with better styling
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  // Header background
  pdf.setFillColor(240, 240, 240); // Light gray background
  let xPosition = 20;
  let totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  pdf.rect(xPosition, yPosition, totalWidth, 12, 'F');
  
  // Header borders and text
  pdf.setDrawColor(0, 0, 0); // Black border
  pdf.setLineWidth(0.5);
  xPosition = 20;
  columns.forEach((col) => {
    pdf.rect(xPosition, yPosition, col.width, 12);
    pdf.text(col.header, xPosition + 2, yPosition + 8);
    xPosition += col.width;
  });
  
  yPosition += 12;
  
  // Table rows with better formatting
  pdf.setFont('helvetica', 'normal');
  
  data.forEach((row, index) => {
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 30;
      
      // Repeat header on new page
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(240, 240, 240);
      let headerX = 20;
      let totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
      pdf.rect(headerX, yPosition, totalWidth, 12, 'F');
      
      headerX = 20;
      columns.forEach((col) => {
        pdf.rect(headerX, yPosition, col.width, 12);
        pdf.text(col.header, headerX + 2, yPosition + 8);
        headerX += col.width;
      });
      yPosition += 12;
      pdf.setFont('helvetica', 'normal');
    }
    
    // Alternating row colors for better readability
    if (index % 2 === 1) {
      pdf.setFillColor(250, 250, 250); // Very light gray
      let totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
      pdf.rect(20, yPosition, totalWidth, 10, 'F');
    }
    
    let rowX = 20;
    columns.forEach((col) => {
      const cellValue = row[col.dataKey as keyof typeof row] || '';
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.3);
      pdf.rect(rowX, yPosition, col.width, 10);
      
      // Text alignment and truncation for long content
      let displayText = cellValue.toString();
      
      // Improved text handling for names
      if (col.dataKey === 'name') {
        // Use smaller font for names to fit more content
        pdf.setFontSize(8);
        if (displayText.length > 25) {
          displayText = displayText.substring(0, 22) + '...';
        }
      } else if (col.dataKey === 'department' && displayText.length > 15) {
        displayText = displayText.substring(0, 12) + '...';
      }
      
      pdf.text(displayText, rowX + 2, yPosition + 7);
      
      // Reset font size after name column
      if (col.dataKey === 'name') {
        pdf.setFontSize(10);
      }
      rowX += col.width;
    });
    
    yPosition += 10;
  });
  
  // Add summary
  yPosition += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text(`Total Employees: ${employees.length}`, 20, yPosition);
  
  const totalSalary = employees.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0);
  pdf.text(`Total Salary: PKR ${totalSalary.toLocaleString()}`, 20, yPosition + 10);

  // Add footer with company information - light blue background
  const footerY = pageHeight - 20;
  pdf.setFillColor(135, 206, 235); // Sky blue color
  pdf.rect(0, footerY - 5, pageWidth, 25, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0); // Black text for better contrast
  
  // Footer content in three sections - horizontally aligned
  const leftText = 'Address: VPO Makori Tehsil Banda Daud Shah District Karak';
  const centerText = 'Email: mshamidkhattak@gmail.com';
  const rightText = 'Contact No: 03155157591';
  
  // Calculate positions for horizontal alignment
  const sectionWidth = pageWidth / 3;
  
  // Left section
  pdf.text(leftText, 10, footerY + 5, { maxWidth: sectionWidth - 15 });
  
  // Center section
  const centerTextWidth = pdf.getTextWidth(centerText);
  pdf.text(centerText, (pageWidth - centerTextWidth) / 2, footerY + 5);
  
  // Right section
  const rightTextWidth = pdf.getTextWidth(rightText);
  pdf.text(rightText, pageWidth - rightTextWidth - 10, footerY + 5);

  // Save the PDF
  pdf.save(`employees-report-${month}-${year}.pdf`);
};