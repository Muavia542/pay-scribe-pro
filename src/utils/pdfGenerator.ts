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

export const generateEmployeesPDF = (employees: Employee[], month: string, year: string, selectedColumns?: any) => {
  const doc = new jsPDF();
  
  // Add header with light blue background (sky color)
  doc.setFillColor(135, 206, 235); // Light blue sky color
  doc.rect(0, 0, 210, 40, 'F'); // Full width header
  
  // Add logo
  try {
    const logoImg = new Image();
    logoImg.src = '/lovable-uploads/3ad6dd25-3db5-4d04-bb8a-fed3dd000209.png';
    doc.addImage(logoImg, 'PNG', 10, 5, 30, 30);
  } catch (error) {
    console.warn('Logo could not be added to PDF');
  }
  
  // Add company name in header
  doc.setTextColor(255, 255, 255); // White text for header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Tahira Construction & Services', 50, 20);
  
  // Add report title
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Employee Details Report', 50, 50);
  
  // Add subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(`${month} ${year}`, 50, 65);
  
  // Determine which columns to include (always include S.No first)
  const columnMapping = {
    serialNo: { header: 'S.No', width: 15 },
    name: { header: 'Name', width: 30 },
    department: { header: 'Department', width: 25 },
    cnic: { header: 'CNIC', width: 30 },
    category: { header: 'Category', width: 20 },
    basicSalary: { header: 'Basic Salary', width: 25 },
    workingDays: { header: 'Working Days', width: 20 },
    totalSalary: { header: 'Total Salary', width: 25 },
    signature: { header: 'Signature', width: 25 }
  };

  // Use selected columns or default columns, always include serial number
  const defaultColumns = ['serialNo', 'name', 'department', 'workingDays', 'totalSalary', 'signature'];
  let columnsToShow = selectedColumns 
    ? ['serialNo', ...Object.keys(selectedColumns).filter(key => selectedColumns[key] && key !== 'serialNo')]
    : defaultColumns;

  const headers = columnsToShow.map(col => columnMapping[col as keyof typeof columnMapping].header);
  const colWidths = columnsToShow.map(col => columnMapping[col as keyof typeof columnMapping].width);
  
  doc.setFontSize(10);
  let y = 80;
  
  // Header row
  let x = 15;
  headers.forEach((header, index) => {
    doc.text(header, x, y);
    x += colWidths[index];
  });
  
  y += 15;
  
  // Add employee data
  employees.forEach((employee, index) => {
    if (y > 270) { // New page if needed
      doc.addPage();
      y = 30;
      // Repeat headers on new page
      x = 15;
      headers.forEach((header, index) => {
        doc.text(header, x, y);
        x += colWidths[index];
      });
      y += 15;
    }
    
    // Create row data based on selected columns
    const dataMapping = {
      serialNo: (index + 1).toString(),
      name: employee.name.substring(0, 18),
      department: employee.department.substring(0, 15),
      cnic: employee.cnic.substring(0, 13),
      category: employee.category,
      basicSalary: `PKR ${(employee.basicSalary || 0).toLocaleString()}`,
      workingDays: (employee.workingDays || 0).toString(),
      totalSalary: `PKR ${(employee.calculatedSalary || 0).toLocaleString()}`,
      signature: '' // Signature field left blank for manual signing
    };

    const rowData = columnsToShow.map(col => dataMapping[col as keyof typeof dataMapping] || '');
    
    x = 15;
    rowData.forEach((data, colIndex) => {
      doc.text(data, x, y);
      x += colWidths[colIndex];
    });
    
    y += 10; // Increased spacing between rows
  });
  
  // Add summary
  y += 15;
  const totalSalary = employees.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0);
  doc.setFontSize(12);
  doc.text(`Total Employees: ${employees.length}`, 20, y);
  doc.text(`Total Salary: PKR ${totalSalary.toLocaleString()}`, 20, y + 12);
  
  // Add footer with light blue background
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(135, 206, 235); // Light blue sky color
  doc.rect(0, pageHeight - 20, 210, 20, 'F'); // Full width footer
  
  // Add footer content
  doc.setTextColor(255, 255, 255); // White text for footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Left: Address
  doc.text('Address: VPO Makori Tehsil Banda Daud Shah District Karak', 10, pageHeight - 10);
  
  // Center: Email
  doc.text('Email: mshamidkhattak@gmail.com', 70, pageHeight - 10);
  
  // Right: Contact
  doc.text('Contact No: 03155157591', 150, pageHeight - 10);
  
  // Save the PDF
  doc.save(`employees-report-${month}-${year}.pdf`);
};