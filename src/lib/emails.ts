
const BACKEND_URL = 'https://image-edit-five.vercel.app';

export interface EmailResult {
  success: boolean;
  message?: string;
  error?: string;
  email_id?: string;
}

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

export type GiftNotificationScenario = 'giver_creating' | 'another_adult_creating' | 'scheduled_delivery';

export interface GiftNotificationEmailOptions {
  giftOrderId?: string;
  scenario?: GiftNotificationScenario;
  designatedAdultName?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

export async function queueGiftNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  giverName: string,
  occasion: string,
  giftMessage: string = '',
  options: GiftNotificationEmailOptions = {}
): Promise<EmailResult> {
  try {
    const body: Record<string, string> = {
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      giver_name: giverName,
      occasion: occasion,
      gift_message: giftMessage,
    };
    if (options.giftOrderId) body.gift_order_id = options.giftOrderId;
    if (options.scenario) body.scenario = options.scenario;
    if (options.designatedAdultName) body.designated_adult_name = options.designatedAdultName;
    if (options.deliveryDate) body.delivery_date = options.deliveryDate;
    if (options.deliveryTime) body.delivery_time = options.deliveryTime;

    const response = await fetch(`${BACKEND_URL}/api/emails/gift-notification`, {
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
    };
  } catch (error) {
    console.error('Error sending gift notification email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

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
  themeName?: string,
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
            ...(themeName != null && { themeName: themeName }),
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
