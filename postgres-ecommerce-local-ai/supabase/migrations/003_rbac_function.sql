-- REQ-17: Server-side role check function
-- REQ-18: Prevent client-side privilege escalation

CREATE OR REPLACE FUNCTION public.has_role(target_role user_role_enum, check_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = COALESCE(check_user_id, auth.uid()) AND role = target_role
  );
END;
$$ LANGUAGE plpgsql;
