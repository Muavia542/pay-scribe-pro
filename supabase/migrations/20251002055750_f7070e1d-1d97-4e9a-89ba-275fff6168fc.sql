-- Create yearly_bonus table for storing bonus records
CREATE TABLE public.yearly_bonus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  bonus_amount NUMERIC NOT NULL DEFAULT 0,
  bonus_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.yearly_bonus ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view yearly_bonus"
ON public.yearly_bonus
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert yearly_bonus"
ON public.yearly_bonus
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update yearly_bonus"
ON public.yearly_bonus
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete yearly_bonus"
ON public.yearly_bonus
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_yearly_bonus_updated_at
BEFORE UPDATE ON public.yearly_bonus
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_yearly_bonus_employee_year ON public.yearly_bonus(employee_id, bonus_year);
CREATE INDEX idx_yearly_bonus_year ON public.yearly_bonus(bonus_year);