export const calculateSalary = (basicSalary: number, workingDays: number): number => {
  return Math.round((basicSalary / 22) * workingDays);
};

// Custom rounding function for invoice amounts
const roundInvoiceAmount = (amount: number): number => {
  const decimal = amount - Math.floor(amount);
  if (decimal > 0.60) {
    return Math.ceil(amount);
  } else if (decimal < 0.50) {
    return Math.floor(amount);
  } else {
    return Math.round(amount);
  }
};

export const invoiceCalculations = {
  skilledLaborsAmount: (attendance: number): number => 2624.00 * attendance,
  unskilledLaborsAmount: (attendance: number): number => 1636.36 * attendance,
  eobiAmount: (attendance: number): number => Math.round((attendance / 22) * 2220.00),
  gstAmount: (subTotal: number): number => subTotal * 0.15,
  
  calculateInvoiceTotal: (serviceFee: number, skilledAttendance: number, unskilledAttendance: number) => {
    const skilledAmount = invoiceCalculations.skilledLaborsAmount(skilledAttendance);
    const unskilledAmount = invoiceCalculations.unskilledLaborsAmount(unskilledAttendance);
    const subTotal = serviceFee + skilledAmount + unskilledAmount;
    const eobiAmount = invoiceCalculations.eobiAmount(skilledAttendance + unskilledAttendance);
    const totalSum = subTotal + eobiAmount;
    const gstAmount = invoiceCalculations.gstAmount(subTotal); // Fixed: GST calculated on subTotal only
    const totalAmount = roundInvoiceAmount(totalSum + gstAmount); // Apply custom rounding
    
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