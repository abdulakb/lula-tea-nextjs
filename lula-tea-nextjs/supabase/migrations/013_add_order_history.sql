-- Create order_history table for audit logging
CREATE TABLE IF NOT EXISTS public.order_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by TEXT DEFAULT 'admin',
  change_type TEXT NOT NULL, -- 'status_change', 'amount_edit', 'created'
  old_values JSONB,
  new_values JSONB,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

-- Admin can view all history
CREATE POLICY "Service role can manage order history"
  ON public.order_history
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_order_history_order_id ON public.order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_changed_at ON public.order_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_history_change_type ON public.order_history(change_type);

-- Function to automatically log order creation
CREATE OR REPLACE FUNCTION log_order_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.order_history (
    order_id,
    change_type,
    new_values
  ) VALUES (
    NEW.order_id,
    'created',
    jsonb_build_object(
      'subtotal', NEW.subtotal,
      'delivery_fee', NEW.delivery_fee,
      'total', NEW.total,
      'quantity_ordered', NEW.quantity_ordered,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log order creation
DROP TRIGGER IF EXISTS trigger_log_order_creation ON public.orders;
CREATE TRIGGER trigger_log_order_creation
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_creation();
