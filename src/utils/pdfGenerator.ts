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
  const headers = ['Name', 'CNIC', 'Department', 'Category', 'Basic Salary', 'Working Days', 'Calculated Salary'];
  let y = 50;
  
  // Header row
  headers.forEach((header, index) => {
    doc.text(header, 10 + (index * 28), y);
  });
  
  y += 10;
  
  // Add employee data
  employees.forEach((employee, index) => {
    if (y > 280) { // New page if needed
      doc.addPage();
      y = 20;
    }
    
    const rowData = [
      employee.name.substring(0, 12),
      employee.cnic.substring(0, 15),
      employee.department.substring(0, 10),
      employee.category,
      `PKR ${employee.basicSalary.toLocaleString()}`,
      employee.workingDays.toString(),
      `PKR ${(employee.calculatedSalary || 0).toLocaleString()}`
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.text(data, 10 + (colIndex * 28), y);
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