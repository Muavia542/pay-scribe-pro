import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Search, Download, Edit2, ChevronUp, ChevronDown, Settings, ArrowUpDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Employee } from "@/types/employee";
import { generateEmployeesPDF } from "@/utils/pdfGenerator";
import { format } from "date-fns";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'basicSalary' | 'workingDays' | 'calculatedSalary'>('department');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isColumnSelectOpen, setIsColumnSelectOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    name: true,
    department: true,
    workingDays: true,
    totalSalary: true,
    signature: true,
    basicSalary: false,
    category: false,
    cnic: false
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    cnic: "",
    department: "",
    category: "Skilled" as "Skilled" | "Unskilled",
    basicSalary: "",
    workingDays: "26",
    cashPayment: false
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<{
    id: string;
    name: string;
    cnic: string;
    department: string;
    category: "Skilled" | "Unskilled";
    basicSalary: string;
    workingDays: string;
    cashPayment: boolean;
  } | null>(null);
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
        workingDays: Number(emp.working_days),
        calculatedSalary: Number(emp.calculated_salary),
        cashPayment: emp.cash_payment || false,
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

  // Filter and sort employees based on search term, selected department, and sorting preferences
  const filteredEmployees = employees
    .filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           emp.cnic.includes(searchTerm);
      const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
          break;
        case 'department':
          comparison = a.department.toLowerCase().localeCompare(b.department.toLowerCase());
          break;
        case 'basicSalary':
          comparison = (a.basicSalary || 0) - (b.basicSalary || 0);
          break;
        case 'workingDays':
          comparison = (a.workingDays || 0) - (b.workingDays || 0);
          break;
        case 'calculatedSalary':
          comparison = (a.calculatedSalary || 0) - (b.calculatedSalary || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleSort = (field: 'name' | 'department' | 'basicSalary' | 'workingDays' | 'calculatedSalary') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

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
          working_days: workingDays,
          cash_payment: newEmployee.cashPayment
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
        workingDays: "26",
        cashPayment: false
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

  const openEditDialog = (emp: Employee) => {
    setEditEmployee({
      id: emp.id,
      name: emp.name,
      cnic: emp.cnic,
      department: emp.department,
      category: emp.category,
      basicSalary: String(emp.basicSalary),
      workingDays: String(emp.workingDays),
      cashPayment: emp.cashPayment || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editEmployee) return;

    if (!editEmployee.name || !editEmployee.cnic || !editEmployee.department || !editEmployee.basicSalary) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const basicSalary = parseFloat(editEmployee.basicSalary);
    const workingDays = parseInt(editEmployee.workingDays);

    if (isNaN(basicSalary) || basicSalary <= 0) {
      toast({ title: "Error", description: "Please enter a valid basic salary", variant: "destructive" });
      return;
    }
    if (isNaN(workingDays) || workingDays <= 0) {
      toast({ title: "Error", description: "Please enter valid working days", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: editEmployee.name,
          cnic: editEmployee.cnic,
          department: editEmployee.department,
          category: editEmployee.category,
          basic_salary: basicSalary,
          working_days: workingDays,
          cash_payment: editEmployee.cashPayment,
        })
        .eq('id', editEmployee.id);

      if (error) throw error;

      toast({ title: "Success", description: "Employee updated successfully" });
      setIsEditDialogOpen(false);
      setEditEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      console.error('Error updating employee:', error);
      toast({ title: "Error", description: error.message || "Failed to update employee", variant: "destructive" });
    }
  };

  const handleDownloadPDF = () => {
    const month = selectedDate ? format(selectedDate, "MMMM") : "Current";
    const year = selectedDate ? format(selectedDate, "yyyy") : new Date().getFullYear().toString();
    generateEmployeesPDF(filteredEmployees, month, year, selectedColumns, selectedDepartment);
    toast({
      title: "PDF Generated",
      description: "Employee report has been downloaded successfully.",
    });
    setIsColumnSelectOpen(false);
  };

  const handleUpdateWorkingDays = async (id: string, newWorkingDays: number) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ working_days: newWorkingDays })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Working days updated successfully",
      });

      fetchEmployees();
    } catch (error: any) {
      console.error('Error updating working days:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update working days",
        variant: "destructive",
      });
    }
  };

  const handleSortByDepartmentName = () => {
    // This function is called when the sort button is clicked
    // It will sort by department first, then by name within each department
    setSortBy('department');
    setSortOrder('asc');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage your workforce and employee details</p>
        </div>
        <div className="flex gap-3">
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
            setSortBy(field);
            setSortOrder(order);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort employees by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department-asc">Department (A-Z)</SelectItem>
              <SelectItem value="department-desc">Department (Z-A)</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="basicSalary-asc">Basic Salary (Low to High)</SelectItem>
              <SelectItem value="basicSalary-desc">Basic Salary (High to Low)</SelectItem>
              <SelectItem value="workingDays-asc">Working Days (Low to High)</SelectItem>
              <SelectItem value="workingDays-desc">Working Days (High to Low)</SelectItem>
              <SelectItem value="calculatedSalary-asc">Total Salary (Low to High)</SelectItem>
              <SelectItem value="calculatedSalary-desc">Total Salary (High to Low)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2 items-end">
            <div>
              <Label className="text-sm font-medium">Report Month</Label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select month"
                className="w-48"
              />
            </div>
            <Dialog open={isColumnSelectOpen} onOpenChange={setIsColumnSelectOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  <Download className="w-4 h-4 mr-1" />
                  Download PDF
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Columns for PDF Export</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose which columns to include in the PDF:</p>
                  <div className="space-y-3">
                    {Object.entries({
                      name: "Name",
                      department: "Department", 
                      cnic: "CNIC",
                      category: "Category",
                      basicSalary: "Basic Salary",
                      workingDays: "Working Days",
                      totalSalary: "Total Salary",
                      signature: "Signature"
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox 
                          id={key}
                          checked={selectedColumns[key as keyof typeof selectedColumns]}
                          onCheckedChange={(checked) => 
                            setSelectedColumns(prev => ({ ...prev, [key]: checked }))
                          }
                        />
                        <Label htmlFor={key}>{label}</Label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleDownloadPDF} className="w-full">
                    Generate PDF with Selected Columns
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                    <SelectItem value="Process & Inspection">Process & Inspection</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
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
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(newEmployee.workingDays) || 0;
                      if (current > 0) setNewEmployee({ ...newEmployee, workingDays: String(current - 1) });
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Input
                    id="workingDays"
                    type="number"
                    value={newEmployee.workingDays}
                    onChange={(e) => setNewEmployee({ ...newEmployee, workingDays: e.target.value })}
                    placeholder="26"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(newEmployee.workingDays) || 0;
                      setNewEmployee({ ...newEmployee, workingDays: String(current + 1) });
                    }}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="cashPayment"
                  checked={newEmployee.cashPayment}
                  onCheckedChange={(checked) => setNewEmployee({ ...newEmployee, cashPayment: !!checked })}
                />
                <Label htmlFor="cashPayment" className="text-sm font-medium">Cash Payment</Label>
              </div>
              <Button onClick={handleAddEmployee} className="w-full">
                Add Employee
              </Button>
            </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditEmployee(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editEmployee.name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, name: e.target.value })}
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <Label htmlFor="edit-cnic">CNIC</Label>
                <Input
                  id="edit-cnic"
                  value={editEmployee.cnic}
                  onChange={(e) => setEditEmployee({ ...editEmployee, cnic: e.target.value })}
                  placeholder="42101-1234567-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select value={editEmployee.department} onValueChange={(value) => setEditEmployee({ ...editEmployee, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOD">SOD</SelectItem>
                    <SelectItem value="BS">BS</SelectItem>
                    <SelectItem value="Production Area-1">Production Area-1</SelectItem>
                    <SelectItem value="Production Area-2">Production Area-2</SelectItem>
                    <SelectItem value="Process & Inspection">Process & Inspection</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editEmployee.category} onValueChange={(value) => setEditEmployee({ ...editEmployee, category: value as "Skilled" | "Unskilled" })}>
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
                <Label htmlFor="edit-basicSalary">Basic Salary (PKR)</Label>
                <Input
                  id="edit-basicSalary"
                  type="number"
                  value={editEmployee.basicSalary}
                  onChange={(e) => setEditEmployee({ ...editEmployee, basicSalary: e.target.value })}
                  placeholder="36000"
                />
              </div>
              <div>
                <Label htmlFor="edit-workingDays">Working Days</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(editEmployee.workingDays) || 0;
                      if (current > 0) setEditEmployee({ ...editEmployee, workingDays: String(current - 1) });
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Input
                    id="edit-workingDays"
                    type="number"
                    value={editEmployee.workingDays}
                    onChange={(e) => setEditEmployee({ ...editEmployee, workingDays: e.target.value })}
                    placeholder="26"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const current = parseInt(editEmployee.workingDays) || 0;
                      setEditEmployee({ ...editEmployee, workingDays: String(current + 1) });
                    }}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="edit-cashPayment"
                  checked={editEmployee.cashPayment}
                  onCheckedChange={(checked) => setEditEmployee({ ...editEmployee, cashPayment: !!checked })}
                />
                <Label htmlFor="edit-cashPayment" className="text-sm font-medium">Cash Payment</Label>
              </div>
              <Button onClick={handleUpdateEmployee} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                <SelectItem value="Process & Inspection">Process & Inspection</SelectItem>
                <SelectItem value="N/A">N/A</SelectItem>
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
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Name
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('department')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Department
                    {sortBy === 'department' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort('basicSalary')}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    Basic Salary
                    {sortBy === 'basicSalary' && (
                      sortOrder === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" /> : <ChevronDown className="ml-1 w-4 h-4" />
                    )}
                  </Button>
                </TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const current = employee.workingDays || 0;
                            if (current > 0) {
                              handleUpdateWorkingDays(employee.id, current - 1);
                            }
                          }}
                        >
                          -
                        </Button>
                        <span className="min-w-[2rem] text-center font-medium">{employee.workingDays}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const current = employee.workingDays || 0;
                            handleUpdateWorkingDays(employee.id, current + 1);
                          }}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{employee.calculatedSalary?.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(employee)}>Edit</Button>
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