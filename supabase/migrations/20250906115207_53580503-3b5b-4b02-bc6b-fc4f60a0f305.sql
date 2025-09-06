-- Add cash_payment column to employees table
ALTER TABLE public.employees 
ADD COLUMN cash_payment boolean DEFAULT false;