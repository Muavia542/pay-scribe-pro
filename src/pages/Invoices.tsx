import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Eye } from "lucide-react";
import { mockDepartments, mockEmployees } from "@/utils/mockData";

const Invoices = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("february-2024");

  // Mock invoice data
  const mockInvoices = [
    {
      id: "INV-001",
      department: "Construction",
      month: "February 2024",
      totalAmount: 1350000,
      employeeCount: 2,
      status: "Generated",
      generatedAt: new Date("2024-02-28"),
    },
    {
      id: "INV-002",
      department: "Administration",
      month: "February 2024",
      totalAmount: 770000,
      employeeCount: 1,
      status: "Generated",
      generatedAt: new Date("2024-02-28"),
    },
    {
      id: "INV-003",
      department: "Security",
      month: "January 2024",
      totalAmount: 660000,
      employeeCount: 1,
      status: "Paid",
      generatedAt: new Date("2024-01-31"),
    },
  ];

  const generateInvoice = () => {
    if (!selectedDepartment) return;
    console.log(`Generating invoice for ${selectedDepartment} - ${selectedMonth}`);
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

      {/* Invoice Type Selection */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Select Invoice Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-colors"
                  onClick={() => window.open('/project-invoice', '_blank')}>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Project Invoice</h3>
                <p className="text-sm text-muted-foreground">Generate invoices for specific projects like Weed & Grass Cutting</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-colors"
                  onClick={() => window.open('/kpk-invoice', '_blank')}>
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="font-semibold mb-2">KPK Invoice</h3>
                <p className="text-sm text-muted-foreground">Generate KPK department invoices with standard calculations</p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-muted hover:border-primary cursor-pointer transition-colors">
              <CardContent className="p-6 text-center">
                <FileText className="w-12 h-12 text-warning mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Custom Invoice</h3>
                <p className="text-sm text-muted-foreground">Create custom invoices with flexible line items</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Traditional Generate Invoice */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Department Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Department</label>
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
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="march-2024">March 2024</SelectItem>
                  <SelectItem value="february-2024">February 2024</SelectItem>
                  <SelectItem value="january-2024">January 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateInvoice} disabled={!selectedDepartment}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
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
                <p className="text-sm text-muted-foreground">Invoice ID: INV-004</p>
                <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Department: {selectedDepartment || "Select Department"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">Employees: {selectedDepartment ? mockEmployees.filter(emp => emp.department === selectedDepartment).length : 0}</p>
                <p className="text-sm text-muted-foreground">
                  Total: PKR {selectedDepartment ? 
                    mockEmployees
                      .filter(emp => emp.department === selectedDepartment)
                      .reduce((sum, emp) => sum + (emp.calculatedSalary || 0), 0)
                      .toLocaleString() 
                    : "0"}
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

export default Invoices;