/**
 * Email Helper Functions
 * Frontend functions to trigger backend email endpoints
 * Note: Emails are now sent immediately (no queue system)
 */

const BACKEND_URL = 'https://image-edit-five.vercel.app'; // http://localhost:8000

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
  email_id?: string;
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

/**
 * Send book completion notification email
 * Sends variables according to book_format:
 * - interactive_search: to_email, parent_name, child_name, character_name, character_type,
 *   book_title, special_ability, book_format, preview_link, download_link
 * - adventure-story: the above plus story_world, adventure_type, age_group
 *
 * @param toEmail - Recipient's email address
 * @param parentName - Parent's name
 * @param childName - Child's name
 * @param characterName - Character's name
 * @param characterType - Character type
 * @param bookTitle - Book/story title
 * @param specialAbility - Character's special ability
 * @param bookFormat - Book format ('story_adventure' or 'interactive_search')
 * @param previewLink - Link to preview the story
 * @param downloadLink - Link to download the story
 * @param storyWorld - Story world setting (adventure-story only)
 * @param adventureType - Adventure type (adventure-story only)
 * @param ageGroup - Age group (adventure-story only)
 * @returns Promise with result
 */
export async function sendBookCompletionEmail(
  toEmail: string,
  parentName: string,
  childName: string,
  characterName: string,
  characterType: string,
  bookTitle: string,
  specialAbility: string,
  bookFormat: string = 'story_adventure',
  previewLink: string,
  downloadLink: string,
  storyWorld?: string,
  adventureType?: string,
  ageGroup?: string
): Promise<EmailResult> {
  try {
    const baseBody: Record<string, string> = {
      to_email: toEmail,
      parent_name: parentName,
      child_name: childName,
      character_name: characterName,
      character_type: characterType,
      book_title: bookTitle,
      special_ability: specialAbility,
      book_format: bookFormat,
      preview_link: previewLink,
      download_link: downloadLink,
    };

    const body =
      bookFormat === 'interactive_search'
        ? baseBody
        : {
            ...baseBody,
            ...(storyWorld != null && { story_world: storyWorld }),
            ...(adventureType != null && { adventure_type: adventureType }),
            ...(ageGroup != null && { age_group: ageGroup }),
          };

    const response = await fetch(`${BACKEND_URL}/api/emails/book-completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
      email_id: data.email_id,
    };
  } catch (error) {
    console.error('Error sending book completion email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Send payment success confirmation email
 * @param toEmail - Recipient's email address
 * @param customerName - Customer's name
 * @param planType - Plan type ('monthly' or 'yearly')
 * @param amount - Payment amount (e.g., "$9.99")
 * @param nextBillingDate - Next billing date (optional, for subscriptions)
 * @returns Promise with result
 */
export async function sendPaymentSuccessEmail(
  toEmail: string,
  customerName: string,
  planType: string = 'monthly',
  amount?: string,
  nextBillingDate?: string
): Promise<EmailResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/emails/payment-success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email: toEmail,
        customer_name: customerName,
        plan_type: planType,
        amount: amount,
        next_billing_date: nextBillingDate,
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
      email_id: data.email_id,
    };
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Send receipt email for purchase
 * @param toEmail - Recipient's email address
 * @param customerName - Customer's name
 * @param transactionId - Transaction/Invoice ID
 * @param items - Array of purchased items
 * @param subtotal - Subtotal amount
 * @param tax - Tax amount (default: 0)
 * @param total - Total amount
 * @param transactionDate - Transaction date (ISO string)
 * @returns Promise with result
 */
export async function sendReceiptEmail(
  toEmail: string,
  customerName: string,
  transactionId: string,
  items: Array<{ name: string; amount: number }>,
  subtotal: number,
  tax: number = 0,
  total: number,
  transactionDate: string
): Promise<EmailResult> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/emails/receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to_email: toEmail,
        customer_name: customerName,
        transaction_id: transactionId,
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        transaction_date: transactionDate,
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
      email_id: data.email_id,
    };
  } catch (error) {
    console.error('Error sending receipt email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
