-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  employee_count INTEGER DEFAULT 0,
  total_salary DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnic TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Skilled', 'Unskilled')),
  basic_salary DECIMAL(10,2) NOT NULL,
  working_days INTEGER NOT NULL DEFAULT 26,
  calculated_salary DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary * working_days) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payroll entries table
CREATE TABLE public.payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  working_days INTEGER NOT NULL,
  calculated_salary DECIMAL(12,2) NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  contract_number TEXT,
  service_description TEXT,
  sub_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  service_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  eobi_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  gst_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice line items table for detailed breakdown
CREATE TABLE public.invoice_line_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  rate DECIMAL(10,2),
  attendance INTEGER,
  pob INTEGER,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (since no auth needed, allow all operations)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Create policies for full access (since no auth needed)
CREATE POLICY "Allow all operations on departments" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on payroll_entries" ON public.payroll_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_line_items" ON public.invoice_line_items FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update department stats
CREATE OR REPLACE FUNCTION public.update_department_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update employee count and total salary for the affected department(s)
  IF TG_OP = 'DELETE' THEN
    UPDATE public.departments 
    SET 
      employee_count = (SELECT COUNT(*) FROM public.employees WHERE department = OLD.department),
      total_salary = (SELECT COALESCE(SUM(calculated_salary), 0) FROM public.employees WHERE department = OLD.department)
    WHERE name = OLD.department;
    RETURN OLD;
  ELSE
    UPDATE public.departments 
    SET 
      employee_count = (SELECT COUNT(*) FROM public.employees WHERE department = NEW.department),
      total_salary = (SELECT COALESCE(SUM(calculated_salary), 0) FROM public.employees WHERE department = NEW.department)
    WHERE name = NEW.department;
    
    -- If department changed, update the old department too
    IF TG_OP = 'UPDATE' AND OLD.department != NEW.department THEN
      UPDATE public.departments 
      SET 
        employee_count = (SELECT COUNT(*) FROM public.employees WHERE department = OLD.department),
        total_salary = (SELECT COALESCE(SUM(calculated_salary), 0) FROM public.employees WHERE department = OLD.department)
      WHERE name = OLD.department;
    END IF;
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update department stats
CREATE TRIGGER update_department_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_department_stats();

-- Insert initial departments
INSERT INTO public.departments (name, description) VALUES
  ('SOD', 'Store Operations Department - Managing inventory and supplies'),
  ('BS', 'Business Services - Administrative and support functions'),
  ('Production Area-1', 'Manufacturing operations in production area 1'),
  ('Production Area-2', 'Manufacturing operations in production area 2'),
  ('Production Process', 'Process control and manufacturing workflows');