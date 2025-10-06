import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { useToast } from "@/hooks/use-toast";
import { Printer, Plus, Trash2, Edit2, Save, X, Download } from "lucide-react";
import { format } from "date-fns";
import { generateDynamicInvoicePDF } from "@/utils/dynamicInvoicePDFGenerator";

interface DynamicField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'calculated';
  value: string | number;
  options?: string[];
  calculation?: string; // formula for calculated fields
}

interface LineItem {
  id: string;
  fields: { [fieldId: string]: string | number };
}

const DynamicInvoiceGenerator = () => {
  const [contractTypes] = useState([
    "Weed and Grass Cutting",
    "Drain Channel Cleaning", 
    "PPE's Supply",
    "General Construction",
    "Security Services"
  ]);

  const [invoiceDetails, setInvoiceDetails] = useState({
    date: new Date(),
    contractNumber: "CON1467/25",
    ntn: "5194834-7",
    kpkGst: "K-5194834-7",
    month: "October",
    year: "2025",
    service: "Provision of Support Services at Loading Operation-1"
  });

  const [selectedContractType, setSelectedContractType] = useState("");
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([
    { id: "description", label: "Description", type: "text", value: "" },
    { id: "quantity", label: "Quantity", type: "number", value: 1 },
    { id: "rate", label: "Rate (PKR)", type: "number", value: 0 },
    { id: "amount", label: "Amount", type: "calculated", value: 0, calculation: "quantity * rate" }
  ]);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", fields: { description: "", quantity: 1, rate: 0, amount: 0 } }
  ]);

  const [localManagement, setLocalManagement] = useState({ rate: 13000, amount: 0 });
  const [gstRate] = useState(15);
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const presetFieldConfigurations = {
    "Weed and Grass Cutting": [
      { id: "description", label: "Location/Description", type: "text", value: "" },
      { id: "quantity", label: "Quantity", type: "number", value: 1 },
      { id: "rate", label: "Rate (PKR)", type: "number", value: 47000 },
      { id: "amount", label: "Amount", type: "calculated", value: 0, calculation: "quantity * rate" }
    ],
    "Drain Channel Cleaning": [
      { id: "location", label: "Channel Location", type: "text", value: "" },
      { id: "length", label: "Length (meters)", type: "number", value: 0 },
      { id: "rate_per_meter", label: "Rate per Meter", type: "number", value: 500 },
      { id: "total_cost", label: "Total Cost", type: "calculated", value: 0, calculation: "length * rate_per_meter" }
    ],
    "PPE's Supply": [
      { id: "equipment_name", label: "Equipment Name", type: "text", value: "" },
      { id: "quantity", label: "Quantity", type: "number", value: 1 },
      { id: "unit_price", label: "Unit Price", type: "number", value: 0 },
      { id: "total_amount", label: "Total Amount", type: "calculated", value: 0, calculation: "quantity * unit_price" }
    ]
  };

  const handleContractTypeChange = (contractType: string) => {
    setSelectedContractType(contractType);
    const preset = presetFieldConfigurations[contractType as keyof typeof presetFieldConfigurations];
    if (preset) {
      setDynamicFields([...preset] as DynamicField[]);
      setLineItems([{ id: "1", fields: Object.fromEntries(preset.map(field => [field.id, field.value])) }]);
    }
  };

  const addField = () => {
    const newField: DynamicField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      value: ""
    };
    setDynamicFields([...dynamicFields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<DynamicField>) => {
    setDynamicFields(fields => 
      fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (fieldId: string) => {
    setDynamicFields(fields => fields.filter(field => field.id !== fieldId));
    setLineItems(items => 
      items.map(item => {
        const { [fieldId]: removed, ...rest } = item.fields;
        return { ...item, fields: rest };
      })
    );
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      fields: Object.fromEntries(dynamicFields.map(field => [field.id, field.value]))
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (itemId: string, fieldId: string, value: string | number) => {
    setLineItems(items => 
      items.map(item => {
        if (item.id === itemId) {
          const updatedFields = { ...item.fields, [fieldId]: value };
          
          // Calculate any calculated fields
          dynamicFields.forEach(field => {
            if (field.type === 'calculated' && field.calculation) {
              try {
                const calculation = field.calculation.replace(/(\w+)/g, (match) => {
                  return updatedFields[match]?.toString() || '0';
                });
                updatedFields[field.id] = eval(calculation);
              } catch (error) {
                updatedFields[field.id] = 0;
              }
            }
          });
          
          return { ...item, fields: updatedFields };
        }
        return item;
      })
    );
  };

  const removeLineItem = (itemId: string) => {
    setLineItems(items => items.filter(item => item.id !== itemId));
  };

  const calculateTotals = () => {
    const lineItemsTotal = lineItems.reduce((sum, item) => {
      const amountField = dynamicFields.find(f => f.type === 'calculated');
      return sum + (Number(item.fields[amountField?.id || ''] || 0));
    }, 0);
    
    const localMgmtAmount = localManagement.rate * lineItems.length;
    const subTotal = lineItemsTotal + localMgmtAmount;
    const gstAmount = (subTotal * gstRate) / 100;
    const totalAmount = subTotal + gstAmount;

    return { lineItemsTotal, localMgmtAmount, subTotal, gstAmount, totalAmount };
  };

  const { lineItemsTotal, localMgmtAmount, subTotal, gstAmount, totalAmount } = calculateTotals();

  const handleDownloadPDF = () => {
    if (!selectedContractType) {
      toast({
        title: "Error",
        description: "Please select a contract type first",
        variant: "destructive",
      });
      return;
    }

    try {
      generateDynamicInvoicePDF({
        contractType: selectedContractType,
        date: invoiceDetails.date,
        contractNumber: invoiceDetails.contractNumber,
        ntn: invoiceDetails.ntn,
        kpkGst: invoiceDetails.kpkGst,
        month: invoiceDetails.month,
        year: invoiceDetails.year,
        service: invoiceDetails.service,
        dynamicFields: dynamicFields,
        lineItems: lineItems,
        localManagementRate: localManagement.rate,
        gstRate: gstRate
      });

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Dynamic Invoice - ${selectedContractType}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; font-size: 11px; }
                .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                .header h1 { font-size: 18px; font-weight: bold; margin: 5px 0; color: #0066cc; }
                .bill-to { margin: 20px 0; }
                .bill-to p { margin: 2px 0; }
                .invoice-details { display: flex; justify-content: space-between; margin: 20px 0; }
                .invoice-details div { flex: 1; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; font-weight: bold; }
                .amount { text-align: right; }
                .total-row { font-weight: bold; background-color: #f9f9f9; }
                .footer { text-align: center; margin-top: 30px; border-top: 2px solid #000; padding-top: 10px; font-size: 10px; }
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
          <h1 className="text-3xl font-bold text-foreground">Dynamic Invoice Generator</h1>
          <p className="text-muted-foreground mt-1">Create customizable invoices for any contract type</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditingFields(!isEditingFields)}>
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditingFields ? "Done Editing" : "Edit Fields"}
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Contract Type Selection */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Contract Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contractType">Contract Type</Label>
              <Select value={selectedContractType} onValueChange={handleContractTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contract type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="localMgmtRate">Local Management Rate (PKR)</Label>
              <Input
                id="localMgmtRate"
                type="number"
                value={localManagement.rate}
                onChange={(e) => setLocalManagement(prev => ({ ...prev, rate: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contract">Contract #</Label>
              <Input
                id="contract"
                value={invoiceDetails.contractNumber}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, contractNumber: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="ntn">NTN #</Label>
              <Input
                id="ntn"
                value={invoiceDetails.ntn}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, ntn: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="kpkGst">KPK GST #</Label>
              <Input
                id="kpkGst"
                value={invoiceDetails.kpkGst}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, kpkGst: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="month">Invoice For Month</Label>
              <Select value={invoiceDetails.month} onValueChange={(value) => setInvoiceDetails({...invoiceDetails, month: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                value={invoiceDetails.year}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, year: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={invoiceDetails.date}
                onChange={(date) => setInvoiceDetails({...invoiceDetails, date: date || new Date()})}
                placeholder="Select date"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="service">Service Description</Label>
            <Input
              id="service"
              value={invoiceDetails.service}
              onChange={(e) => setInvoiceDetails({...invoiceDetails, service: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Field Configuration */}
      {isEditingFields && (
        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Field Configuration</CardTitle>
              <Button onClick={addField} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dynamicFields.map((field) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                  <div className="col-span-3">
                    <Label>Field Label</Label>
                    {editingFieldId === field.id ? (
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        onBlur={() => setEditingFieldId(null)}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="p-2 border rounded cursor-pointer hover:bg-muted"
                        onClick={() => setEditingFieldId(field.id)}
                      >
                        {field.label}
                      </div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label>Type</Label>
                    <Select 
                      value={field.type} 
                      onValueChange={(value) => updateField(field.id, { type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="select">Select</SelectItem>
                        <SelectItem value="calculated">Calculated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {field.type === 'calculated' && (
                    <div className="col-span-3">
                      <Label>Formula</Label>
                      <Input
                        value={field.calculation || ""}
                        onChange={(e) => updateField(field.id, { calculation: e.target.value })}
                        placeholder="e.g., quantity * rate"
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <Label>Default Value</Label>
                    <Input
                      value={field.value}
                      onChange={(e) => updateField(field.id, { value: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      disabled={dynamicFields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addLineItem} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lineItems.map((item) => (
              <div key={item.id} className="grid gap-4 items-end p-4 border rounded-lg" 
                   style={{ gridTemplateColumns: `repeat(${dynamicFields.length + 1}, 1fr)` }}>
                {dynamicFields.map((field) => (
                  <div key={field.id}>
                    <Label>{field.label}</Label>
                    {field.type === 'calculated' ? (
                      <Input
                        value={Number(item.fields[field.id] || 0).toLocaleString()}
                        readOnly
                        className="bg-muted"
                      />
                    ) : (
                      <Input
                        type={field.type === 'number' ? 'number' : 'text'}
                        value={item.fields[field.id] || ''}
                        onChange={(e) => updateLineItem(item.id, field.id, 
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )}
                      />
                    )}
                  </div>
                ))}
                <div>
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
            <div className="header">
              <h1>TAHIRA CONSTRUCTION & SERVICES</h1>
              <p className="text-xs">VPO Makori Tehsil Banda Daud Shah District Karak</p>
              <p className="text-xs">Email: mshamidkhattak@gmail.com | Contact: 03155157591</p>
            </div>

            {/* Bill To Section */}
            <div className="bill-to">
              <p className="font-bold mb-2">Bill To:</p>
              <p><strong>Chief Finance Officer</strong></p>
              <p>Mol Pakistan Oil & Gas Co. B.V.</p>
              <p>Islamabad Stock Exchange Towers, Floor No. 18,</p>
              <p>55-Jinnah Avenue, Islamabad, Pakistan 4400.</p>
              <p>NTN # 1938929-9</p>
              <p>STRN: 701270001264</p>
            </div>

            {/* Invoice Details */}
            <div className="invoice-details text-sm">
              <div>
                <p><strong>Date:</strong> {format(invoiceDetails.date, "dd-MM-yyyy")}</p>
                <p><strong>Contract #:</strong> {invoiceDetails.contractNumber}</p>
                <p><strong>NTN #:</strong> {invoiceDetails.ntn}</p>
                <p><strong>KPK GST #:</strong> {invoiceDetails.kpkGst}</p>
              </div>
              <div className="text-right">
                <p><strong>Invoice For Month:</strong> {invoiceDetails.month} {invoiceDetails.year}</p>
                <p><strong>Service:</strong> {invoiceDetails.service}</p>
                <p><strong>Contract Type:</strong> {selectedContractType}</p>
              </div>
            </div>

            <Table className="mb-6">
              <TableHeader>
                <TableRow>
                  {dynamicFields.map((field) => (
                    <TableHead key={field.id} className="border border-black text-center">
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((item, index) => (
                  <TableRow key={index}>
                    {dynamicFields.map((field) => (
                      <TableCell key={field.id} className="border border-black text-center">
                        {field.type === 'number' || field.type === 'calculated' 
                          ? Number(item.fields[field.id] || 0).toLocaleString()
                          : item.fields[field.id]
                        }
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="border border-black font-semibold" colSpan={dynamicFields.length - 1}>
                    Local Management
                  </TableCell>
                  <TableCell className="border border-black text-center">
                    {localMgmtAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold" colSpan={dynamicFields.length - 1}>
                    Sub Total
                  </TableCell>
                  <TableCell className="border border-black text-center font-bold">
                    {subTotal.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold" colSpan={dynamicFields.length - 1}>
                    Add KPK Gst @{gstRate}%
                  </TableCell>
                  <TableCell className="border border-black text-center font-bold">
                    {gstAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border border-black font-bold text-lg" colSpan={dynamicFields.length - 1}>
                    TOTAL AMOUNT (PKR)
                  </TableCell>
                  <TableCell className="border border-black text-center font-bold text-lg">
                    {totalAmount.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Footer */}
            <div className="footer">
              <p><strong>TAHIRA CONSTRUCTION & SERVICES</strong></p>
              <p>Address: VPO Makori Tehsil Banda Daud Shah District Karak</p>
              <p>Email: mshamidkhattak@gmail.com | Contact No: 03155157591</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicInvoiceGenerator;