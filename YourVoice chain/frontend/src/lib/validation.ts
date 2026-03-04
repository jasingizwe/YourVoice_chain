export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

export function isFutureDate(isoDate: string): boolean {
  if (!isoDate) return false;
  const input = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input.getTime() > today.getTime();
}
