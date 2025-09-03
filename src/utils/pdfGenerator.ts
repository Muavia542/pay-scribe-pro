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
  
  // Add logo
  try {
    const logoImg = new Image();
    logoImg.src = '/lovable-uploads/3ad6dd25-3db5-4d04-bb8a-fed3dd000209.png';
    doc.addImage(logoImg, 'PNG', 10, 10, 20, 20);
  } catch (error) {
    console.warn('Logo could not be added to PDF');
  }
  
  // Add title
  doc.setFontSize(20);
  doc.text('Employee Report', 40, 20);
  
  // Add subtitle
  doc.setFontSize(14);
  doc.text(`${month} ${year}`, 40, 35);
  
  // Determine which columns to include
  const columnMapping = {
    name: { header: 'Name', width: 35 },
    department: { header: 'Department', width: 30 },
    cnic: { header: 'CNIC', width: 35 },
    category: { header: 'Category', width: 25 },
    basicSalary: { header: 'Basic Salary', width: 30 },
    workingDays: { header: 'Working Days', width: 25 },
    totalSalary: { header: 'Total Salary', width: 30 },
    signature: { header: 'Signature', width: 30 }
  };

  // Use selected columns or default columns
  const defaultColumns = ['name', 'department', 'workingDays', 'totalSalary', 'signature'];
  const columnsToShow = selectedColumns 
    ? Object.keys(selectedColumns).filter(key => selectedColumns[key])
    : defaultColumns;

  const headers = columnsToShow.map(col => columnMapping[col as keyof typeof columnMapping].header);
  const colWidths = columnsToShow.map(col => columnMapping[col as keyof typeof columnMapping].width);
  
  doc.setFontSize(10);
  let y = 55;
  
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
      name: employee.name.substring(0, 20),
      department: employee.department.substring(0, 18),
      cnic: employee.cnic.substring(0, 15),
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
  
  // Save the PDF
  doc.save(`employees-report-${month}-${year}.pdf`);
};