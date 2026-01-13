/**
 * User Statistics API Client
 * 
 * Provides functions to fetch user statistics from the backend API.
 */

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Interface for detailed user statistics
 */
export interface UserStatistics {
  total_users: number;
  new_users: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  active_users: {
    count: number;
    percentage: number;
  };
  by_role: Record<string, number>;
  by_subscription_status: Record<string, number>;
  metadata: {
    generated_at: string;
    date_range: {
      start: string | null;
      end: string | null;
    };
  };
}

/**
 * Interface for summary statistics
 */
export interface UserStatisticsSummary {
  summary: {
    total_users: number;
    active_users: number;
    new_users_24h: number;
  };
  generated_at: string;
}

/**
 * Fetch detailed user statistics
 * 
 * @param startDate - Optional ISO format date string to filter from
 * @param endDate - Optional ISO format date string to filter to
 * @returns Promise with user statistics
 */
export async function fetchUserStatistics(
  startDate?: string,
  endDate?: string
): Promise<UserStatistics> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `${API_BASE_URL}/api/dashboard/user-statistics${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user statistics: ${error}`);
  }
  
  return response.json();
}

/**
 * Fetch summary statistics (optimized for quick dashboard display)
 * 
 * @returns Promise with summary statistics
 */
export async function fetchUserStatisticsSummary(): Promise<UserStatisticsSummary> {
  const url = `${API_BASE_URL}/api/dashboard/user-statistics/summary`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch user statistics summary: ${error}`);
  }
  
  return response.json();
}

/**
 * Helper function to format subscription status for display
 */
export function formatSubscriptionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'free': 'Free',
    'free plan': 'Free Plan',
    'premium': 'Premium',
    'pro': 'Pro'
  };
  
  return statusMap[status.toLowerCase()] || status;
}

/**
 * Helper function to format role for display
 */
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    'adult': 'Adult',
    'child': 'Child',
    'admin': 'Administrator'
  };
  
  return roleMap[role.toLowerCase()] || role;
}

