import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Printer, FileText, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

const ProjectInvoice = () => {
  const [projectType, setProjectType] = useState("weed-grass-cutting");
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "TCS-001",
    date: new Date(),
    contractNumber: "CON001/25",
    ntn: "5194834-7",
    kpkGST: "K-5194834-7",
    month: new Date(),
    department: "Environmental Services"
  });

  const [round, setRound] = useState("Round-1");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "CUTTING WILD GRASS AND WEED REMOVAL AT KARAK BLOCK LOCATIONS FOR 3 YEARS: Makori West-1 Well Site 2. Makori East-2 Well Site 3. Makori East-3 Well Site 4. Manzalia -5 Well Site 5. Makori East-5 Well Site 6. Makori East-6 Well Site 7. Makori East-VA 8. Makori-3 Well Site 9. Makori Deep-1 Well Site 10. Makori Deep-2 Well Site 11. Makori Deep-1 VA (Tie Point) 12. Makori Deep-2 VA (Tie Point)",
      quantity: 12,
      rate: 47000,
      amount: 564000
    }
  ]);
  
  const [localManagement, setLocalManagement] = useState({ quantity: 12, rate: 13000, amount: 156000 });
  const [gstRate, setGstRate] = useState(15);
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotal = lineItemsTotal + localManagement.amount;
  const gstAmount = (subTotal * gstRate) / 100;
  const totalAmount = subTotal + gstAmount;

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

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Auto-calculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Project Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .invoice-header { text-align: center; margin-bottom: 30px; background-color: #87CEEB; padding: 20px; color: white; }
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
                .footer { background-color: #87CEEB; padding: 10px; color: white; display: flex; justify-content: space-between; margin-top: 30px; }
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
          month: format(invoiceData.month, 'MMMM'),
          year: invoiceData.month.getFullYear(),
          contract_number: invoiceData.contractNumber,
          service_description: `${projectType} - ${round}`,
          sub_total: subTotal,
          service_fee: localManagement.amount,
          gst_rate: gstRate,
          gst_amount: gstAmount,
          total_amount: totalAmount
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Invoice Generator</h1>
          <p className="text-muted-foreground mt-1">Generate invoices for different project types</p>
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
          <CardTitle>Invoice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Project Type Selection */}
          <div>
            <Label htmlFor="projectType">Project Type</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weed-grass-cutting">Weed and Grass Cutting</SelectItem>
                <SelectItem value="construction">Construction Services</SelectItem>
                <SelectItem value="maintenance">Maintenance Services</SelectItem>
                <SelectItem value="cleaning">Cleaning Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Round Selection */}
          <div>
            <Label htmlFor="round">Round</Label>
            <Select value={round} onValueChange={setRound}>
              <SelectTrigger>
                <SelectValue placeholder="Select round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Round-1">Round-1</SelectItem>
                <SelectItem value="Round-2">Round-2</SelectItem>
                <SelectItem value="Round-3">Round-3</SelectItem>
                <SelectItem value="Round-4">Round-4</SelectItem>
                <SelectItem value="Round-5">Round-5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Basic Invoice Details */}
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
              <DatePicker
                value={invoiceData.date}
                onChange={(date) => setInvoiceData({...invoiceData, date: date || new Date()})}
                placeholder="Select date"
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
              <DatePicker
                value={invoiceData.month}
                onChange={(date) => setInvoiceData({...invoiceData, month: date || new Date()})}
                placeholder="Select month"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={invoiceData.department}
                onChange={(e) => setInvoiceData({...invoiceData, department: e.target.value})}
              />
            </div>
          </div>

          {/* Local Management */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="localMgmtQty">Local Management Quantity</Label>
              <Input
                id="localMgmtQty"
                type="number"
                value={localManagement.quantity}
                onChange={(e) => setLocalManagement(prev => ({
                  ...prev,
                  quantity: Number(e.target.value),
                  amount: Number(e.target.value) * prev.rate
                }))}
              />
            </div>
            <div>
              <Label htmlFor="localMgmtRate">Local Management Rate (PKR)</Label>
              <Input
                id="localMgmtRate"
                type="number"
                value={localManagement.rate}
                onChange={(e) => setLocalManagement(prev => ({
                  ...prev,
                  rate: Number(e.target.value),
                  amount: prev.quantity * Number(e.target.value)
                }))}
              />
            </div>
            <div>
              <Label htmlFor="localMgmtAmount">Local Management Amount (PKR)</Label>
              <Input
                id="localMgmtAmount"
                value={localManagement.amount.toLocaleString()}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Line Items</CardTitle>
            <Button onClick={addLineItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label>Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Enter description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Rate (PKR)</Label>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateLineItem(item.id, 'rate', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-3">
                  <Label>Amount (PKR)</Label>
                  <Input
                    value={item.amount.toLocaleString()}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview */}
      <Card className="shadow-soft">
        <CardContent className="p-8">
          <div ref={printRef}>
            {/* Header */}
            <div className="mb-6 bg-sky-200 p-6 text-center">
              <h1 className="text-2xl font-bold text-primary">Tahira Construction & Services</h1>
              <p className="text-lg font-semibold mt-2">Invoice #{invoiceData.invoiceNumber}</p>
              <p className="text-sm">{projectType.replace('-', ' ').toUpperCase()} - {round}</p>
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
                  <p><span className="font-medium">Date:</span> {format(invoiceData.date, 'dd-MM-yyyy')}</p>
                  <p><span className="font-medium">Contract #:</span> {invoiceData.contractNumber}</p>
                  <p><span className="font-medium">NTN #:</span> {invoiceData.ntn}</p>
                  <p><span className="font-medium">KPK GST #:</span> {invoiceData.kpkGST}</p>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">Service Period:</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Invoice For Month:</span> {format(invoiceData.month, 'MMMM yyyy')}</p>
                  <p><span className="font-medium">Department:</span> {invoiceData.department}</p>
                  <p><span className="font-medium">Round:</span> {round}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Rate (PKR)</TableHead>
                  <TableHead className="text-right">Amount (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.rate.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Local Management</TableCell>
                  <TableCell className="text-right">{localManagement.quantity}</TableCell>
                  <TableCell className="text-right">{localManagement.rate.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{localManagement.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">Sub Total</TableCell>
                  <TableCell className="text-right font-medium">
                    {subTotal.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="font-medium">KPK GST @{gstRate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {gstAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-gray-100">
                  <TableCell colSpan={3} className="font-bold text-lg">
                    TOTAL AMOUNT (PKR)
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Footer */}
            <div className="mt-6 bg-sky-200 p-4">
              <div className="flex justify-between items-center text-sm">
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
    </div>
  );
};

export default ProjectInvoice;