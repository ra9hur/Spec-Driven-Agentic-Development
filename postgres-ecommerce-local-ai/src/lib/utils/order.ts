import { randomBytes } from 'crypto';

// REQ-36: Unique, non-guessable order ID
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(6).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
