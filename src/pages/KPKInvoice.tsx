import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer, FileText, Eye, Trash2 } from "lucide-react";
import { roundInvoiceAmount } from "@/utils/pdfGenerator";
// Removed missing logo import; using public asset path

const KPKInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "TCS-335",
    date: "13-08-2025",
    contractNumber: "CON1467/25",
    ntn: "5194834-7",
    kpkGST: "K-5194834-7",
    month: "July 2025",
    service: "Provision of Support Services at Loading Operation-1",
    department: "BS"
  });

  // New input fields as requested
  const [serviceFee, setServiceFee] = useState(139840);
  const [skilledAttendance, setSkilledAttendance] = useState(0);
  const [unskilledAttendance, setUnskilledAttendance] = useState(286);
  const [pob, setPob] = useState(13);

  const [gstRate, setGstRate] = useState(15);
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate line items based on inputs
  const lineItems = [
    ...(skilledAttendance > 0 ? [{
      description: "Skilled Labors",
      rate: 2624.00,
      attendance: skilledAttendance,
      pob: null,
      amount: 2624.00 * skilledAttendance
    }] : []),
    ...(unskilledAttendance > 0 ? [{
      description: "Unskilled Labors", 
      rate: 1636.36,
      attendance: unskilledAttendance,
      pob: null,
      amount: 1636.36 * unskilledAttendance
    }] : []),
    {
      description: "Service Fee",
      rate: null,
      attendance: null,
      pob: null,
      amount: serviceFee
    }
  ];

  const eobi = {
    rate: 2220,
    pob: pob,
    amount: Math.round((pob / 22) * 2220.00)
  };

  // Calculate totals with custom rounding
  const subTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const totalWithEobi = subTotal + eobi.amount;
  const gstAmount = (subTotal * gstRate) / 100; // GST based on Sub Total only
  const finalTotal = roundInvoiceAmount(totalWithEobi + gstAmount); // Apply custom rounding

  // Fetch saved invoices
  useEffect(() => {
    fetchSavedInvoices();
  }, []);

  const fetchSavedInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setSavedInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>KPK Sales Tax Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; }
                .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                .company-info { margin-bottom: 20px; }
                .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                .bill-to { margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .amount { text-align: right; }
                .total-row { font-weight: bold; }
                .final-total { font-size: 18px; font-weight: bold; background-color: #f0f0f0; }
                 @media print {
                   body { margin: 0; }
                   .no-print { display: none; }
                   @page { size: A4; margin: 0.5in; }
                 }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const saveInvoice = async () => {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceData.invoiceNumber,
          department: invoiceData.department,
          month: invoiceData.month.split(' ')[0],
          year: parseInt(invoiceData.month.split(' ')[1]),
          contract_number: invoiceData.contractNumber,
          service_description: invoiceData.service,
          sub_total: subTotal,
          service_fee: serviceFee,
          eobi_amount: eobi.amount,
          gst_rate: gstRate,
          gst_amount: gstAmount,
          total_amount: finalTotal
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });

      // Refresh the saved invoices list
      fetchSavedInvoices();

    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save invoice",
        variant: "destructive",
      });
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      fetchSavedInvoices();
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Generate Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate professional sales tax invoices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={saveInvoice}>
            <FileText className="w-4 h-4 mr-2" />
            Save Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Form */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                value={invoiceData.date}
                onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="contractNumber">Contract Number</Label>
              <Input
                id="contractNumber"
                value={invoiceData.contractNumber}
                onChange={(e) => setInvoiceData({...invoiceData, contractNumber: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="month">Invoice For Month</Label>
              <Input
                id="month"
                value={invoiceData.month}
                onChange={(e) => setInvoiceData({...invoiceData, month: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={invoiceData.department} onValueChange={(value) => setInvoiceData({...invoiceData, department: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOD">SOD</SelectItem>
                  <SelectItem value="BS">BS</SelectItem>
                  <SelectItem value="Production Area-1">Production Area-1</SelectItem>
                  <SelectItem value="Production Area-2">Production Area-2</SelectItem>
                  <SelectItem value="Process & Inspection">Process & Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* New Input Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceFee">Service Fee (PKR)</Label>
              <Input
                id="serviceFee"
                type="number"
                value={serviceFee}
                onChange={(e) => setServiceFee(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="pob">POB (Number of Employees)</Label>
              <Input
                id="pob"
                type="number"
                value={pob}
                onChange={(e) => setPob(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="skilledAttendance">Skilled Labors Attendance</Label>
              <Input
                id="skilledAttendance"
                type="number"
                value={skilledAttendance}
                onChange={(e) => setSkilledAttendance(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="unskilledAttendance">Unskilled Labors Attendance</Label>
              <Input
                id="unskilledAttendance"
                type="number"
                value={unskilledAttendance}
                onChange={(e) => setUnskilledAttendance(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service">Service Description</Label>
            <Input
              id="service"
              value={invoiceData.service}
              onChange={(e) => setInvoiceData({...invoiceData, service: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      <Card className="shadow-soft">
        <CardContent className="p-8">
          <div ref={printRef}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src="/lovable-uploads/3ad6dd25-3db5-4d04-bb8a-fed3dd000209.png" alt="Company logo" className="w-16 h-16 object-contain" loading="eager" />
                <div>
                  <p className="text-lg font-semibold">Invoice #{invoiceData.invoiceNumber}</p>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Bill To:</h3>
              <div className="text-sm">
                <p className="font-semibold">Chief Finance Officer</p>
                <p>Mol Pakistan Oil & Gas Co. B.V.</p>
                <p>Islamabad Stock Exchange Towers, Floor No. 18,</p>
                <p>55-Jinnah Avenue, Islamabad, Pakistan 4400.</p>
                <p>NTN # 1938929-9</p>
                <p>STRN: 701270001264</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="font-bold mb-2">Invoice Details:</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Date:</span> {invoiceData.date}</p>
                  <p><span className="font-medium">Contract #:</span> {invoiceData.contractNumber}</p>
                  <p><span className="font-medium">NTN #:</span> {invoiceData.ntn}</p>
                  <p><span className="font-medium">KPK GST #:</span> {invoiceData.kpkGST}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Service Period:</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Invoice For Month:</span> {invoiceData.month}</p>
                  <p><span className="font-medium">Service:</span> {invoiceData.service}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableHead>Description/Location</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Attendance</TableHead>
                  <TableHead className="text-right">POB</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.rate ? item.rate.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.attendance ? item.attendance.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.pob ? item.pob.toLocaleString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="font-medium">Sub Total</TableCell>
                  <TableCell className="text-right font-medium">
                    {subTotal.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>EOBI</TableCell>
                  <TableCell className="text-right">{eobi.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{eobi.pob}</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">{eobi.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="font-bold">Total Sum</TableCell>
                  <TableCell className="text-right font-bold">
                    {totalWithEobi.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={4} className="font-medium">Add KPK GST @{gstRate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={4} className="font-bold text-lg">
                    TOTAL AMOUNT (PKR)
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {finalTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Footer */}
            <div className="mt-6 text-sm text-gray-600 border-t pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Address: </span>
                  <span>VPO Makori Tehsil Banda Daud Shah District Karak</span>
                </div>
                <div>
                  <span className="font-medium">Email: </span>
                  <span>mshamidkhattak@gmail.com</span>
                </div>
                <div>
                  <span className="font-medium">Contact No: </span>
                  <span>03155157591</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Saved Invoices Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Saved Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {savedInvoices.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No invoices saved yet</p>
          ) : (
            <div className="space-y-2">
              {savedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{invoice.invoice_number}</h3>
                    <p className="text-sm text-muted-foreground">
                      {invoice.department} • {invoice.month} {invoice.year} • PKR {invoice.total_amount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {new Date(invoice.generated_at).toLocaleDateString()}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteInvoice(invoice.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KPKInvoice;