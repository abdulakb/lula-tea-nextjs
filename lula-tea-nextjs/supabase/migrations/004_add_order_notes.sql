-- Add notes column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Create order_notes table for comment history
CREATE TABLE IF NOT EXISTS public.order_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by VARCHAR(255) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON public.order_notes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON public.order_notes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.order_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage notes
CREATE POLICY "Allow service role to manage order notes" ON public.order_notes
  FOR ALL
  USING (true)
  WITH CHECK (true);
