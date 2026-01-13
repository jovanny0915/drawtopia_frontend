<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import drawtopia from "../../../assets/logo.png";

    let sessionId: string | null = null;
    let isVerifying = true;
    let verificationSuccess = false;
    let errorMessage = "";

    onMount(async () => {
        if (browser) {
            // Get session_id from URL
            sessionId = $page.url.searchParams.get('session_id');
            
            if (sessionId) {
                // Optionally verify the session with the backend
                // For now, we'll assume success if we have a session_id
                verificationSuccess = true;
            } else {
                errorMessage = "No session found";
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
</script>

<div class="success-container">
    <div class="logo-container">
        <img src={drawtopia} alt="Drawtopia" class="logo" />
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
                <button class="secondary-btn" on:click={handleGoToDashboard}>
                    Go to Dashboard
                </button>
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

