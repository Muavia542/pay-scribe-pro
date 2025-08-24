import { Employee, Department } from "@/types/employee";

export const mockEmployees: Employee[] = [
  // SOD Department (16 employees)
  ...Array.from({ length: 16 }, (_, i) => ({
    id: `sod-${i + 1}`,
    name: `SOD Employee ${i + 1}`,
    cnic: `42101-${String(1000000 + i).substring(1)}-1`,
    department: "SOD",
    category: i < 8 ? 'Skilled' : 'Unskilled' as 'Skilled' | 'Unskilled',
    basicSalary: 36000 + Math.floor(Math.random() * 8000) - 4000, // 32000-40000
    workingDays: 26,
    calculatedSalary: (36000 + Math.floor(Math.random() * 8000) - 4000) * 26,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  })),
  
  // BS Department (18 employees)
  ...Array.from({ length: 18 }, (_, i) => ({
    id: `bs-${i + 1}`,
    name: `BS Employee ${i + 1}`,
    cnic: `42101-${String(2000000 + i).substring(1)}-2`,
    department: "BS",
    category: i < 12 ? 'Skilled' : 'Unskilled' as 'Skilled' | 'Unskilled',
    basicSalary: 36000 + Math.floor(Math.random() * 10000) - 5000, // 31000-41000
    workingDays: 26,
    calculatedSalary: (36000 + Math.floor(Math.random() * 10000) - 5000) * 26,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  })),
  
  // Production Area-1 (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `area1-${i + 1}`,
    name: `Area-1 Worker ${i + 1}`,
    cnic: `42101-${String(3000000 + i).substring(1)}-3`,
    department: "Production Area-1",
    category: i < 6 ? 'Skilled' : 'Unskilled' as 'Skilled' | 'Unskilled',
    basicSalary: 36000 + Math.floor(Math.random() * 6000) - 3000, // 33000-39000
    workingDays: 26,
    calculatedSalary: (36000 + Math.floor(Math.random() * 6000) - 3000) * 26,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  })),
  
  // Production Area-2 (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `area2-${i + 1}`,
    name: `Area-2 Worker ${i + 1}`,
    cnic: `42101-${String(4000000 + i).substring(1)}-4`,
    department: "Production Area-2",
    category: i < 7 ? 'Skilled' : 'Unskilled' as 'Skilled' | 'Unskilled',
    basicSalary: 36000 + Math.floor(Math.random() * 6000) - 3000, // 33000-39000
    workingDays: 26,
    calculatedSalary: (36000 + Math.floor(Math.random() * 6000) - 3000) * 26,
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  })),
  
  // Production Process (13 employees)
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `process-${i + 1}`,
    name: `Process Worker ${i + 1}`,
    cnic: `42101-${String(5000000 + i).substring(1)}-5`,
    department: "Production Process",
    category: i < 8 ? 'Skilled' : 'Unskilled' as 'Skilled' | 'Unskilled',
    basicSalary: 36000 + Math.floor(Math.random() * 8000) - 4000, // 32000-40000
    workingDays: 26,
    calculatedSalary: (36000 + Math.floor(Math.random() * 8000) - 4000) * 26,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  })),
];

export const mockDepartments: Department[] = [
  {
    id: "1",
    name: "SOD",
    description: "Store Operations Department - Managing inventory and supplies",
    employeeCount: 16,
    totalSalary: 16 * 36000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2", 
    name: "BS",
    description: "Business Services - Administrative and support functions",
    employeeCount: 18,
    totalSalary: 18 * 36000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Production Area-1",
    description: "Manufacturing operations in production area 1",
    employeeCount: 13,
    totalSalary: 13 * 36000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Production Area-2", 
    description: "Manufacturing operations in production area 2",
    employeeCount: 13,
    totalSalary: 13 * 36000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Production Process",
    description: "Process control and manufacturing workflows",
    employeeCount: 13,
    totalSalary: 13 * 36000 * 26, // Average calculation
    createdAt: new Date("2024-01-01"),
  },
];

export const calculateTotalSalary = (employees: Employee[]): number => {
  return employees.reduce((total, emp) => total + (emp.calculatedSalary || 0), 0);
};

export const getEmployeesByDepartment = (employees: Employee[], department: string): Employee[] => {
  return employees.filter(emp => emp.department === department);
};