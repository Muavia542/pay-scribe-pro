import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { FileText, Eye, Edit, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedInvoice {
  id: string;
  invoice_number: string;
  department: string;
  month: string;
  year: number;
  contract_number: string | null;
  service_description: string | null;
  sub_total: number;
  service_fee: number;
  eobi_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
  generated_at: string;
}

const SavedInvoices = () => {
  const [invoices, setInvoices] = useState<SavedInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<SavedInvoice | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SavedInvoice>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch saved invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (invoice: SavedInvoice) => {
    setSelectedInvoice(invoice);
    setEditForm(invoice);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedInvoice || !editForm) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          invoice_number: editForm.invoice_number,
          department: editForm.department,
          month: editForm.month,
          year: editForm.year,
          contract_number: editForm.contract_number,
          service_description: editForm.service_description,
          sub_total: editForm.sub_total,
          service_fee: editForm.service_fee,
          eobi_amount: editForm.eobi_amount,
          gst_rate: editForm.gst_rate,
          gst_amount: editForm.gst_amount,
          total_amount: editForm.total_amount,
        })
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });

      setIsEditDialogOpen(false);
      fetchInvoices();
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (invoiceId: string) => {
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

      fetchInvoices();
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (invoice: SavedInvoice) => {
    const isRecent = new Date(invoice.generated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return (
      <Badge variant={isRecent ? "default" : "secondary"}>
        {isRecent ? "Recent" : "Archived"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Saved Invoices</h1>
          <p className="text-muted-foreground mt-1">Manage your saved invoices with full CRUD operations</p>
        </div>
        <Button onClick={fetchInvoices}>
          <Plus className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Invoices Table */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Saved Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No saved invoices found</p>
              <p className="text-sm text-muted-foreground">Generated invoices will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.department}</TableCell>
                    <TableCell>{invoice.month} {invoice.year}</TableCell>
                    <TableCell className="font-bold text-success">
                      PKR {invoice.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice)}</TableCell>
                    <TableCell>{new Date(invoice.generated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Invoice Details - {invoice.invoice_number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                                  <p className="font-medium">{invoice.department}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Period</p>
                                  <p className="font-medium">{invoice.month} {invoice.year}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Contract Number</p>
                                  <p className="font-medium">{invoice.contract_number || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Service Fee</p>
                                  <p className="font-medium">PKR {invoice.service_fee.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Sub Total</p>
                                  <p className="font-medium">PKR {invoice.sub_total.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">EOBI Amount</p>
                                  <p className="font-medium">PKR {invoice.eobi_amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">GST Rate</p>
                                  <p className="font-medium">{invoice.gst_rate}%</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">GST Amount</p>
                                  <p className="font-medium">PKR {invoice.gst_amount.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <p className="text-lg font-bold">Total Amount</p>
                                  <p className="text-lg font-bold text-success">PKR {invoice.total_amount.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="outline" size="sm" onClick={() => handleEdit(invoice)}>
                          <Edit className="w-4 h-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(invoice.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice - {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-invoice-number">Invoice Number</Label>
                <Input
                  id="edit-invoice-number"
                  value={editForm.invoice_number || ''}
                  onChange={(e) => setEditForm({ ...editForm, invoice_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={editForm.department || ''}
                  onValueChange={(value) => setEditForm({ ...editForm, department: value })}
                >
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
              <div>
                <Label htmlFor="edit-month">Month</Label>
                <Input
                  id="edit-month"
                  value={editForm.month || ''}
                  onChange={(e) => setEditForm({ ...editForm, month: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editForm.year || ''}
                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-service-fee">Service Fee</Label>
                <Input
                  id="edit-service-fee"
                  type="number"
                  value={editForm.service_fee || ''}
                  onChange={(e) => setEditForm({ ...editForm, service_fee: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contract">Contract Number</Label>
                <Input
                  id="edit-contract"
                  value={editForm.contract_number || ''}
                  onChange={(e) => setEditForm({ ...editForm, contract_number: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-service-desc">Service Description</Label>
              <Input
                id="edit-service-desc"
                value={editForm.service_description || ''}
                onChange={(e) => setEditForm({ ...editForm, service_description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update Invoice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedInvoices;