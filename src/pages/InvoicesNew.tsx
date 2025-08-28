import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Eye, Calculator } from "lucide-react";
import { mockDepartments } from "@/utils/mockData";
import { invoiceCalculations } from "@/utils/salaryCalculations";
import { format } from "date-fns";

const InvoicesNew = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [serviceFee, setServiceFee] = useState(0);
  const [skilledAttendance, setSkilledAttendance] = useState(0);
  const [unskilledAttendance, setUnskilledAttendance] = useState(0);
  const [pob, setPob] = useState(0);

  // Mock invoice data
  const mockInvoices = [
    {
      id: "INV-001",
      department: "SOD",
      month: "February 2024",
      totalAmount: 1350000,
      employeeCount: 2,
      status: "Generated",
      generatedAt: new Date("2024-02-28"),
    },
    {
      id: "INV-002",
      department: "BS",
      month: "February 2024",
      totalAmount: 770000,
      employeeCount: 1,
      status: "Generated",
      generatedAt: new Date("2024-02-28"),
    },
    {
      id: "INV-003",
      department: "Production Area-1",
      month: "January 2024",
      totalAmount: 660000,
      employeeCount: 1,
      status: "Paid",
      generatedAt: new Date("2024-01-31"),
    },
  ];

  const calculations = invoiceCalculations.calculateInvoiceTotal(serviceFee, skilledAttendance, unskilledAttendance);

  const generateInvoice = () => {
    if (!selectedDepartment || !selectedDate) return;
    console.log(`Generating invoice for ${selectedDepartment} - ${format(selectedDate, "MMMM yyyy")}`);
    console.log("Calculations:", calculations);
  };

  const downloadInvoice = (invoiceId: string) => {
    console.log(`Downloading invoice ${invoiceId}`);
  };

  const viewInvoice = (invoiceId: string) => {
    console.log(`Viewing invoice ${invoiceId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Generated":
        return "bg-primary/10 text-primary";
      case "Paid":
        return "bg-success/10 text-success";
      case "Pending":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground mt-1">Generate and manage department-wise salary invoices</p>
        </div>
      </div>

      {/* Generate Invoice */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Generate New Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
              <Label className="text-sm font-medium mb-2 block">Date</Label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select date"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Service Fee</Label>
              <Input
                type="number"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
                placeholder="Enter service fee"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Skilled Labors Attendance</Label>
              <Input
                type="number"
                value={skilledAttendance}
                onChange={(e) => setSkilledAttendance(Number(e.target.value))}
                placeholder="Enter attendance"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Unskilled Labors Attendance</Label>
              <Input
                type="number"
                value={unskilledAttendance}
                onChange={(e) => setUnskilledAttendance(Number(e.target.value))}
                placeholder="Enter attendance"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">POB</Label>
              <Input
                type="number"
                value={pob}
                onChange={(e) => setPob(Number(e.target.value))}
                placeholder="Enter POB"
              />
            </div>
          </div>

          <Button onClick={generateInvoice} disabled={!selectedDepartment || !selectedDate} className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </CardContent>
      </Card>

      {/* Calculations Preview */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Invoice Calculations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee:</span>
                <span className="font-medium">PKR {serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skilled Labors Amount:</span>
                <span className="font-medium">PKR {calculations.skilledAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unskilled Labors Amount:</span>
                <span className="font-medium">PKR {calculations.unskilledAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Sub Total:</span>
                <span className="font-medium">PKR {calculations.subTotal.toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">EOBI Amount:</span>
                <span className="font-medium">PKR {calculations.eobiAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sum:</span>
                <span className="font-medium">PKR {calculations.totalSum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KPK GST (15%):</span>
                <span className="font-medium">PKR {calculations.gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold text-success">TOTAL AMOUNT (PKR):</span>
                <span className="font-bold text-success text-lg">PKR {calculations.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{mockInvoices.length}</p>
            <p className="text-sm text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-success font-bold">₨</span>
            </div>
            <p className="text-2xl font-bold text-success">
              PKR {mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Total Invoiced</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-primary font-bold">✓</span>
            </div>
            <p className="text-2xl font-bold text-primary">
              {mockInvoices.filter(inv => inv.status === "Generated").length}
            </p>
            <p className="text-sm text-muted-foreground">Generated</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6 text-center">
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-warning font-bold">⏳</span>
            </div>
            <p className="text-2xl font-bold text-warning">
              {mockInvoices.filter(inv => inv.status === "Paid").length}
            </p>
            <p className="text-sm text-muted-foreground">Paid</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Generated Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.department}</TableCell>
                  <TableCell>{invoice.month}</TableCell>
                  <TableCell>{invoice.employeeCount}</TableCell>
                  <TableCell className="font-bold text-success">
                    PKR {invoice.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.generatedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewInvoice(invoice.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice(invoice.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Invoice Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/30 rounded-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">PayScribe Pro</h2>
              <p className="text-muted-foreground">Employee Management System</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Invoice Details</h3>
                <p className="text-sm text-muted-foreground">Invoice ID: INV-NEW</p>
                <p className="text-sm text-muted-foreground">
                  Date: {selectedDate ? format(selectedDate, "PPP") : "Select Date"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Department: {selectedDepartment || "Select Department"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Skilled Attendance: {skilledAttendance}
                </p>
                <p className="text-sm text-muted-foreground">
                  Unskilled Attendance: {unskilledAttendance}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: PKR {calculations.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              This is a preview of the invoice that will be generated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesNew;