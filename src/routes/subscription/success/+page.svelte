<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { user } from "../../../lib/stores/auth";
    import { sendPaymentSuccessEmail, sendReceiptEmail } from "../../../lib/emails";
    import drawtopia from "../../../assets/logo.png";
    
    const goToDashboard = () => {
        goto('/dashboard');
    };

    const BACKEND_URL = 'https://image-edit-five.vercel.app'; // http://localhost:8000

    let sessionId: string | null = null;
    let isVerifying = true;
    let verificationSuccess = false;
    let errorMessage = "";
    let savedStoryId: string | null = null; // Story ID from URL or sessionStorage
    let savedSceneIndex: string | null = null; // Scene index from URL
    let emailSent = false; // Track if emails have been sent

    // Helper function to send payment confirmation emails
    async function sendPaymentEmails(sessionData: any) {
        if (emailSent) return; // Prevent duplicate sends
        
        try {
            const customerEmail = sessionData.customer_email || $user?.email;
            const customerName = sessionData.customer_name || 
                ($user?.first_name && $user?.last_name 
                    ? `${$user.first_name} ${$user.last_name}`.trim()
                    : $user?.first_name || $user?.last_name || 'there');
            
            if (!customerEmail) {
                console.warn('Cannot send payment emails: no email address available');
                return;
            }

            // Send payment success email (for subscriptions)
            if (sessionData.mode === 'subscription' && sessionData.plan_type) {
                const paymentResult = await sendPaymentSuccessEmail(
                    customerEmail,
                    customerName,
                    sessionData.plan_type,
                    sessionData.amount,
                    sessionData.next_billing_date
                );
                
                if (paymentResult.success) {
                    console.log('✅ Payment success email sent');
                } else {
                    console.error('❌ Failed to send payment success email:', paymentResult.error);
                }
            }

            // Send receipt email
            const receiptResult = await sendReceiptEmail(
                customerEmail,
                customerName,
                sessionData.invoice_id || sessionData.session_id,
                [{
                    name: sessionData.mode === 'subscription' 
                        ? `${sessionData.plan_type?.charAt(0).toUpperCase() + sessionData.plan_type?.slice(1) || 'Subscription'} Subscription`
                        : sessionData.purchase_type === 'story_bundle' 
                            ? 'Story Bundle'
                            : 'Single Story',
                    amount: sessionData.amount ? parseFloat(sessionData.amount.replace('$', '')) : 0
                }],
                sessionData.amount ? parseFloat(sessionData.amount.replace('$', '')) : 0,
                0, // tax
                sessionData.amount ? parseFloat(sessionData.amount.replace('$', '')) : 0,
                new Date().toISOString()
            );
            
            if (receiptResult.success) {
                console.log('✅ Receipt email sent');
            } else {
                console.error('❌ Failed to send receipt email:', receiptResult.error);
            }
            
            emailSent = true;
        } catch (error) {
            console.error('Error sending payment emails:', error);
            // Don't block the user if email sending fails
        }
    }

    onMount(async () => {
        if (browser) {
            // Get session_id from URL
            sessionId = $page.url.searchParams.get('session_id');
            
            if (sessionId) {
                try {
                    // Fetch session details from backend
                    const response = await fetch(`${BACKEND_URL}/api/stripe/session/${sessionId}`);
                    
                    if (response.ok) {
                        const sessionData = await response.json();
                        
                        if (sessionData.success && sessionData.payment_status === 'paid') {
                            verificationSuccess = true;
                            
                            // Send payment confirmation emails
                            await sendPaymentEmails(sessionData);
                        } else {
                            errorMessage = "Payment not completed";
                        }
                    } else {
                        errorMessage = "Failed to verify payment";
                    }
                } catch (error) {
                    console.error('Error verifying session:', error);
                    errorMessage = "Error verifying payment";
                }
            } else {
                errorMessage = "No session found";
            }
            
            // Get story ID and scene index from URL parameters (passed through Stripe redirect)
            const urlStoryId = $page.url.searchParams.get('storyId');
            const urlSceneIndex = $page.url.searchParams.get('sceneIndex');
            
            if (urlStoryId) {
                savedStoryId = urlStoryId;
                console.log(`[subscription/success] Found story ID from URL: ${savedStoryId}`);
                
                // If scene index is in URL, restore it to sessionStorage
                if (urlSceneIndex) {
                    savedSceneIndex = urlSceneIndex;
                    try {
                        sessionStorage.setItem(`preview_scene_index_${savedStoryId}`, urlSceneIndex);
                        console.log(`[subscription/success] Restored scene index ${urlSceneIndex} to sessionStorage for story ${savedStoryId}`);
                    } catch (error) {
                        console.error('[subscription/success] Error restoring scene index to sessionStorage:', error);
                    }
                } else {
                    // Fallback: Check sessionStorage if URL doesn't have scene index
                    try {
                        const storedIndex = sessionStorage.getItem(`preview_scene_index_${savedStoryId}`);
                        if (storedIndex) {
                            savedSceneIndex = storedIndex;
                            console.log(`[subscription/success] Found scene index in sessionStorage: ${savedSceneIndex}`);
                        }
                    } catch (error) {
                        console.error('[subscription/success] Error checking sessionStorage:', error);
                    }
                }
            } else {
                // Fallback: Check sessionStorage if URL doesn't have story ID
                try {
                    for (let i = 0; i < sessionStorage.length; i++) {
                        const key = sessionStorage.key(i);
                        if (key && key.startsWith('preview_scene_index_')) {
                            // Extract storyId from key (format: preview_scene_index_${storyId})
                            const extractedStoryId = key.replace('preview_scene_index_', '');
                            if (extractedStoryId) {
                                savedStoryId = extractedStoryId;
                                savedSceneIndex = sessionStorage.getItem(key);
                                console.log(`[subscription/success] Found saved scene index for story: ${savedStoryId}, index: ${savedSceneIndex}`);
                                break; // Use the first one found
                            }
                        }
                    }
                } catch (error) {
                    console.error('[subscription/success] Error checking sessionStorage:', error);
                }
            }
            
            isVerifying = false;
        }
    });

    function handleGoToDashboard() {
        goto('/dashboard');
    }

    function handleStartCreating() {
        goto('/create-character/1');
    }

    function handleContinueReading() {
        if (savedStoryId) {
            goto(`/preview/default?storyId=${savedStoryId}`);
        } else {
            // Fallback to dashboard if no story ID found
            goto('/dashboard');
        }
    }
</script>

<div class="success-container">
    <div class="logo-container">
        <img src={drawtopia} alt="Drawtopia" class="logo" role="button" tabindex="0" on:click={goToDashboard} on:keydown={(e) => e.key === 'Enter' && goToDashboard()} />
    </div>

    {#if isVerifying}
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Verifying your subscription...</p>
        </div>
    {:else if verificationSuccess}
        <div class="success-content">
            <div class="success-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="#10B981"/>
                    <path d="M24 40L35 51L56 30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            
            <h1 class="title">Welcome to Drawtopia Family!</h1>
            
            <p class="description">
                Your subscription is now active. You have access to unlimited stories, 
                premium templates, and all the magical features Drawtopia has to offer.
            </p>

            <div class="benefits">
                <div class="benefit">
                    <span class="check">✓</span>
                    <span>Up to 20 stories per month</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span>Premium story templates</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span>Multiple character support</span>
                </div>
                <div class="benefit">
                    <span class="check">✓</span>
                    <span>Gifting options available</span>
                </div>
            </div>

            <div class="actions">
                <button class="primary-btn" on:click={handleStartCreating}>
                    Start Creating Stories
                </button>
                {#if savedStoryId}
                    <button class="secondary-btn" on:click={handleContinueReading}>
                        Continue to Read
                    </button>
                {:else}
                    <button class="secondary-btn" on:click={handleGoToDashboard}>
                        Go to Dashboard
                    </button>
                {/if}
            </div>
        </div>
    {:else}
        <div class="error-content">
            <div class="error-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="40" r="40" fill="#EF4444"/>
                    <path d="M28 28L52 52M52 28L28 52" stroke="white" stroke-width="4" stroke-linecap="round"/>
                </svg>
            </div>
            
            <h1 class="title">Something went wrong</h1>
            
            <p class="description">
                {errorMessage || "We couldn't verify your subscription. Please try again or contact support."}
            </p>

            <div class="actions">
                <button class="primary-btn" on:click={() => goto('/pricing')}>
                    Try Again
                </button>
                <button class="secondary-btn" on:click={handleGoToDashboard}>
                    Go to Dashboard
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .success-container {
        min-height: 100vh;
        background: linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
    }

    .logo-container {
        margin-bottom: 40px;
    }

    .logo {
        height: 48px;
        cursor: pointer;
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        margin-top: 100px;
    }

    .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid #E5E7EB;
        border-top-color: #438BFF;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .loading-state p {
        font-family: 'DM Sans', sans-serif;
        font-size: 18px;
        color: #6B7280;
    }

    .success-content,
    .error-content {
        max-width: 600px;
        background: white;
        border-radius: 24px;
        padding: 48px;
        text-align: center;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    }

    .success-icon,
    .error-icon {
        margin-bottom: 24px;
    }

    .title {
        font-family: 'Quicksand', sans-serif;
        font-size: 32px;
        font-weight: 700;
        color: #1F2937;
        margin: 0 0 16px 0;
    }

    .description {
        font-family: 'DM Sans', sans-serif;
        font-size: 18px;
        color: #6B7280;
        line-height: 1.6;
        margin: 0 0 32px 0;
    }

    .benefits {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 32px;
        text-align: left;
    }

    .benefit {
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'DM Sans', sans-serif;
        font-size: 16px;
        color: #374151;
    }

    .check {
        width: 24px;
        height: 24px;
        background: #D1FAE5;
        color: #10B981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }

    .actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .primary-btn {
        width: 100%;
        padding: 16px 24px;
        background: #438BFF;
        color: white;
        border: none;
        border-radius: 12px;
        font-family: 'Quicksand', sans-serif;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .primary-btn:hover {
        background: #3578E5;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
    }

    .secondary-btn {
        width: 100%;
        padding: 16px 24px;
        background: transparent;
        color: #6B7280;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        font-family: 'Quicksand', sans-serif;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
    }

    .secondary-btn:hover {
        background: #F9FAFB;
        border-color: #D1D5DB;
    }

    @media (max-width: 640px) {
        .success-content,
        .error-content {
            padding: 32px 24px;
            margin: 0 16px;
        }

        .title {
            font-size: 24px;
        }

        .description {
            font-size: 16px;
        }
    }
</style>

