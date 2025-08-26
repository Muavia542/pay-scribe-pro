-- Fix security issue: Replace overly permissive RLS policies with authentication-based access controls
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on employees" ON public.employees;

-- Create secure RLS policies that require authentication
-- Only authenticated users can view employee data
CREATE POLICY "Authenticated users can view employees" 
ON public.employees 
FOR SELECT 
TO authenticated
USING (true);

-- Only authenticated users can insert employee data
CREATE POLICY "Authenticated users can insert employees" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update employee data
CREATE POLICY "Authenticated users can update employees" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (true);

-- Only authenticated users can delete employee data
CREATE POLICY "Authenticated users can delete employees" 
ON public.employees 
FOR DELETE 
TO authenticated
USING (true);

-- Also fix the departments table which has the same issue
DROP POLICY IF EXISTS "Allow all operations on departments" ON public.departments;

CREATE POLICY "Authenticated users can view departments" 
ON public.departments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage departments" 
ON public.departments 
FOR ALL 
TO authenticated
USING (true);

-- Fix other tables with similar issues
DROP POLICY IF EXISTS "Allow all operations on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow all operations on invoice_line_items" ON public.invoice_line_items;
DROP POLICY IF EXISTS "Allow all operations on payroll_entries" ON public.payroll_entries;

CREATE POLICY "Authenticated users can manage invoices" 
ON public.invoices 
FOR ALL 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage invoice_line_items" 
ON public.invoice_line_items 
FOR ALL 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage payroll_entries" 
ON public.payroll_entries 
FOR ALL 
TO authenticated
USING (true);