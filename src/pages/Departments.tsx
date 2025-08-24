import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, DollarSign, Edit, Trash2 } from "lucide-react";
import { mockDepartments } from "@/utils/mockData";
import { Department } from "@/types/employee";

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });

  const handleAddDepartment = () => {
    if (!newDepartment.name) return;

    const department: Department = {
      id: (departments.length + 1).toString(),
      name: newDepartment.name,
      description: newDepartment.description,
      employeeCount: 0,
      totalSalary: 0,
      createdAt: new Date(),
    };

    setDepartments([...departments, department]);
    setNewDepartment({ name: "", description: "" });
    setIsAddDialogOpen(false);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(dept => dept.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Organize your workforce into departments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddDepartment} className="w-full">
                Add Department
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className="shadow-soft hover:shadow-medium transition-all duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{department.name}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteDepartment(department.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              {department.description && (
                <p className="text-sm text-muted-foreground">{department.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Employees</span>
                  </div>
                  <span className="font-semibold">{department.employeeCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Total Payroll</span>
                  </div>
                  <span className="font-semibold text-success">
                    PKR {department.totalSalary.toLocaleString()}
                  </span>
                </div>
                
                <Button variant="outline" className="w-full">
                  View Employees
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              <p className="text-sm text-muted-foreground">Total Departments</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">
                {departments.reduce((sum, dept) => sum + dept.employeeCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">
                PKR {departments.reduce((sum, dept) => sum + dept.totalSalary, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Departments;