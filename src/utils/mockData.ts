import { Employee, Department } from "@/types/employee";

export const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "Ahmed Hassan",
    cnic: "42101-1234567-1",
    department: "Construction",
    basicSalary: 25000,
    workingDays: 26,
    calculatedSalary: 25000 * 26,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Fatima Ali",
    cnic: "42101-2345678-2",
    department: "Administration",
    basicSalary: 35000,
    workingDays: 22,
    calculatedSalary: 35000 * 22,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    name: "Muhammad Khan",
    cnic: "42101-3456789-3",
    department: "Construction",
    basicSalary: 28000,
    workingDays: 25,
    calculatedSalary: 28000 * 25,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    name: "Aisha Sheikh",
    cnic: "42101-4567890-4",
    department: "Security",
    basicSalary: 22000,
    workingDays: 30,
    calculatedSalary: 22000 * 30,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    id: "5",
    name: "Omar Malik",
    cnic: "42101-5678901-5",
    department: "Maintenance",
    basicSalary: 24000,
    workingDays: 24,
    calculatedSalary: 24000 * 24,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
];

export const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Construction",
    description: "Building and construction workers",
    employeeCount: 2,
    totalSalary: 1350000,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Administration",
    description: "Administrative and office staff",
    employeeCount: 1,
    totalSalary: 770000,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Security",
    description: "Security and safety personnel",
    employeeCount: 1,
    totalSalary: 660000,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Maintenance",
    description: "Equipment and facility maintenance",
    employeeCount: 1,
    totalSalary: 576000,
    createdAt: new Date("2024-01-01"),
  },
];

export const calculateTotalSalary = (employees: Employee[]): number => {
  return employees.reduce((total, emp) => total + (emp.calculatedSalary || 0), 0);
};

export const getEmployeesByDepartment = (employees: Employee[], department: string): Employee[] => {
  return employees.filter(emp => emp.department === department);
};