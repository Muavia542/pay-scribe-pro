import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Calculator, FileSpreadsheet } from "lucide-react";
import { mockEmployees, mockDepartments } from "@/utils/mockData";

const Payroll = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("current");

  const filteredEmployees = selectedDepartment === "all" 
    ? mockEmployees 
    : mockEmployees.filter(emp => emp.department === selectedDepartment);

  const totalPayroll = filteredEmployees.reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0);
  const totalEmployees = filteredEmployees.length;
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  const exportToExcel = () => {
    // Implementation for Excel export would go here
    console.log("Exporting to Excel...");
  };

  const exportToPDF = () => {
    // Implementation for PDF export would go here
    console.log("Exporting to PDF...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Calculate and manage employee salaries</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="last">Last Month</SelectItem>
                    <SelectItem value="january">January 2024</SelectItem>
                    <SelectItem value="february">February 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <Calculator className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalEmployees}</p>
            <p className="text-sm text-muted-foreground">Employees</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-success font-bold">₨</span>
            </div>
            <p className="text-2xl font-bold text-success">PKR {totalPayroll.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Payroll</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-warning font-bold">Avg</span>
            </div>
            <p className="text-2xl font-bold text-warning">PKR {avgSalary.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Average Salary</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>
            Salary Calculation - {selectedDepartment === "all" ? "All Departments" : selectedDepartment}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Calculated Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.cnic}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>PKR {employee.basicSalary.toLocaleString()}</TableCell>
                  <TableCell>{employee.workingDays}</TableCell>
                  <TableCell className="font-bold text-success">
                    PKR {employee.calculatedSalary?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      Calculated
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Department-wise Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockDepartments.map((dept) => (
              <div key={dept.id} className="p-4 rounded-lg bg-muted/30">
                <h3 className="font-medium text-foreground mb-2">{dept.name}</h3>
                <p className="text-sm text-muted-foreground mb-1">{dept.employeeCount} employees</p>
                <p className="font-bold text-success">PKR {dept.totalSalary.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payroll;