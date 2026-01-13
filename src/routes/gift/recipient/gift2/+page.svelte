<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    import logo from "../../../../assets/logo.png";
    import CalendarBlank from "../../../../assets/CalendarBlank.svg";

    import { giftCreation } from "../../../../lib/stores/giftCreation";
    import { getGiftById, type Gift } from "../../../../lib/database/gifts";
    import {
        user,
        authLoading,
        isAuthenticated,
    } from "../../../../lib/stores/auth";

    let giftState: any = {};
    let giftData: Gift | null = null;
    let gifterName = "Grandma"; // Default or get from store/params
    let recipientName = "";
    let recipientAge = "";
    let occasion = "";
    let giftMessage = "";
    let loadingGift = false;

    // Reactive statements for auth state
    $: currentUser = $user;
    $: loading = $authLoading;
    $: authenticated = $isAuthenticated;
    $: safeToRedirect = browser && !loading && currentUser !== undefined;
    
    // Get giftId from URL query params
    $: giftId = $page.url.searchParams.get('giftId');

    // Load gift data from database if giftId is provided
    onMount(async () => {
        // First try to load from URL parameter (from notification click)
        if (giftId) {
            loadingGift = true;
            try {
                const result = await getGiftById(giftId);
                if (result.success && result.data) {
                    giftData = result.data as Gift;
                    // Populate fields from gift data
                    recipientName = giftData.child_name || "Emma";
                    recipientAge = giftData.age_group ? getAgeFromRange(giftData.age_group) : "7";
                    occasion = giftData.occasion || "Birthday";
                    giftMessage = giftData.special_msg || "";
                    
                    // TODO: Fetch sender's name from user profile using giftData.from_user_id
                    // For now, use relationship or default
                    gifterName = giftData.relationship || "Someone";
                }
            } catch (err) {
                console.error('Error loading gift:', err);
            } finally {
                loadingGift = false;
            }
        } else {
            // Fallback to store if no giftId
            const unsubscribe = giftCreation.subscribe((state) => {
                giftState = state;
                recipientName = state.childName || "Emma";
                recipientAge = state.ageGroup
                    ? getAgeFromRange(state.ageGroup)
                    : "7";
                occasion = state.occasion || "Birthday";
                giftMessage = state.specialMsg || "";
            });

            return unsubscribe;
        }
    });

    // Helper to convert age range to a single age for display
    function getAgeFromRange(ageRange: string): string {
        // Extract middle age from range like "3-6" -> "4" or "7-10" -> "8"
        const match = ageRange.match(/(\d+)-(\d+)/);
        if (match) {
            const min = parseInt(match[1]);
            const max = parseInt(match[2]);
            return Math.floor((min + max) / 2).toString();
        }
        // Handle single ages like "11-12" -> "11"
        return ageRange.split("-")[0] || "7";
    }

    const handleStartCreating = () => {
        // Navigate to gift creation flow
        // TODO: Update with actual creation flow route
        goto("/create-character/1");
    };
</script>

