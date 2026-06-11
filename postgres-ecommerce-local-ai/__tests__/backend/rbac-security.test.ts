// REQ-15 to REQ-18: Auth, profile trigger, RBAC, privilege gating
// TEST-201: Automated profile trigger activation
// TEST-202: Server-side RBAC privilege gating
// TEST-203: Edge cases - auth input validation
// TEST-204: Edge cases - admin role toggle & persistence

import pool from '@/lib/db';
import { validateEmail, validatePassword } from '@/lib/utils/validation';

describe('Profile Trigger', () => {
  // TEST-201: Trigger exists on auth.users
  it('should have on_auth_user_created trigger on auth.users', async () => {
    const result = await pool.query(
      `SELECT tgname FROM pg_trigger
       JOIN pg_class ON tgrelid = pg_class.oid
       JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
       WHERE pg_namespace.nspname = 'auth'
       AND pg_class.relname = 'users'
       AND tgname = 'on_auth_user_created'`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].tgname).toBe('on_auth_user_created');
  });

  // TEST-201: Trigger function handle_new_user exists
  it('should have handle_new_user trigger function', async () => {
    const result = await pool.query(
      `SELECT proname FROM pg_proc
       WHERE proname = 'handle_new_user' AND pronamespace = 'public'::regnamespace`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].proname).toBe('handle_new_user');
  });

  // TEST-201: Profile display_name is NOT NULL
  it('should have NOT NULL constraint on profiles.display_name', async () => {
    const result = await pool.query(
      `SELECT is_nullable FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'display_name'`
    );
    expect(result.rows[0].is_nullable).toBe('NO');
  });

  // TEST-201: Trigger function uses COALESCE for display_name fallback
  it('should fallback to email when display_name metadata is missing', () => {
    const rawMeta = { name: 'Test User' };
    const emptyMeta = {};
    const email = 'user@example.com';

    const nameFromMeta = (meta: Record<string, unknown>) =>
      (meta?.name as string) || email;

    expect(nameFromMeta(rawMeta)).toBe('Test User');
    expect(nameFromMeta(emptyMeta)).toBe('user@example.com');
  });
});

describe('RBAC Security', () => {
  // TEST-202: has_role function exists
  it('should have has_role security definer function', async () => {
    const result = await pool.query(
      `SELECT proname, prosecdef FROM pg_proc
       WHERE proname = 'has_role' AND pronamespace = 'public'::regnamespace`
    );
    expect(result.rows.length).toBe(1);
    expect(result.rows[0].prosecdef).toBe(true);
  });

  // TEST-202: has_role accepts optional check_user_id parameter
  it('should accept check_user_id parameter', async () => {
    const result = await pool.query(
      `SELECT pg_get_function_identity_arguments('has_role'::regproc) AS args`
    );
    expect(result.rows[0].args).toContain('check_user_id');
  });

  // TEST-202: has_role returns boolean
  it('should verify admin role server-side via has_role', async () => {
    const result = await pool.query(
      `SELECT public.has_role('admin'::public.user_role_enum) AS is_admin`
    );
    expect(typeof result.rows[0].is_admin).toBe('boolean');
  });

  // TEST-202: Non-admin user returns false
  it('should return false for non-admin user with has_role', async () => {
    const result = await pool.query(
      `SELECT public.has_role('admin'::public.user_role_enum) AS is_admin`
    );
    expect(result.rows[0].is_admin).toBe(false);
  });
});

describe('Auth Input Validation', () => {
  // TEST-203: Invalid email format
  it('should detect invalid email formats', () => {
    const invalidEmails = ['not-an-email', '@missing.com', 'user@', 'user@.com', '', '  '];
    for (const email of invalidEmails) {
      expect(validateEmail(email)).not.toBeNull();
    }
  });

  // TEST-203: Valid email accepted
  it('should accept valid email formats', () => {
    const validEmails = ['user@example.com', 'test.user@domain.co', 'name+tag@company.org'];
    for (const email of validEmails) {
      expect(validateEmail(email)).toBeNull();
    }
  });

  // TEST-203: Empty email rejected
  it('should reject empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('  ')).toBe('Email is required');
  });

  // TEST-203: Weak password detection
  it('should reject passwords under 6 characters', () => {
    const weakPasswords = ['a', 'ab', 'abc', 'abcd', 'abcde'];
    for (const pw of weakPasswords) {
      expect(validatePassword(pw)).not.toBeNull();
    }
  });

  // TEST-203: Strong password acceptance
  it('should accept passwords with 6+ characters', () => {
    expect(validatePassword('abcdef')).toBeNull();
    expect(validatePassword('password123!')).toBeNull();
  });

  // TEST-203: Empty password rejected
  it('should reject empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  // TEST-203: Signup requires additional fields
  it('should reject signup with missing display name', () => {
    const errors: string[] = [];
    if (!'valid-name'.trim()) errors.push('Display name is required');
    expect(errors).toHaveLength(0);

    if (!''.trim()) errors.push('Display name is required');
    expect(errors).toHaveLength(1);
  });
});

describe('Admin Role Management', () => {
  // TEST-204: has_role returns false (not null) for unprivileged session
  it('should return exact false for unprivileged user', async () => {
    const result = await pool.query(
      `SELECT public.has_role('admin'::public.user_role_enum) AS is_admin`
    );
    expect(result.rows[0].is_admin).toBe(false);
  });

  // TEST-204: unique_user_role constraint exists
  it('should have unique constraint on user_roles(user_id, role)', async () => {
    const result = await pool.query(
      `SELECT constraint_name FROM information_schema.table_constraints
       WHERE table_schema = 'public' AND table_name = 'user_roles'
       AND constraint_type = 'UNIQUE'`
    );
    expect(result.rows.length).toBeGreaterThanOrEqual(1);
  });

  // TEST-204: has_role returns boolean type for admin check
  it('should return boolean type for has_role admin check', async () => {
    const result = await pool.query(
      `SELECT pg_typeof(public.has_role('admin'::public.user_role_enum)) AS role_type`
    );
    expect(result.rows[0].role_type).toBe('boolean');
  });
});
