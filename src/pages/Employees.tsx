import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { mockEmployees, mockDepartments } from "@/utils/mockData";
import { Employee } from "@/types/employee";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    cnic: "",
    department: "",
    basicSalary: "",
    workingDays: "",
  });

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.cnic.includes(searchTerm);
    const matchesDepartment = selectedDepartment === "all" || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.cnic || !newEmployee.department || 
        !newEmployee.basicSalary || !newEmployee.workingDays) {
      return;
    }

    const basicSalary = parseFloat(newEmployee.basicSalary);
    const workingDays = parseInt(newEmployee.workingDays);
    
    const employee: Employee = {
      id: (employees.length + 1).toString(),
      name: newEmployee.name,
      cnic: newEmployee.cnic,
      department: newEmployee.department,
      basicSalary,
      workingDays,
      calculatedSalary: basicSalary * workingDays,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setEmployees([...employees, employee]);
    setNewEmployee({
      name: "",
      cnic: "",
      department: "",
      basicSalary: "",
      workingDays: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your workforce and employee details</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <Label htmlFor="cnic">CNIC</Label>
                <Input
                  id="cnic"
                  value={newEmployee.cnic}
                  onChange={(e) => setNewEmployee({ ...newEmployee, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="basicSalary">Basic Salary (PKR)</Label>
                <Input
                  id="basicSalary"
                  type="number"
                  value={newEmployee.basicSalary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, basicSalary: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="workingDays">Working Days</Label>
                <Input
                  id="workingDays"
                  type="number"
                  value={newEmployee.workingDays}
                  onChange={(e) => setNewEmployee({ ...newEmployee, workingDays: e.target.value })}
                  placeholder="26"
                />
              </div>
              <Button onClick={handleAddEmployee} className="w-full">
                Add Employee
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search employees by name or CNIC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
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
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Employee List ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell className="font-medium text-success">
                    PKR {employee.calculatedSalary?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;