<div class="gift-redemption-page">
    <div class="header">
        <div class="logo">
            <div class="logo-img"></div>
        </div>
    </div>

    <div class="main-content">
        <h1 class="title">You Have a Gift!</h1>

        <p class="subtitle">A little surprise is waiting for you</p>

        <!-- Gift Card Preview -->
        <div class="card-container">
            <div class="card-inner">
                <div class="card-content">
                    <div class="card-subtitle">
                        [Gift giver name] sent you a magical gift!
                    </div>
                    <div class="card-message">
                        "Hi! I'd love to gift Emma a personalized storybook
                        where they're the hero. Click the link below to create
                        their magical adventure together!"
                    </div>
                    <!-- Gift Details -->
                    <div class="gift-details">
                        <div class="details-label">
                            Create a personalized storybook for:
                        </div>
                        <div class="recipient-info">
                            <span class="recipient-name"
                                >{recipientName}, age {recipientAge}</span
                            >
                        </div>
                        <div class="occasion-info">
                            Occasion: <span class="occasion-value"
                                >{occasion}</span
                            >
                        </div>
                    </div>
                </div>

                <!-- Call to Action -->
                <div class="call-to-action">
                    <button class="start-button" on:click={handleStartCreating}>
                        <svg
                            class="heart-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                fill="white"
                            />
                        </svg>
                        Start Creating The Gift
                    </button>

                    <!-- Expiration Notice -->
                    <div class="expiration-notice">
                        <img
                            src={CalendarBlank}
                            alt="calendar"
                            class="calendar-icon"
                        />
                        <span>This gift link expires in 30 days.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .gift-redemption-page {
        margin: auto;
        width: 1240px;
        min-height: 100vh;
        padding: 24px 100px 80px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
    }

    .header {
        width: 100%;
        display: flex;
        justify-content: center;
        padding: 20px 0;
    }

    .logo {
        width: 203.32px;
        height: 38px;
        position: relative;
    }

    .logo-img {
        background-image: url("../../../../assets/logo.png");
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: 100%;
        height: 100%;
    }

    .main-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        text-align: center;
    }

    .title {
        font-family: Quicksand;
        font-weight: 700;
        font-size: 42px;
        line-height: 56px;
        margin: 0;
        color: #121212;
    }

    .subtitle {
        font-family: Nunito;
        font-size: 18px;
        line-height: 26px;
        color: #666d80;
        margin: 0;
    }

    .card-container {
        width: 550px;
        height: 429px;
        outline: 1px #dfd8d8 solid;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 4px;
    }

    .card-inner {
        width: 100%;
        max-width: 542px;
        height: 421px;
        border-radius: 16px;
        background: #ffffff;
        outline: 1px #dcdcdc solid;
        padding: 16px 16px 24px 16px;
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .card-subtitle {
        font-family: Nunito;
        font-size: 24px;
        font-weight: 500;
        line-height: 26px;
        font-style: Medium;
        margin: 0;
    }

    .card-content {
        width: 510px;
        height: 273px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .card-message {
        font-family: Nunito;
        font-size: 14px;
        font-weight: 700;
        border-radius: 12px;
        border: 1px #40c4aa solid;
        padding: 12px 16px 12px 14px;
        color: #40c4aa;
        background-color: #effefa;
    }

    .gift-details {
        background: white;
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        padding: 24px 16px 24px 14px;
        height: 138px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
    }

    .details-label {
        font-family: Nunito;
        font-size: 14px;
        color: #666d80;
    }

    .recipient-info {
    }

    .recipient-name {
        font-family: Quicksand;
        font-weight: 600;
        font-size: 24px;
        color: #121212;
    }

    .occasion-info {
        font-family: Nunito;
        font-size: 16px;
        color: #666d80;
    }

    .occasion-value {
        font-weight: 600;
        color: #121212;
    }

    .call-to-action {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .start-button {
        height: 44px;
        width: 510px;
        padding: 16px 32px;
        background: #438bff;
        border: none;
        border-radius: 20px;
        color: white;
        font-family: Quicksand;
        font-weight: 600;
        font-size: 18px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(67, 139, 255, 0.3);
    }

    .start-button:hover {
        background: #3a7ae4;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(67, 139, 255, 0.4);
    }

    .heart-icon {
        width: 20px;
        height: 20px;
    }

    .expiration-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-family: Nunito;
        font-size: 14px;
        color: #666d80;
        margin-top: 8px;
    }

    .calendar-icon {
        width: 16px;
        height: 16px;
    }

    @media (max-width: 800px) {
        .gift-redemption-page {
            padding: 16px;
            gap: 24px;
        }

        .title {
            font-size: 32px;
            line-height: 44px;
        }

        .subtitle {
            font-size: 16px;
        }

        .gift-details {
            padding: 20px;
        }

        .recipient-name {
            font-size: 20px;
        }

        .start-button {
            width: 100%;
            padding: 14px 24px;
            font-size: 16px;
        }
    }
</style>
