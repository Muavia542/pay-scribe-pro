import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

const ImportData = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    errors?: string[];
  } | null>(null);
  const { toast } = useToast();

  // Sample data format for demonstration
  const sampleData = [
    {
      name: "John Doe",
      cnic: "42101-1234567-1",
      department: "SOD",
      category: "Skilled",
      basicSalary: "36000",
      workingDays: "26"
    },
    {
      name: "Jane Smith",
      cnic: "42101-2345678-2",
      department: "BS",
      category: "Unskilled",
      basicSalary: "35000",
      workingDays: "26"
    },
    {
      name: "Ahmed Ali",
      cnic: "42101-3456789-3",
      department: "Production Area-1",
      category: "Skilled",
      basicSalary: "37000",
      workingDays: "26"
    }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Read the Excel/CSV file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      // Parse headers and data
      const headers = (jsonData[0] as string[]).map(h => h?.toLowerCase().trim());
      const rows = jsonData.slice(1) as string[][];

      // Validate required columns
      const requiredColumns = ['name', 'cnic', 'department', 'category', 'basic salary', 'working days'];
      const missingColumns = requiredColumns.filter(col => 
        !headers.some(h => h.includes(col.toLowerCase()) || col.toLowerCase().includes(h))
      );

      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
      }

      // Map column indices
      const getColumnIndex = (searchTerms: string[]) => {
        return headers.findIndex(h => searchTerms.some(term => h.includes(term.toLowerCase())));
      };

      const nameIndex = getColumnIndex(['name']);
      const cnicIndex = getColumnIndex(['cnic']);
      const departmentIndex = getColumnIndex(['department']);
      const categoryIndex = getColumnIndex(['category']);
      const salaryIndex = getColumnIndex(['salary', 'basic salary']);
      const daysIndex = getColumnIndex(['days', 'working days']);

      // Validate and process data
      const employees = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Excel row number (1-indexed + header)

        try {
          const name = row[nameIndex]?.trim();
          const cnic = row[cnicIndex]?.trim();
          const department = row[departmentIndex]?.trim();
          const category = row[categoryIndex]?.trim();
          const basicSalary = parseFloat(row[salaryIndex]?.toString().replace(/[,$]/g, '') || '0');
          const workingDays = parseInt(row[daysIndex]?.toString() || '26');

          // Validate required fields
          if (!name) throw new Error(`Name is required`);
          if (!cnic) throw new Error(`CNIC is required`);
          if (!department) throw new Error(`Department is required`);
          if (!category || !['Skilled', 'Unskilled'].includes(category)) {
            throw new Error(`Category must be 'Skilled' or 'Unskilled'`);
          }
          if (isNaN(basicSalary) || basicSalary <= 0) {
            throw new Error(`Basic salary must be a positive number`);
          }
          if (isNaN(workingDays) || workingDays <= 0) {
            throw new Error(`Working days must be a positive number`);
          }

          // Validate CNIC format (basic)
          if (!/^\d{5}-\d{7}-\d$/.test(cnic)) {
            throw new Error(`CNIC must be in format: 12345-1234567-1`);
          }

          employees.push({
            name,
            cnic,
            department,
            category: category as 'Skilled' | 'Unskilled',
            basic_salary: basicSalary,
            working_days: workingDays
          });

        } catch (error) {
          errors.push(`Row ${rowNum}: ${error.message}`);
        }
      }

      if (errors.length > 0 && employees.length === 0) {
        throw new Error(`All rows failed validation:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? '\n...and more' : ''}`);
      }

      // Insert valid employees into database
      let insertedCount = 0;
      if (employees.length > 0) {
        const { error: insertError, count } = await supabase
          .from('employees')
          .insert(employees)
          .select('*');

        if (insertError) {
          throw new Error(`Database error: ${insertError.message}`);
        }
        insertedCount = count || 0;
      }

      setUploadResult({
        success: true,
        message: `Successfully imported ${insertedCount} employees`,
        imported: insertedCount,
        errors: errors.length > 0 ? errors : undefined
      });

      toast({
        title: "Import Successful",
        description: `${insertedCount} employees imported successfully`,
      });

    } catch (error) {
      console.error('Import error:', error);
      setUploadResult({
        success: false,
        message: error.message || 'Failed to import file',
        errors: [error.message || 'Unknown error occurred']
      });

      toast({
        title: "Import Failed",
        description: error.message || 'Failed to import file',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear file input
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    // Create template data
    const templateData = [
      ['Name', 'CNIC', 'Department', 'Category', 'Basic Salary', 'Working Days'],
      ['John Doe', '42101-1234567-1', 'SOD', 'Skilled', '36000', '26'],
      ['Jane Smith', '42101-2345678-2', 'BS', 'Unskilled', '35000', '26'],
      ['Ahmed Ali', '42101-3456789-3', 'Production Area-1', 'Skilled', '37000', '26']
    ];

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    
    // Set column widths
    worksheet['!cols'] = [
      { width: 20 }, // Name
      { width: 15 }, // CNIC
      { width: 20 }, // Department
      { width: 12 }, // Category
      { width: 15 }, // Basic Salary
      { width: 15 }  // Working Days
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Template');

    // Download file
    XLSX.writeFile(workbook, 'employee_import_template.xlsx');
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded to your device",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Import Employee Data</h1>
          <p className="text-muted-foreground mt-1">Upload Excel/CSV files to import employee information</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Upload Section */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Employee Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
              <FileSpreadsheet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Choose a file to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports Excel (.xlsx, .xls) and CSV (.csv) files
                </p>
              </div>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </span>
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Upload Status */}
            {isUploading && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Processing file... Please wait.
                </AlertDescription>
              </Alert>
            )}

            {uploadResult && (
              <Alert className={uploadResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  {uploadResult.message}
                  {uploadResult.imported && (
                    <span className="block mt-1">
                      Successfully imported {uploadResult.imported} employee records.
                    </span>
                  )}
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-red-600">Errors found:</p>
                      <ul className="text-sm text-red-600 mt-1">
                        {uploadResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {uploadResult.errors.length > 5 && (
                          <li>• ...and {uploadResult.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Format Requirements */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>File Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Required Columns:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Name:</strong> Employee full name</li>
                <li>• <strong>CNIC:</strong> National identity card number (format: 42101-1234567-1)</li>
                <li>• <strong>Department:</strong> Department name (SOD, BS, Production Area-1, Production Area-2, Process & Inspection)</li>
                <li>• <strong>Category:</strong> Employee category (Skilled or Unskilled)</li>
                <li>• <strong>Basic Salary:</strong> Monthly basic salary amount (numbers only)</li>
                <li>• <strong>Working Days:</strong> Number of working days (numbers only)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">File Requirements:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum file size: 10MB</li>
                <li>• Supported formats: .xlsx, .xls, .csv</li>
                <li>• First row should contain column headers</li>
                <li>• CNIC numbers must be unique</li>
                <li>• Salary values must be positive numbers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Data Format */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Sample Data Format</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>CNIC</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Working Days</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.cnic}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.basicSalary}</TableCell>
                  <TableCell>{row.workingDays}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Import Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Download the template file to ensure proper formatting</p>
            <p>• Departments must be: SOD, BS, Production Area-1, Production Area-2, or Process & Inspection</p>
            <p>• Category must be either 'Skilled' or 'Unskilled' (case sensitive)</p>
            <p>• Verify CNIC numbers are in the correct format: 12345-1234567-1</p>
            <p>• Check that salary and working days are valid numbers</p>
            <p>• Remove any empty rows from your file before uploading</p>
            <p>• If there are errors, the system will show detailed information about which rows failed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportData;