-- Create revenue goals table
CREATE TABLE public.revenue_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'missed', 'archived')),
  milestones JSONB DEFAULT '[]',
  achieved_milestones JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.revenue_goals ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view revenue goals" 
ON public.revenue_goals 
FOR SELECT 
USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Admins can create revenue goals" 
ON public.revenue_goals 
FOR INSERT 
WITH CHECK (public.can_access_admin(auth.uid()));

CREATE POLICY "Admins can update revenue goals" 
ON public.revenue_goals 
FOR UPDATE 
USING (public.can_access_admin(auth.uid()));

CREATE POLICY "Admins can delete revenue goals" 
ON public.revenue_goals 
FOR DELETE 
USING (public.can_access_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_revenue_goals_updated_at
BEFORE UPDATE ON public.revenue_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for active goals lookup
CREATE INDEX idx_revenue_goals_active ON public.revenue_goals(status, end_date) WHERE status = 'active';