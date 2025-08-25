import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    cnic: "",
    department: "",
    category: "Skilled" as "Skilled" | "Unskilled",
    basicSalary: "",
    workingDays: "26"
  });
  const { toast } = useToast();

  // Fetch employees from database
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedEmployees: Employee[] = data.map(emp => ({
        id: emp.id,
        name: emp.name,
        cnic: emp.cnic,
        department: emp.department,
        category: emp.category as 'Skilled' | 'Unskilled',
        basicSalary: Number(emp.basic_salary),
        workingDays: emp.working_days,
        calculatedSalary: Number(emp.calculated_salary),
        createdAt: new Date(emp.created_at),
        updatedAt: new Date(emp.updated_at)
      }));

      setEmployees(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search term and selected department
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.cnic.includes(searchTerm);
    const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.cnic || !newEmployee.department || !newEmployee.basicSalary) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const basicSalary = parseFloat(newEmployee.basicSalary);
    const workingDays = parseInt(newEmployee.workingDays);
    
    if (isNaN(basicSalary) || basicSalary <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid basic salary",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(workingDays) || workingDays <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid working days",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          name: newEmployee.name,
          cnic: newEmployee.cnic,
          department: newEmployee.department,
          category: newEmployee.category,
          basic_salary: basicSalary,
          working_days: workingDays
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee added successfully",
      });

      setNewEmployee({
        name: "",
        cnic: "",
        department: "",
        category: "Skilled",
        basicSalary: "",
        workingDays: "26"
      });
      setIsAddDialogOpen(false);
      fetchEmployees(); // Refresh the list

    } catch (error: any) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      fetchEmployees(); // Refresh the list

    } catch (error: any) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
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
                <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOD">SOD</SelectItem>
                    <SelectItem value="BS">BS</SelectItem>
                    <SelectItem value="Production Area-1">Production Area-1</SelectItem>
                    <SelectItem value="Production Area-2">Production Area-2</SelectItem>
                    <SelectItem value="Production Process">Production Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newEmployee.category} onValueChange={(value) => setNewEmployee({ ...newEmployee, category: value as "Skilled" | "Unskilled" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Skilled">Skilled</SelectItem>
                    <SelectItem value="Unskilled">Unskilled</SelectItem>
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
                  placeholder="36000"
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
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="SOD">SOD</SelectItem>
                <SelectItem value="BS">BS</SelectItem>
                <SelectItem value="Production Area-1">Production Area-1</SelectItem>
                <SelectItem value="Production Area-2">Production Area-2</SelectItem>
                <SelectItem value="Production Process">Production Process</SelectItem>
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
                <TableHead>Category</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Working Days</TableHead>
                <TableHead>Total Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.cnic}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.category}</TableCell>
                    <TableCell>{employee.basicSalary.toLocaleString()}</TableCell>
                    <TableCell>{employee.workingDays}</TableCell>
                    <TableCell>{employee.calculatedSalary?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;