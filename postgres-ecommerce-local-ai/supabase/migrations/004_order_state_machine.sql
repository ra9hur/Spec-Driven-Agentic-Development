-- REQ-19: Order status must follow linear progression
-- REQ-20: Server-side checkout validation
-- REQ-21: Cart flushing on order success
-- REQ-22: Order status state machine enforcement
-- REQ-23: COD-only payment constraint
-- REQ-24: Immutable price snapshot at checkout

-- Add CHECK constraint to restrict payment_method to COD only
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method = 'COD');

-- Create state progression trigger function
CREATE OR REPLACE FUNCTION public.check_order_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow setting initial status on INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'pending' THEN
      RAISE EXCEPTION 'New order must have status "pending"'
        USING HINT = 'Initial order status must be pending';
    END IF;
    RETURN NEW;
  END IF;

  -- On UPDATE, validate the transition
  IF NOT (
    (OLD.status = 'pending' AND NEW.status IN ('confirmed', 'cancelled')) OR
    (OLD.status = 'confirmed' AND NEW.status IN ('shipped', 'cancelled')) OR
    (OLD.status = 'shipped' AND NEW.status IN ('delivered', 'cancelled')) OR
    (OLD.status = 'delivered' AND NEW.status = 'delivered') OR
    (OLD.status = 'cancelled' AND NEW.status = 'cancelled')
  ) THEN
    RAISE EXCEPTION 'Invalid order status transition: % -> %', OLD.status, NEW.status
      USING HINT = 'Allowed transitions: pending→confirmed|cancelled, confirmed→shipped|cancelled, shipped→delivered|cancelled. Terminal states: delivered, cancelled';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger on orders
DROP TRIGGER IF EXISTS trg_check_order_status ON public.orders;
CREATE TRIGGER trg_check_order_status
  BEFORE INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.check_order_status_transition();
