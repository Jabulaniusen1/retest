import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with commas and proper decimal places
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: $)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  // Handle negative numbers
  const isNegative = amount < 0
  const absoluteAmount = Math.abs(amount)
  
  // Format with commas and 2 decimal places
  const formatted = absoluteAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return `${isNegative ? '-' : ''}${currency}${formatted}`
}

/**
 * Format number with commas (no currency symbol)
 * @param amount - The number to format
 * @returns Formatted number string
 */
export function formatNumber(amount: number): string {
  return amount.toLocaleString('en-US')
}
