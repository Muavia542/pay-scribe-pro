import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from "lucide-react";

const ImportData = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    imported?: number;
    errors?: string[];
  } | null>(null);

  // Sample data format for demonstration
  const sampleData = [
    {
      name: "John Doe",
      cnic: "42101-1234567-1",
      department: "Construction",
      basicSalary: "25000",
      workingDays: "26"
    },
    {
      name: "Jane Smith",
      cnic: "42101-2345678-2",
      department: "Administration",
      basicSalary: "35000",
      workingDays: "22"
    },
    {
      name: "Ahmed Ali",
      cnic: "42101-3456789-3",
      department: "Security",
      basicSalary: "22000",
      workingDays: "30"
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Simulate file processing
    setTimeout(() => {
      setIsUploading(false);
      setUploadResult({
        success: true,
        message: "File uploaded successfully!",
        imported: 15,
        errors: []
      });
    }, 2000);
  };

  const downloadTemplate = () => {
    console.log("Downloading Excel template...");
    // In a real implementation, this would generate and download an Excel file
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
              <Alert className={uploadResult.success ? "border-success bg-success/5" : "border-destructive bg-destructive/5"}>
                {uploadResult.success ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <AlertDescription>
                  {uploadResult.message}
                  {uploadResult.imported && (
                    <span className="block mt-1">
                      Successfully imported {uploadResult.imported} employee records.
                    </span>
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
                <li>• <strong>Department:</strong> Department name (must match existing departments)</li>
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
            <p>• Make sure all departments exist before importing (create them in the Departments section)</p>
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