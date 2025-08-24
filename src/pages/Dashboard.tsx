import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building, DollarSign, TrendingUp, Plus, FileText } from "lucide-react";
import { mockEmployees, mockDepartments, calculateTotalSalary } from "@/utils/mockData";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const totalEmployees = mockEmployees.length;
  const totalDepartments = mockDepartments.length;
  const totalMonthlySalary = calculateTotalSalary(mockEmployees);
  const avgSalaryPerEmployee = totalEmployees > 0 ? Math.round(totalMonthlySalary / totalEmployees) : 0;

  const recentEmployees = mockEmployees.slice(-3).reverse();
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to PayScribe Pro - Manage your workforce efficiently
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/employees">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/invoices">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          description="Active workforce"
          icon={<Users size={24} />}
          variant="default"
        />
        <StatCard
          title="Departments"
          value={totalDepartments}
          description="Organizational units"
          icon={<Building size={24} />}
          variant="default"
        />
        <StatCard
          title="Monthly Payroll"
          value={`PKR ${totalMonthlySalary.toLocaleString()}`}
          description="Total salary expense"
          icon={<DollarSign size={24} />}
          variant="success"
        />
        <StatCard
          title="Avg. Salary"
          value={`PKR ${avgSalaryPerEmployee.toLocaleString()}`}
          description="Per employee"
          icon={<TrendingUp size={24} />}
          variant="warning"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              Recent Employees
              <Button variant="outline" size="sm" asChild>
                <Link to="/employees">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">PKR {employee.calculatedSalary?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{employee.workingDays} days</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              Department Overview
              <Button variant="outline" size="sm" asChild>
                <Link to="/departments">Manage</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDepartments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium text-foreground">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">PKR {dept.totalSalary.toLocaleString()}</p>
                    <p className="text-xs text-success">Total payroll</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;