import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";
import { generateYearlyBonusPDF } from "@/utils/yearlyBonusPDFGenerator";
import { Download, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BonusRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  category: string;
  bonusAmount: number;
}

const YearlyBonus = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bonusYear, setBonusYear] = useState<string>(new Date().getFullYear().toString());
  const [bonusRecords, setBonusRecords] = useState<BonusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('department', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      const transformedEmployees: Employee[] = (data || []).map(emp => ({
        id: emp.id,
        name: emp.name,
        cnic: emp.cnic,
        department: emp.department,
        category: emp.category as 'Skilled' | 'Unskilled',
        basicSalary: emp.basic_salary,
        workingDays: emp.working_days,
        calculatedSalary: emp.calculated_salary,
        cashPayment: emp.cash_payment,
        createdAt: new Date(emp.created_at),
        updatedAt: new Date(emp.updated_at)
      }));
      
      setEmployees(transformedEmployees);
      initializeBonusRecords(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  };

  const initializeBonusRecords = (employeeList: Employee[]) => {
    const records: BonusRecord[] = employeeList.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      category: emp.category,
      bonusAmount: 0
    }));
    setBonusRecords(records);
  };

  const updateBonusAmount = (employeeId: string, amount: number) => {
    setBonusRecords(prev => prev.map(record => 
      record.employeeId === employeeId 
        ? { ...record, bonusAmount: amount }
        : record
    ));
  };

  const getTotalBonus = () => {
    return bonusRecords.reduce((total, record) => total + record.bonusAmount, 0);
  };

  const getRecordsWithBonus = () => {
    return bonusRecords.filter(record => record.bonusAmount > 0);
  };

  const handleExportPDF = () => {
    const recordsWithBonus = getRecordsWithBonus();
    
    if (recordsWithBonus.length === 0) {
      toast({
        title: "Warning",
        description: "Please enter bonus amounts for at least one employee",
        variant: "destructive",
      });
      return;
    }

    if (!bonusYear || bonusYear.length !== 4) {
      toast({
        title: "Warning",
        description: "Please enter a valid year (YYYY format)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      generateYearlyBonusPDF(recordsWithBonus, bonusYear);
      toast({
        title: "Success",
        description: "Yearly bonus PDF exported successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Group employees by department
  const employeesByDepartment = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = [];
    }
    acc[emp.department].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Gift className="w-8 h-8" />
            TAHIRA CONSTRUCTION & SERVICES
          </CardTitle>
          <div className="text-xl font-semibold text-center mt-2">
            Yearly Bonus Management
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bonusYear">Bonus Year</Label>
              <Input
                id="bonusYear"
                type="number"
                min="2020"
                max="2030"
                value={bonusYear}
                onChange={(e) => setBonusYear(e.target.value)}
                placeholder="Enter year (YYYY)"
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label>Export Actions</Label>
              <Button 
                onClick={handleExportPDF} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <div className="text-sm text-muted-foreground">Total Employees</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{getRecordsWithBonus().length}</div>
                  <div className="text-sm text-muted-foreground">Employees with Bonus</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">PKR {getTotalBonus().toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Bonus Amount</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Bonus Table */}
          <div className="space-y-6">
            {Object.entries(employeesByDepartment).map(([department, deptEmployees]) => (
              <div key={department}>
                <h3 className="text-lg font-semibold mb-3 text-primary">
                  {department} Department ({deptEmployees.length} employees)
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="border-r px-4 py-3 text-left">S.NO</th>
                        <th className="border-r px-4 py-3 text-left">Employee Name</th>
                        <th className="border-r px-4 py-3 text-center">Category</th>
                        <th className="px-4 py-3 text-center">Bonus Amount (PKR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptEmployees.map((emp, index) => {
                        const bonusRecord = bonusRecords.find(r => r.employeeId === emp.id);
                        return (
                          <tr key={emp.id} className="border-b hover:bg-gray-50">
                            <td className="border-r px-4 py-3">{index + 1}</td>
                            <td className="border-r px-4 py-3 font-medium">{emp.name}</td>
                            <td className="border-r px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                emp.category === 'Skilled' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {emp.category}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min="0"
                                step="100"
                                value={bonusRecord?.bonusAmount || 0}
                                onChange={(e) => updateBonusAmount(emp.id, parseInt(e.target.value) || 0)}
                                placeholder="Enter bonus amount"
                                className="text-center font-semibold"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No employees found. Please add employees first.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlyBonus;