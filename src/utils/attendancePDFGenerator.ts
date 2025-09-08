import jsPDF from 'jspdf';

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  category: string;
  dailyAttendance: { [day: number]: 'P' | 'A' };
  totalDays: number;
}

export const generateAttendancePDF = (
  attendanceRecords: AttendanceRecord[],
  department: string,
  monthYear: string,
  daysInMonth: number
) => {
  // Create PDF in landscape orientation
  const pdf = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Add company header with sky blue background
  pdf.setFillColor(135, 206, 235); // Sky blue color
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  // Add company name
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  const companyName = `TAHIRA CONSTRUCTION COMPANY - Process & Inspection Loadi`;
  const companyNameWidth = pdf.getTextWidth(companyName);
  pdf.text(companyName, (pageWidth - companyNameWidth) / 2, 15);
  
  // Reset text color for rest of document
  pdf.setTextColor(0, 0, 0);
  
  // Add attendance sheet header
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  const attendanceHeader = `Attendance Sheet: ${monthYear}`;
  const attendanceHeaderWidth = pdf.getTextWidth(attendanceHeader);
  pdf.text(attendanceHeader, pageWidth - attendanceHeaderWidth - 10, 15);
  
  // Add department name
  pdf.setFontSize(12);
  const deptText = `Department: ${department}`;
  pdf.text(deptText, 10, 35);
  
  // Table configuration
  const startY = 45;
  const rowHeight = 8;
  const col1Width = 15; // S.NO
  const col2Width = 60; // NAME
  const col3Width = 25; // CATEGORY
  const dayColWidth = (pageWidth - col1Width - col2Width - col3Width - 25 - 10) / daysInMonth; // DAYS columns
  const col5Width = 25; // TOTAL
  
  let yPosition = startY;
  
  // Table header
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  // Header background
  pdf.setFillColor(220, 220, 220); // Light gray background
  pdf.rect(10, yPosition, pageWidth - 20, rowHeight * 2, 'F');
  
  // Header borders and text - First row
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.5);
  
  let xPosition = 10;
  
  // S.NO header
  pdf.rect(xPosition, yPosition, col1Width, rowHeight * 2);
  pdf.text('S.NO', xPosition + 3, yPosition + 10);
  xPosition += col1Width;
  
  // NAME header
  pdf.rect(xPosition, yPosition, col2Width, rowHeight * 2);
  pdf.text('NAME', xPosition + 25, yPosition + 10);
  xPosition += col2Width;
  
  // CATEGORY header
  pdf.rect(xPosition, yPosition, col3Width, rowHeight * 2);
  pdf.text('CATEGORY', xPosition + 5, yPosition + 10);
  xPosition += col3Width;
  
  // DAYS header
  const daysStartX = xPosition;
  const daysWidth = dayColWidth * daysInMonth;
  pdf.rect(xPosition, yPosition, daysWidth, rowHeight);
  pdf.text('DAYS', xPosition + (daysWidth / 2) - 8, yPosition + 5);
  
  // Day numbers
  for (let day = 1; day <= daysInMonth; day++) {
    pdf.rect(xPosition, yPosition + rowHeight, dayColWidth, rowHeight);
    pdf.text(day.toString(), xPosition + (dayColWidth / 2) - 2, yPosition + rowHeight + 5);
    xPosition += dayColWidth;
  }
  
  // TOTAL header
  pdf.rect(xPosition, yPosition, col5Width, rowHeight * 2);
  pdf.text('TOTAL', xPosition + 7, yPosition + 10);
  
  yPosition += rowHeight * 2;
  
  // Table rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  attendanceRecords.forEach((record, index) => {
    xPosition = 10;
    
    // Alternating row colors
    if (index % 2 === 1) {
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, yPosition, pageWidth - 20, rowHeight, 'F');
    }
    
    // S.NO
    pdf.rect(xPosition, yPosition, col1Width, rowHeight);
    pdf.text((index + 1).toString(), xPosition + 6, yPosition + 5);
    xPosition += col1Width;
    
    // NAME
    pdf.rect(xPosition, yPosition, col2Width, rowHeight);
    let displayName = record.employeeName;
    if (displayName.length > 35) {
      displayName = displayName.substring(0, 32) + '...';
    }
    pdf.text(displayName, xPosition + 2, yPosition + 5);
    xPosition += col2Width;
    
    // CATEGORY
    pdf.rect(xPosition, yPosition, col3Width, rowHeight);
    pdf.text(record.category, xPosition + 2, yPosition + 5);
    xPosition += col3Width;
    
    // Daily attendance
    for (let day = 1; day <= daysInMonth; day++) {
      pdf.rect(xPosition, yPosition, dayColWidth, rowHeight);
      const attendance = record.dailyAttendance[day] || 'P';
      
      // Color code absences
      if (attendance === 'A') {
        pdf.setTextColor(255, 0, 0); // Red for absent
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setTextColor(0, 0, 0); // Black for present
        pdf.setFont('helvetica', 'normal');
      }
      
      pdf.text(attendance, xPosition + (dayColWidth / 2) - 1, yPosition + 5);
      xPosition += dayColWidth;
    }
    
    // Reset text formatting
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    // TOTAL
    pdf.rect(xPosition, yPosition, col5Width, rowHeight);
    pdf.text(record.totalDays.toString(), xPosition + 10, yPosition + 5);
    
    yPosition += rowHeight;
  });
  
  // Total row
  yPosition += 2;
  pdf.setFillColor(255, 255, 0); // Yellow background
  pdf.rect(10, yPosition, pageWidth - 20, rowHeight, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  
  const totalDays = attendanceRecords.reduce((sum, record) => sum + record.totalDays, 0);
  
  xPosition = 10 + col1Width + col2Width + col3Width + (dayColWidth * daysInMonth);
  pdf.rect(10, yPosition, xPosition - 10, rowHeight);
  pdf.text('Total Days', xPosition - 30, yPosition + 5);
  
  pdf.rect(xPosition, yPosition, col5Width, rowHeight);
  pdf.text(totalDays.toString(), xPosition + 10, yPosition + 5);
  
  // Add footer with company information
  const footerY = pageHeight - 15;
  pdf.setFillColor(135, 206, 235); // Sky blue color
  pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  
  // Footer content
  const leftText = 'Address: VPO Makori Tehsil Banda Daud Shah District Karak';
  const centerText = 'Email: mshamidkhattak@gmail.com';
  const rightText = 'Contact No: 03155157591';
  
  pdf.text(leftText, 10, footerY + 5);
  const centerTextWidth = pdf.getTextWidth(centerText);
  pdf.text(centerText, (pageWidth - centerTextWidth) / 2, footerY + 5);
  const rightTextWidth = pdf.getTextWidth(rightText);
  pdf.text(rightText, pageWidth - rightTextWidth - 10, footerY + 5);
  
  // Save the PDF
  const fileName = `attendance-${department.replace(/\s+/g, '-').toLowerCase()}-${monthYear.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  pdf.save(fileName);
};