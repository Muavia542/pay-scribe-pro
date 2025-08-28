import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, DollarSign, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types/employee";

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newDepartment, setNewDepartment] = useState({ name: "", description: "" });
  const [editDepartment, setEditDepartment] = useState<{ id: string; name: string; description?: string } | null>(null);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed: Department[] = (data || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description || undefined,
        employeeCount: Number(d.employee_count || 0),
        totalSalary: Number(d.total_salary || 0),
        createdAt: new Date(d.created_at),
      }));

      setDepartments(transformed);
    } catch (err) {
      console.error('Error fetching departments:', err);
      toast({ title: 'Error', description: 'Failed to load departments', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleAddDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast({ title: 'Error', description: 'Department name is required', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('departments').insert({
        name: newDepartment.name.trim(),
        description: newDepartment.description.trim() || null,
      });
      if (error) throw error;
      toast({ title: 'Success', description: 'Department added successfully' });
      setNewDepartment({ name: "", description: "" });
      setIsAddDialogOpen(false);
      fetchDepartments();
    } catch (err: any) {
      console.error('Error adding department:', err);
      toast({ title: 'Error', description: err.message || 'Failed to add department', variant: 'destructive' });
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Department deleted successfully' });
      fetchDepartments();
    } catch (err: any) {
      console.error('Error deleting department:', err);
      toast({ title: 'Error', description: err.message || 'Failed to delete department', variant: 'destructive' });
    }
  };

  const openEditDialog = (dept: Department) => {
    setEditDepartment({ id: dept.id, name: dept.name, description: dept.description });
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editDepartment) return;
    if (!editDepartment.name.trim()) {
      toast({ title: 'Error', description: 'Department name is required', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('departments')
        .update({ name: editDepartment.name.trim(), description: (editDepartment.description || '').trim() || null })
        .eq('id', editDepartment.id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Department updated successfully' });
      setIsEditDialogOpen(false);
      setEditDepartment(null);
      fetchDepartments();
    } catch (err: any) {
      console.error('Error updating department:', err);
      toast({ title: 'Error', description: err.message || 'Failed to update department', variant: 'destructive' });
    }
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
              <Button onClick={handleAddDepartment} className="w-full">Add Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { setIsEditDialogOpen(open); if (!open) setEditDepartment(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          {editDepartment && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Department Name</Label>
                <Input
                  id="edit-name"
                  value={editDepartment.name}
                  onChange={(e) => setEditDepartment({ ...editDepartment, name: e.target.value })}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDepartment.description || ''}
                  onChange={(e) => setEditDepartment({ ...editDepartment, description: e.target.value })}
                  placeholder="Enter department description"
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateDepartment} className="w-full">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card className="shadow-soft"><CardContent className="p-6">Loading departments...</CardContent></Card>
        ) : departments.length === 0 ? (
          <Card className="shadow-soft"><CardContent className="p-6">No departments found</CardContent></Card>
        ) : (
          departments.map((department) => (
            <Card key={department.id} className="shadow-soft hover:shadow-medium transition-all duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>{department.name}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(department)}>
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
          ))
        )}
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
                {departments.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Employees</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">
                PKR {departments.reduce((sum, dept) => sum + (dept.totalSalary || 0), 0).toLocaleString()}
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
