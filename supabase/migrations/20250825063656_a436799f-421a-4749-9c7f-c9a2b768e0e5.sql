-- Fix security warnings by setting search_path for functions

-- Drop triggers first, then functions, then recreate everything
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
DROP TRIGGER IF EXISTS update_department_stats_trigger ON public.employees;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_department_stats() CASCADE;

-- Recreate functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_department_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Recreate triggers
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_department_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_department_stats();