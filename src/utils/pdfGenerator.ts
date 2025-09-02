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

export const generateEmployeesPDF = (employees: Employee[], month: string, year: string) => {
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
  
  // Add table headers with Basic Salary column included
  doc.setFontSize(10);
  const headers = ['Name', 'Department', 'Basic Salary', 'Working Days', 'Total Salary', 'Signature'];
  const colWidths = [35, 30, 25, 20, 25, 30]; // Adjusted column widths for better spacing
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
    
    // Updated: Added Basic Salary column and fixed data mapping
    const rowData = [
      employee.name.substring(0, 18),
      employee.department.substring(0, 15),
      `PKR ${(employee.basicSalary || 0).toLocaleString()}`,
      employee.workingDays.toString(),
      `PKR ${(employee.calculatedSalary || 0).toLocaleString()}`,
      '' // Signature field left blank for manual signing
    ];
    
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