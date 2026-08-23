-- ====================================================================
-- AWAS INDIA - Beneficiary & Admin Portal Database Schema
-- Run this script in your Supabase Project SQL Editor
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  state TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Automatically create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, state, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    new.raw_user_meta_data->>'state',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. APPLICATIONS TABLE (AWAS Yojana Beneficiary Registration)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  form_no TEXT UNIQUE NOT NULL,
  application_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  
  -- Section 1: Personal Details
  applicant_full_name TEXT NOT NULL,
  regional_language_name TEXT,
  passport_photo_url TEXT,
  father_husband_name TEXT NOT NULL,
  mother_name TEXT,
  dob DATE NOT NULL,
  age INTEGER,
  gender TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  religion TEXT,
  category TEXT NOT NULL,
  nationality TEXT DEFAULT 'Indian',
  mobile_number TEXT NOT NULL,
  alternate_mobile TEXT,
  email_address TEXT,
  
  -- Section 2: Identity & Documents
  aadhaar_number TEXT NOT NULL,
  ration_card_number TEXT,
  voter_id_number TEXT,
  pan_card_number TEXT,
  caste_certificate_no TEXT,
  income_certificate_no TEXT,
  
  -- Section 3: Address Details
  present_address JSONB NOT NULL,
  permanent_address JSONB NOT NULL,
  same_as_present BOOLEAN DEFAULT false,
  
  -- Section 4: Family Details
  total_family_members INTEGER NOT NULL,
  annual_family_income NUMERIC NOT NULL,
  bpl_apl_status TEXT NOT NULL,
  type_of_residence TEXT,
  land_holding_acres NUMERIC,
  no_of_dependents INTEGER,
  no_of_children INTEGER,
  primary_earning_member TEXT,
  
  -- Section 5: Occupation & Bank Details
  occupation TEXT NOT NULL,
  educational_qualification TEXT,
  disability TEXT DEFAULT 'None / कोई नहीं',
  bank_account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  branch_name TEXT,
  account_holder_name TEXT,
  account_type TEXT,
  
  -- Section 6: Documents Enclosed & Uploads
  enclosed_documents TEXT[],
  signing_date DATE NOT NULL,
  signing_place TEXT NOT NULL,
  signature_url TEXT,
  thumb_impression_url TEXT,
  
  -- Section 7: Declaration & Admin Notes
  agreed_declaration BOOLEAN DEFAULT true NOT NULL,
  admin_remarks TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Application RLS Policies
CREATE POLICY "Users can create applications" ON public.applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own applications" ON public.applications
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins have full access to all applications" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 3. STORAGE BUCKETS SETUP (Run in Supabase Dashboard -> Storage)
-- Create bucket: 'awas-files' with public access
