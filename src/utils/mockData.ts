import { Employee, Department } from "@/types/employee";

export const mockEmployees: Employee[] = [
  // SOD Department (16 employees)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `sod-${i + 1}`,
    name: `SOD Employee ${i + 1}`,
    cnic: `42101-${String(1000000 + i).substring(1)}-1`,
    department: "SOD",
    basicSalary: 28000 + Math.floor(Math.random() * 7000),
    workingDays: 26,
    calculatedSalary: (28000 + Math.floor(Math.random() * 7000)) * 26,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  })),
  
  // BS Department (18 employees)
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `bs-${i + 1}`,
    name: `BS Employee ${i + 1}`,
    cnic: `42101-${String(2000000 + i).substring(1)}-2`,
    department: "BS",
    basicSalary: 32000 + Math.floor(Math.random() * 8000),
    workingDays: 26,
    calculatedSalary: (32000 + Math.floor(Math.random() * 8000)) * 26,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  })),
  
  // Production Area-1 (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `area1-${i + 1}`,
    name: `Area-1 Worker ${i + 1}`,
    cnic: `42101-${String(3000000 + i).substring(1)}-3`,
    department: "Production Area-1",
    basicSalary: 25000 + Math.floor(Math.random() * 5000),
    workingDays: 26,
    calculatedSalary: (25000 + Math.floor(Math.random() * 5000)) * 26,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  })),
  
  // Production Area-2 (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `area2-${i + 1}`,
    name: `Area-2 Worker ${i + 1}`,
    cnic: `42101-${String(4000000 + i).substring(1)}-4`,
    department: "Production Area-2",
    basicSalary: 25000 + Math.floor(Math.random() * 5000),
    workingDays: 26,
    calculatedSalary: (25000 + Math.floor(Math.random() * 5000)) * 26,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  })),
  
  // Production Process (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `process-${i + 1}`,
    name: `Process Worker ${i + 1}`,
    cnic: `42101-${String(5000000 + i).substring(1)}-5`,
    department: "Production Process",
    basicSalary: 27000 + Math.floor(Math.random() * 6000),
    workingDays: 26,
    calculatedSalary: (27000 + Math.floor(Math.random() * 6000)) * 26,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  })),
  
  // Production Inspection (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `inspection-${i + 1}`,
    name: `Inspection Worker ${i + 1}`,
    cnic: `42101-${String(6000000 + i).substring(1)}-6`,
    department: "Production Inspection",
    basicSalary: 29000 + Math.floor(Math.random() * 6000),
    workingDays: 26,
    calculatedSalary: (29000 + Math.floor(Math.random() * 6000)) * 26,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  })),
];

export const mockDepartments: Department[] = [
  {
    id: "1",
    name: "SOD",
    description: "Store Operations Department - Managing inventory and supplies",
    employeeCount: 16,
    totalSalary: 16 * 28000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2", 
    name: "BS",
    description: "Business Services - Administrative and support functions",
    employeeCount: 18,
    totalSalary: 18 * 32000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Production Area-1",
    description: "Manufacturing operations in production area 1",
    employeeCount: 13,
    totalSalary: 13 * 25000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Production Area-2", 
    description: "Manufacturing operations in production area 2",
    employeeCount: 13,
    totalSalary: 13 * 25000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Production Process",
    description: "Process control and manufacturing workflows",
    employeeCount: 13,
    totalSalary: 13 * 27000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    name: "Production Inspection",
    description: "Quality control and product inspection",
    employeeCount: 13,
    totalSalary: 13 * 29000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
];

export const calculateTotalSalary = (employees: Employee[]): number => {
  return employees.reduce((total, emp) => total + (emp.calculatedSalary || 0), 0);
};

export const getEmployeesByDepartment = (employees: Employee[], department: string): Employee[] => {
  return employees.filter(emp => emp.department === department);
};