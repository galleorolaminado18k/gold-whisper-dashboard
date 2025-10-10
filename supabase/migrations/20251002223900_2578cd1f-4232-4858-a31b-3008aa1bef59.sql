-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'sales_rep');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create CRM leads table
CREATE TABLE public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  source TEXT NOT NULL, -- 'meta_ads', 'whatsapp', 'referral', etc.
  campaign_name TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  product_interest TEXT, -- 'jewelry', 'balineria', 'both'
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on crm_leads
ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- CRM leads policies
CREATE POLICY "Authenticated users can view all leads"
  ON public.crm_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON public.crm_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assigned leads or admins can update all"
  ON public.crm_leads FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Create CRM customers table
CREATE TABLE public.crm_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  customer_type TEXT NOT NULL, -- 'wholesale', 'retail'
  total_purchases DECIMAL(12, 2) DEFAULT 0,
  last_purchase_date TIMESTAMPTZ,
  birth_date DATE,
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on crm_customers
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;

-- CRM customers policies
CREATE POLICY "Authenticated users can view all customers"
  ON public.crm_customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert customers"
  ON public.crm_customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assigned customers or admins can update all"
  ON public.crm_customers FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Create CRM opportunities table
CREATE TABLE public.crm_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.crm_customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12, 2) NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospecting', -- 'prospecting', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  probability INTEGER DEFAULT 50, -- 0-100
  expected_close_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on crm_opportunities
ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

-- CRM opportunities policies
CREATE POLICY "Authenticated users can view all opportunities"
  ON public.crm_opportunities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert opportunities"
  ON public.crm_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assigned opportunities or admins can update all"
  ON public.crm_opportunities FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() OR
    public.has_role(auth.uid(), 'admin')
  );

-- Create CRM activities table (interactions with leads/customers)
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.crm_leads(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.crm_customers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'whatsapp', 'note'
  subject TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on crm_activities
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

-- CRM activities policies
CREATE POLICY "Authenticated users can view all activities"
  ON public.crm_activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON public.crm_activities FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_crm_leads_status ON public.crm_leads(status);
CREATE INDEX idx_crm_leads_assigned_to ON public.crm_leads(assigned_to);
CREATE INDEX idx_crm_leads_created_at ON public.crm_leads(created_at DESC);
CREATE INDEX idx_crm_customers_customer_type ON public.crm_customers(customer_type);
CREATE INDEX idx_crm_customers_assigned_to ON public.crm_customers(assigned_to);
CREATE INDEX idx_crm_customers_birth_date ON public.crm_customers(birth_date);
CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities(stage);
CREATE INDEX idx_crm_opportunities_assigned_to ON public.crm_opportunities(assigned_to);
CREATE INDEX idx_crm_activities_lead_id ON public.crm_activities(lead_id);
CREATE INDEX idx_crm_activities_customer_id ON public.crm_activities(customer_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_customers_updated_at
  BEFORE UPDATE ON public.crm_customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crm_opportunities_updated_at
  BEFORE UPDATE ON public.crm_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();