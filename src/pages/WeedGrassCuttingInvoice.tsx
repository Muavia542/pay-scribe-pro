import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
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

const WeedGrassCuttingInvoice = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "TCS-WGC-001",
    date: new Date(),
    contractNumber: "WGC-CON001/25",
    projectTitle: "CUTTING WILD GRASS AND WEED REMOVAL AT KARAK BLOCK LOCATIONS FOR 3 YEARS",
    round: "Round-1"
  });

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
  const [gstRate] = useState(15);
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotal = lineItemsTotal + localManagement.amount;
  const gstAmount = (subTotal * gstRate) / 100;
  const totalAmount = subTotal + gstAmount;

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
              <title>Weed & Grass Cutting Invoice - ${invoiceData.invoiceNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                .invoice-header { text-align: center; margin-bottom: 20px; }
                .invoice-title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                .project-title { font-size: 14px; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                .amount { text-align: right; }
                .total-row { font-weight: bold; }
                .final-total { font-size: 14px; font-weight: bold; }
                @media print {
                  body { margin: 0; }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weed & Grass Cutting Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate invoices for weed and grass cutting projects</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Invoice Configuration */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Invoice Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="round">Round</Label>
              <Select value={invoiceData.round} onValueChange={(value) => setInvoiceData({...invoiceData, round: value})}>
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
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          {/* Local Management Configuration */}
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
            <CardTitle>Project Details</CardTitle>
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
                  <Label>Description/Location</Label>
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
            {/* Invoice Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold">INVOICE FOR {invoiceData.round.toUpperCase()}</h1>
              <h2 className="text-lg font-semibold mt-2">{invoiceData.projectTitle}</h2>
            </div>

            {/* Invoice Table */}
            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  <TableHead className="border border-black">Description/Location</TableHead>
                  <TableHead className="border border-black text-center">Quantity</TableHead>
                  <TableHead className="border border-black text-center">Rate</TableHead>
                  <TableHead className="border border-black text-center">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="border border-black">{item.description}</TableCell>
                    <TableCell className="border border-black text-center">{item.quantity}</TableCell>
                    <TableCell className="border border-black text-center">{item.rate.toLocaleString()}</TableCell>
                    <TableCell className="border border-black text-center">{item.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="border border-black font-semibold">Local Management</TableCell>
                  <TableCell className="border border-black text-center">{localManagement.quantity}</TableCell>
                  <TableCell className="border border-black text-center">{localManagement.rate.toLocaleString()}</TableCell>
                  <TableCell className="border border-black text-center">{localManagement.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold" colSpan={3}>Sub Total</TableCell>
                  <TableCell className="border border-black text-center font-bold">{subTotal.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold" colSpan={3}>Add KPK Gst @{gstRate}%</TableCell>
                  <TableCell className="border border-black text-center font-bold">{gstAmount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold text-lg" colSpan={3}>TOTAL AMOUNT (PKR)</TableCell>
                  <TableCell className="border border-black text-center font-bold text-lg">{totalAmount.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeedGrassCuttingInvoice;