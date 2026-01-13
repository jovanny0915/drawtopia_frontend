/**
 * Email Helper Functions
 * Frontend functions to trigger backend email endpoints
 * Note: Emails are now sent immediately (no queue system)
 */

const BACKEND_URL = 'https://drawtopia-backend.vercel.app'; // http://localhost:8000

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Send parental consent verification email
 * @param parentEmail - Parent's email address
 * @param parentName - Parent's name
 * @param childName - Child's name
 * @returns Promise with result
 */
export async function queueParentalConsentEmail(
  parentEmail: string,
  parentName: string,
  childName: string
): Promise<EmailResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/emails/parental-consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent_email: parentEmail,
        parent_name: parentName,
        child_name: childName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Error sending parental consent email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Send gift notification email
 * Note: Scheduled delivery is no longer supported (emails sent immediately)
 * @param recipientEmail - Recipient's email address
 * @param recipientName - Recipient's name
 * @param giverName - Gift giver's name
 * @param occasion - Occasion (Birthday, etc.)
 * @param giftMessage - Personal message from giver
 * @returns Promise with result
 */
export async function queueGiftNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  giverName: string,
  occasion: string,
  giftMessage: string = ''
): Promise<EmailResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/emails/gift-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        giver_name: giverName,
        occasion: occasion,
        gift_message: giftMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    console.error('Error sending gift notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
