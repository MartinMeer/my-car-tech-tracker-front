import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utility functions for Russian format (DD.MM.YYYY)
export const dateUtils = {
  // Convert Russian format (DD.MM.YYYY) to ISO format (YYYY-MM-DD)
  russianToISO: (russianDate: string): string => {
    if (!russianDate || !/^\d{2}\.\d{2}\.\d{4}$/.test(russianDate)) {
      return ''
    }
    const [day, month, year] = russianDate.split('.')
    return `${year}-${month}-${day}`
  },

  // Convert ISO format (YYYY-MM-DD) to Russian format (DD.MM.YYYY)
  isoToRussian: (isoDate: string): string => {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      return ''
    }
    const [year, month, day] = isoDate.split('-')
    return `${day}.${month}.${year}`
  },

  // Get current date in Russian format
  getCurrentRussianDate: (): string => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}.${month}.${year}`
  },

  // Validate Russian date format
  isValidRussianDate: (date: string): boolean => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      return false
    }
    const [day, month, year] = date.split('.').map(Number)
    const dateObj = new Date(year, month - 1, day)
    return dateObj.getDate() === day && 
           dateObj.getMonth() === month - 1 && 
           dateObj.getFullYear() === year
  }
}
