export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-]{8,}$/.test(phone);
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{4,10}$/.test(pincode);
}

export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}
