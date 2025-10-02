import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { Employee } from "@/types/employee";
import { generateAttendancePDF } from "@/utils/attendancePDFGenerator";
import { format } from "date-fns";
import { Calendar, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
  employeeId: string;
  employeeName: string;
  category: string;
  dailyAttendance: { [day: number]: 'P' | 'A' };
  totalDays: number;
}

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchEmployees();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('name')
        .order('name');

      if (error) throw error;
      setDepartments(data.map(d => d.name));
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch departments",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', selectedDepartment)
        .order('name');

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
      initializeAttendanceRecords(transformedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    }
  };

  const initializeAttendanceRecords = (employeeList: Employee[]) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const records: AttendanceRecord[] = employeeList.map(emp => {
      const dailyAttendance: { [day: number]: 'P' | 'A' } = {};
      let presentDays = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        // Check if the day is a weekend (Saturday = 6, Sunday = 0)
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Default weekends to Absent, other days to Present
        dailyAttendance[day] = isWeekend ? 'A' : 'P';
        if (!isWeekend) presentDays++;
      }
      
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        category: emp.category,
        dailyAttendance,
        totalDays: presentDays,
      };
    });

    setAttendanceRecords(records);
  };

  const updateAttendance = (employeeId: string, day: number, status: 'P' | 'A') => {
    setAttendanceRecords(prev => prev.map(record => {
      if (record.employeeId === employeeId) {
        const newDailyAttendance = { ...record.dailyAttendance, [day]: status };
        const totalDays = Object.values(newDailyAttendance).filter(s => s === 'P').length;
        return {
          ...record,
          dailyAttendance: newDailyAttendance,
          totalDays
        };
      }
      return record;
    }));
  };

  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getTotalWorkingDays = () => {
    return attendanceRecords.reduce((total, record) => total + record.totalDays, 0);
  };

  const handlePreview = () => {
    if (!selectedDepartment || attendanceRecords.length === 0) {
      toast({
        title: "Warning",
        description: "Please select a department and ensure there are employees",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a toast. In a real implementation, you might open a modal
    toast({
      title: "Preview",
      description: `Attendance sheet for ${selectedDepartment} - ${format(selectedDate, 'MMMM yyyy')}`,
    });
  };

  const handleExportPDF = () => {
    if (!selectedDepartment || attendanceRecords.length === 0) {
      toast({
        title: "Warning",
        description: "Please select a department and ensure there are employees",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      generateAttendancePDF(
        attendanceRecords,
        selectedDepartment,
        format(selectedDate, 'MMMM yyyy'),
        getDaysInMonth()
      );
      toast({
        title: "Success",
        description: "Attendance PDF exported successfully",
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

  const daysInMonth = getDaysInMonth();

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            TAHIRA CONSTRUCTION & SERVICES - Process & Inspection Loadi
          </CardTitle>
          <div className="text-xl font-semibold text-center mt-2">
            Attendance Sheet: {format(selectedDate, 'MMM - yyyy')}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Month</label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    if (selectedDepartment) {
                      // Re-initialize attendance when month changes
                      setTimeout(() => initializeAttendanceRecords(employees), 100);
                    }
                  }
                }}
                placeholder="Select month"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button onClick={handlePreview} variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={handleExportPDF} disabled={isLoading} size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          {selectedDepartment && attendanceRecords.length > 0 && (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="border-r px-2 py-2 text-center">S.NO</th>
                    <th className="border-r px-4 py-2 text-center">NAME</th>
                    <th className="border-r px-3 py-2 text-center">CATEGORY</th>
                    <th className="border-r px-6 py-2 text-center">DAYS</th>
                    <th className="px-3 py-2 text-center">TOTAL</th>
                  </tr>
                  <tr className="bg-gray-50">
                    <th className="border-r"></th>
                    <th className="border-r"></th>
                    <th className="border-r"></th>
                    <th className="border-r px-1">
                      <div className="flex">
                        {Array.from({ length: daysInMonth }, (_, i) => (
                          <div key={i + 1} className="w-6 text-center text-xs border-r border-gray-300">
                            {i + 1}
                          </div>
                        ))}
                      </div>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={record.employeeId} className="border-b hover:bg-gray-50">
                      <td className="border-r px-2 py-2 text-center">{index + 1}</td>
                      <td className="border-r px-4 py-2">{record.employeeName}</td>
                      <td className="border-r px-3 py-2 text-center">{record.category}</td>
                      <td className="border-r px-1">
                        <div className="flex">
                          {Array.from({ length: daysInMonth }, (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => updateAttendance(
                                record.employeeId,
                                i + 1,
                                record.dailyAttendance[i + 1] === 'P' ? 'A' : 'P'
                              )}
                              className={`w-6 h-8 text-xs border-r border-gray-300 hover:bg-blue-100 ${
                                record.dailyAttendance[i + 1] === 'A' ? 'text-red-600 font-bold' : 'text-black'
                              }`}
                            >
                              {record.dailyAttendance[i + 1]}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center font-semibold">{record.totalDays}</td>
                    </tr>
                  ))}
                  <tr className="bg-yellow-100 font-bold">
                    <td colSpan={4} className="px-4 py-3 text-right">Total Days</td>
                    <td className="px-3 py-3 text-center">{getTotalWorkingDays()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedDepartment && attendanceRecords.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No employees found in the selected department.
            </div>
          )}

          {!selectedDepartment && (
            <div className="text-center py-8 text-muted-foreground">
              Please select a department to view attendance.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;