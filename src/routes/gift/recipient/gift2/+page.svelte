<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";
    import { page } from "$app/stores";

    import logo from "../../../../assets/logo.png";
    import CalendarBlank from "../../../../assets/CalendarBlank.svg";

    import { giftCreation } from "../../../../lib/stores/giftCreation";
    import { getGiftById, type Gift } from "../../../../lib/database/gifts";
    import { supabase } from "../../../../lib/supabase";
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
    onMount(() => {
        if (giftId) {
            (async () => {
                loadingGift = true;
                try {
                    const result = await getGiftById(giftId);
                    if (result.success && result.data) {
                        giftData = result.data as Gift;
                        recipientName = giftData.child_name || "Emma";
                        recipientAge = giftData.age_group ? getAgeFromRange(giftData.age_group) : "7";
                        occasion = giftData.occasion || "Birthday";
                        giftMessage = giftData.special_msg || "";
                        if (giftData.from_user_id) {
                            const name = await fetchGiverName(giftData.from_user_id);
                            gifterName = name || capitalizeFirst((giftData.relationship || "Someone").trim());
                        } else {
                            gifterName = capitalizeFirst((giftData.relationship || "Someone").trim());
                        }
                    }
                } catch (err) {
                    console.error('Error loading gift:', err);
                } finally {
                    loadingGift = false;
                }
            })();
            return undefined;
        }
        const unsubscribe = giftCreation.subscribe((state) => {
            giftState = state;
            recipientName = state.childName || "Emma";
            recipientAge = state.ageGroup ? getAgeFromRange(state.ageGroup) : "7";
            occasion = state.occasion || "Birthday";
            giftMessage = state.specialMsg || "";
        });
        return unsubscribe;
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

    // Capitalize first character only (e.g. for single word like relationship)
    function capitalizeFirst(s: string): string {
        return (s && s.length > 0) ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s;
    }
    // Capitalize first character of first name and last name
    function capitalizeFirstAndLastName(firstName: string, lastName: string): string {
        const first = capitalizeFirst((firstName || "").trim());
        const last = capitalizeFirst((lastName || "").trim());
        return [first, last].filter(Boolean).join(" ") || "Someone";
    }

    // Fetch giver display name from users table by from_user_id
    async function fetchGiverName(fromUserId: string): Promise<string> {
        const { data, error } = await supabase
            .from("users")
            .select("first_name, last_name, email")
            .eq("id", fromUserId)
            .single();
        if (error || !data) return "";
        const first = (data.first_name ?? "").toString().trim();
        const last = (data.last_name ?? "").toString().trim();
        if (first || last) return capitalizeFirstAndLastName(first, last);
        const email = (data.email ?? "").toString().trim();
        if (email) {
            const local = email.split("@")[0] || "";
            return local ? local.charAt(0).toUpperCase() + local.slice(1).toLowerCase() : "";
        }
        return "";
    }

    // gift_type "link" = recipient creates the story; show "Start creating". Otherwise (e.g. "story") = story exists; show "View the gift story"
    $: isLinkGift = (giftData?.gift_type ?? "link").toString().toLowerCase() === "link";
    // Disable "Start creating" when a story has already been created for this gift
    $: startCreatingDisabled = giftData != null && giftData.story_id != null && giftData.story_id !== "";

    const handleStartCreating = () => {
        if (startCreatingDisabled) return;
        if (browser) {
            sessionStorage.setItem('gift_mode', 'generation');
            if (giftId) sessionStorage.setItem('gift_id', giftId);
        }
        goto("/create-character/1");
    };

    const handleViewGiftStory = () => {
        const sid = giftData?.story_id;
        if (sid) goto(`/preview/default?storyId=${sid}`);
        else console.warn("No story_id for this gift");
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
                        {gifterName} sent you a magical gift!
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
                    {#if isLinkGift}
                        <button class="start-button" disabled={startCreatingDisabled} on:click={handleStartCreating}>
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
                    {:else}
                        <button class="start-button" on:click={handleViewGiftStory}>
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
                            View The Gift Story
                        </button>
                    {/if}

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
        margin: 0 auto;
        max-width: 1240px;
        width: 100%;
        min-height: 100vh;
        padding: 24px 100px 80px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 32px;
        box-sizing: border-box;
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
        box-sizing: border-box;
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
        width: 100%;
        max-width: 550px;
        outline: 1px #dfd8d8 solid;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 4px;
        box-sizing: border-box;
    }

    .card-inner {
        width: 100%;
        max-width: 542px;
        border-radius: 16px;
        background: #ffffff;
        outline: 1px #dcdcdc solid;
        padding: 16px 16px 24px 16px;
        display: flex;
        flex-direction: column;
        gap: 32px;
        box-sizing: border-box;
    }

    .card-subtitle {
        font-family: Nunito;
        font-size: 24px;
        font-weight: 500;
        line-height: 26px;
        font-style: Medium;
        margin: 0;
        text-align: center;
    }

    .card-content {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 24px;
        box-sizing: border-box;
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
        box-sizing: border-box;
    }

    .gift-details {
        background: white;
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        padding: 24px 16px 24px 14px;
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
        box-sizing: border-box;
    }

    .details-label {
        font-family: Nunito;
        font-size: 14px;
        color: #666d80;
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
        align-items: center;
        gap: 12px;
        width: 100%;
        box-sizing: border-box;
    }

    .start-button {
        width: 100%;
        min-height: 44px;
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
        box-sizing: border-box;
    }

    .start-button:hover {
        background: #3a7ae4;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(67, 139, 255, 0.4);
    }

    .start-button:disabled {
        background: #b0b0b0;
        cursor: not-allowed;
        box-shadow: none;
    }

    .start-button:disabled:hover {
        background: #b0b0b0;
        transform: none;
        box-shadow: none;
    }

    .heart-icon {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
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
        flex-shrink: 0;
    }

    /* Tablet and small desktop */
    @media (max-width: 900px) {
        .gift-redemption-page {
            padding: 20px 24px 60px;
            gap: 28px;
        }

        .card-container {
            max-width: 100%;
        }
    }

    /* Mobile */
    @media (max-width: 768px) {
        .gift-redemption-page {
            padding: 16px 20px 48px;
            gap: 24px;
        }

        .header {
            padding: 12px 0;
        }

        .logo {
            width: 160px;
            height: 30px;
        }

        .main-content {
            gap: 20px;
        }

        .title {
            font-size: 28px;
            line-height: 1.3;
            padding: 0 8px;
        }

        .subtitle {
            font-size: 16px;
            line-height: 1.5;
            padding: 0 8px;
        }

        .card-container {
            border-radius: 12px;
            padding: 8px;
        }

        .card-inner {
            padding: 16px 12px 20px;
            gap: 24px;
        }

        .card-subtitle {
            font-size: 20px;
            line-height: 1.4;
        }

        .card-message {
            font-size: 13px;
            padding: 12px 14px;
            border-radius: 10px;
        }

        .gift-details {
            padding: 20px 14px;
            border-radius: 16px;
            align-items: center;
        }

        .details-label {
            font-size: 13px;
        }

        .recipient-name {
            font-size: 20px;
        }

        .occasion-info {
            font-size: 14px;
        }

        .start-button {
            min-height: 56px;
            padding: 14px 24px;
            font-size: 16px;
            border-radius: 16px;
        }

        .heart-icon {
            width: 18px;
            height: 18px;
        }

        .expiration-notice {
            font-size: 13px;
        }
    }

    /* Small mobile */
    @media (max-width: 480px) {
        .gift-redemption-page {
            padding: 12px 16px 40px;
            gap: 20px;
        }

        .logo {
            width: 140px;
            height: 26px;
        }

        .title {
            font-size: 24px;
        }

        .subtitle {
            font-size: 15px;
        }

        .card-container {
            padding: 6px;
            border-radius: 10px;
        }

        .card-inner {
            padding: 14px 10px 16px;
            gap: 20px;
        }

        .card-subtitle {
            font-size: 18px;
        }

        .card-message {
            font-size: 12px;
            padding: 10px 12px;
            border-radius: 8px;
        }

        .gift-details {
            align-items: center;
            padding: 16px 12px;
            border-radius: 12px;
        }

        .recipient-name {
            font-size: 18px;
        }

        .start-button {
            min-height: 52px;
            padding: 12px 20px;
            font-size: 15px;
            border-radius: 12px;
        }

        .expiration-notice {
            font-size: 12px;
        }
    }
</style>
