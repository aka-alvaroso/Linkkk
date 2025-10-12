/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string to DD/MM/YYYY format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (DD/MM/YYYY) or fallback text
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Formats a date string to DD/MM/YYYY HH:mm format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Checks if a link has expired
 * @param expirationDate - Expiration date string or Date object
 * @returns true if expired, false if still valid
 */
export const isLinkExpired = (expirationDate: string | Date | null | undefined): boolean => {
  if (!expirationDate) return false; // No expiration date means never expires
  
  try {
    const expDate = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
    const now = new Date();
    
    return expDate.getTime() < now.getTime();
  } catch (error) {
    return false; // If we can't parse the date, assume it's not expired
  }
};

/**
 * Gets relative time (e.g., "in 3 days", "expired 2 hours ago")
 * @param dateString - Target date string or Date object
 * @returns Human readable relative time
 */
export const getRelativeTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMs < 0) {
      // Past dates
      const absDays = Math.abs(diffDays);
      const absHours = Math.abs(diffHours);
      const absMinutes = Math.abs(diffMinutes);
      
      if (absDays > 0) {
        return `Expiró hace ${absDays} día${absDays > 1 ? 's' : ''}`;
      } else if (absHours > 0) {
        return `Expiró hace ${absHours} hora${absHours > 1 ? 's' : ''}`;
      } else {
        return `Expiró hace ${absMinutes} minuto${absMinutes > 1 ? 's' : ''}`;
      }
    } else {
      // Future dates
      if (diffDays > 0) {
        return `En ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `En ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      } else {
        return `En ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
      }
    }
  } catch {
    return 'Fecha inválida';
  }
};

/**
 * Gets the expiration status of a link
 * @param expirationDate - Expiration date string or Date object
 * @returns Simple status string
 */
export const getExpirationStatus = (expirationDate: string | Date | null | undefined): 'expired' | 'expires-soon' | 'active' | 'never' => {
  // No expiration date
  if (!expirationDate) {
    return 'never';
  }
  
  try {
    const date = typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate;
    const now = new Date();
    
    // Invalid date
    if (isNaN(date.getTime())) {
      return 'never';
    }
    
    // Already expired
    if (date.getTime() < now.getTime()) {
      return 'expired';
    }
    
    // Expires within 24 hours
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) {
      return 'expires-soon';
    }
    
    // Still active
    return 'active';
  } catch {
    return 'never';
  }
};
