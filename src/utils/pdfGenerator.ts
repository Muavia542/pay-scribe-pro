import jsPDF from 'jspdf';
import { Employee } from '@/types/employee';

export const generateEmployeesPDF = (employees: Employee[], month: string, year: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Employee Report', 20, 20);
  
  // Add subtitle
  doc.setFontSize(14);
  doc.text(`${month} ${year}`, 20, 35);
  
  // Add table headers
  doc.setFontSize(10);
  const headers = ['Name', 'Department', 'Category', 'Working Days', 'Total Salary', 'Signature'];
  const colWidths = [35, 30, 25, 20, 25, 30]; // Adjusted column widths
  let y = 50;
  
  // Header row
  let x = 10;
  headers.forEach((header, index) => {
    doc.text(header, x, y);
    x += colWidths[index];
  });
  
  y += 10;
  
  // Add employee data
  employees.forEach((employee, index) => {
    if (y > 280) { // New page if needed
      doc.addPage();
      y = 20;
      // Repeat headers on new page
      x = 10;
      headers.forEach((header, index) => {
        doc.text(header, x, y);
        x += colWidths[index];
      });
      y += 10;
    }
    
    const rowData = [
      employee.name.substring(0, 18),
      employee.department.substring(0, 15),
      employee.category,
      employee.workingDays.toString(),
      `PKR ${(employee.calculatedSalary || 0).toLocaleString()}`,
      '' // Signature field left blank for manual signing
    ];
    
    x = 10;
    rowData.forEach((data, colIndex) => {
      doc.text(data, x, y);
      x += colWidths[colIndex];
    });
    
    y += 8;
  });
  
  // Add summary
  y += 10;
  const totalSalary = employees.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0);
  doc.setFontSize(12);
  doc.text(`Total Employees: ${employees.length}`, 20, y);
  doc.text(`Total Salary: PKR ${totalSalary.toLocaleString()}`, 20, y + 10);
  
  // Save the PDF
  doc.save(`employees-report-${month}-${year}.pdf`);
};