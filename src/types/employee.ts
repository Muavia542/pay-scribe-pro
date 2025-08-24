export interface Employee {
  id: string;
  name: string;
  cnic: string;
  department: string;
  category: 'Skilled' | 'Unskilled';
  basicSalary: number;
  workingDays: number;
  calculatedSalary?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  employeeCount: number;
  totalSalary: number;
  createdAt: Date;
}

export interface PayrollEntry {
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  workingDays: number;
  calculatedSalary: number;
  month: string;
  year: number;
}

export interface Invoice {
  id: string;
  department: string;
  month: string;
  year: number;
  totalAmount: number;
  employees: PayrollEntry[];
  generatedAt: Date;
}