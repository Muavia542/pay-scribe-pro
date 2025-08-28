export const calculateSalary = (basicSalary: number, workingDays: number): number => {
  return Math.round((basicSalary / 22) * workingDays);
};

export const invoiceCalculations = {
  skilledLaborsAmount: (attendance: number): number => 2624.00 * attendance,
  unskilledLaborsAmount: (attendance: number): number => 1636.36 * attendance,
  eobiAmount: (attendance: number): number => Math.round((attendance / 22) * 2220.00),
  gstAmount: (totalSum: number): number => totalSum * 0.15,
  
  calculateInvoiceTotal: (serviceFee: number, skilledAttendance: number, unskilledAttendance: number) => {
    const skilledAmount = invoiceCalculations.skilledLaborsAmount(skilledAttendance);
    const unskilledAmount = invoiceCalculations.unskilledLaborsAmount(unskilledAttendance);
    const subTotal = serviceFee + skilledAmount + unskilledAmount;
    const eobiAmount = invoiceCalculations.eobiAmount(skilledAttendance + unskilledAttendance);
    const totalSum = subTotal + eobiAmount;
    const gstAmount = invoiceCalculations.gstAmount(totalSum);
    const totalAmount = totalSum + gstAmount;
    
    return {
      skilledAmount,
      unskilledAmount,
      subTotal,
      eobiAmount,
      totalSum,
      gstAmount,
      totalAmount
    };
  }
};