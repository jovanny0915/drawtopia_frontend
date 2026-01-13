<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import drawtopialogo from "../../assets/logo.png";
    import arrowLeft from "../../assets/ArrowLeft.svg";
    import pencilSimple from "../../assets/WhitePencilSimple.svg";
    import check from "../../assets/Check.svg";
    import x from "../../assets/X.svg";
    
    import globe from "../../assets/GlobeHemisphereWest.svg";
    import envelope from "../../assets/Envelope.svg";
    import userSquare from "../../assets/UserSquare.svg";
    import selectLayerIcon from "../../assets/List.svg";
    import { goto } from "$app/navigation";
    import { user, auth } from "../../lib/stores/auth";
    import { getUserProfile } from "../../lib/auth";
    import AccountDropdown from "../../components/AccountDropdown.svelte";
    import PushNotificationSettings from "../../components/PushNotificationSettings.svelte";

    let isEditing = false;
    let showEditProfileModal = false;
    
    // User data state
    let userName = "Alex Smith";
    let userEmail = "drawtopia@gmail.com";
    let userLanguage = "English";
    let userAvatarUrl = "https://placehold.co/40x40";
    let userProfilePicture = "https://placehold.co/120x120";
    let subscriptionPlan = "Free Plan";
    let subscriptionStatus = "free";
    let planType = "";
    let currentPeriodEnd: Date | null = null;
    let isSubscriptionActive = false;
    let lastFetchedUserId: string | null = null;
    
    // Email preferences state
    let onboardingEmailsEnabled = true;
    let productUpdatesEnabled = false;

    // Format subscription status for display
    function formatSubscriptionStatus(status: string | null | undefined): string {
        if (!status) return "Free Plan";
        
        const statusMap: { [key: string]: string } = {
            'premium': 'Premium Plan',
            'free plan': 'Free Plan',
            'trial': 'Trial Plan',
            'basic': 'Basic Plan'
        };
        
        const normalizedStatus = status.toLowerCase();
        return statusMap[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1) + ' Plan';
    }

    // Get name and email from auth session (stored in localStorage by Supabase)
    function getAuthInfo() {
        if (!browser) return;
        
        const authState = get(auth);
        if (authState.user) {
            // Get email from auth user
            userEmail = authState.user.email || "";
            
            // Get name from user_metadata or construct from metadata
            if (authState.user.user_metadata?.full_name) {
                userName = authState.user.user_metadata.full_name;
            } else if (authState.user.user_metadata?.name) {
                userName = authState.user.user_metadata.name;
            } else if (authState.user.user_metadata?.first_name || authState.user.user_metadata?.last_name) {
                userName = `${authState.user.user_metadata.first_name || ''} ${authState.user.user_metadata.last_name || ''}`.trim();
            } else {
                // Fallback to email username if no name available
                userName = authState.user.email?.split('@')[0] || "Singh Smith";
            }
        }
    }

    // Fetch user data from users table (avatar_url, subscription_status, etc.)
    async function fetchUserData() {
        if (!browser) return;

        const authState = get(auth);
        if (authState.user && authState.user.id !== lastFetchedUserId) {
            lastFetchedUserId = authState.user.id;
            try {
                const result = await getUserProfile(authState.user.id);
                if (result.success && result.profile) {
                    // Handle both array and single object responses
                    const profile = Array.isArray(result.profile) 
                        ? result.profile[0] 
                        : result.profile;
                    
                    if (profile) {
                        // Get avatar URL from users table or user metadata
                        if (authState.user.user_metadata?.avatar_url) {
                            userAvatarUrl = authState.user.user_metadata.avatar_url;
                            userProfilePicture = authState.user.user_metadata.avatar_url;
                        } else if (authState.user.user_metadata?.picture) {
                            userAvatarUrl = authState.user.user_metadata.picture;
                            userProfilePicture = authState.user.user_metadata.picture;
                        } else {
                            // If avatar_url is in users table, you can add it here
                            userAvatarUrl = "https://placehold.co/40x40";
                            userProfilePicture = "https://placehold.co/120x120";
                        }
                    }
                }
                
                // Fetch subscription details - this handles all subscription logic
                await fetchSubscriptionDetails(authState.user.id);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }
    }
    
    // Fetch subscription details from subscriptions table and users table
    async function fetchSubscriptionDetails(userId: string) {
        try {
            const { supabase } = await import("../../lib/supabase");
            
            // First, get the user's subscription_status from users table
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("subscription_status")
                .eq("id", userId)
                .single();
            
            // Then, check if there's an active subscription in subscriptions table
            const { data: subscriptionData, error: subscriptionError } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("user_id", userId)
                .eq("status", "active")
                .single();

            console.log('[fetchSubscriptionDetails] subscriptionData:', subscriptionData);
            
            // Logic: 
            // - If subscriptions.status = 'active' AND users.subscription_status = 'premium' → Premium Plan
            // - Otherwise → Free Plan
            const hasActiveSubscription = subscriptionData && !subscriptionError;
            const userIsPremium = userData?.subscription_status === "premium";
            
            if (hasActiveSubscription && userIsPremium) {
                // Premium Plan - both conditions met
                isSubscriptionActive = true;
                subscriptionStatus = "premium";
                subscriptionPlan = "Premium Plan";
                planType = subscriptionData.plan_type || "monthly";
                if (subscriptionData.current_period_end) {
                    currentPeriodEnd = new Date(subscriptionData.current_period_end);
                }
            } else {
                // Free Plan - subscription not active
                isSubscriptionActive = false;
                subscriptionStatus = "free";
                subscriptionPlan = "Free Plan";
                planType = "";
                currentPeriodEnd = null;
            }
        } catch (error) {
            console.error("Error fetching subscription details:", error);
            // Default to Free Plan on error
            isSubscriptionActive = false;
            subscriptionStatus = "free";
            subscriptionPlan = "Free Plan";
        }
    }
    
    // Format date for display
    function formatDate(date: Date | null): string {
        if (!date) return "";
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Reactive statement to update user data when auth state changes
    $: if (browser && $auth.user && !$auth.loading) {
        getAuthInfo();
        if ($auth.user.id !== lastFetchedUserId) {
            fetchUserData();
        }
    }

    onMount(() => {
        if (!browser) return;
        
        // Get auth info from session (stored in localStorage by Supabase)
        getAuthInfo();
        
        // Fetch user data from users table (avatar_url, subscription_status, etc.)
        if ($auth.user && !$auth.loading) {
            fetchUserData();
        }
    });

    function handleBack() {
        goto("/dashboard");
    }

    function handleEditProfile() {
        isEditing = true;
        showEditProfileModal = true;

        goto("/account/edit");
    }

    function handleSave() {
        isEditing = false;
        showEditProfileModal = false;
        // Add save logic here
    }

    function handleCancel() {
        isEditing = false;
        showEditProfileModal = false;
    }

    function toggleOnboardingEmails() {
        onboardingEmailsEnabled = !onboardingEmailsEnabled;
        // Add save logic here if needed
    }

    function toggleProductUpdates() {
        productUpdatesEnabled = !productUpdatesEnabled;
        // Add save logic here if needed
    }
</script>

<div class="account-settings">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopialogo} alt="drawtopialogo" class="drawtopialogo">
        </div>
        <div class="frame-2147227655">
            <AccountDropdown 
                avatarUrl={userAvatarUrl}
                userName={userName}
                userPlan={subscriptionPlan}
            />
            <div class="icon-list" role="button" tabindex="0">
                <img src={selectLayerIcon} alt="menu" />
            </div>
        </div>
    </div>
    <div class="frame-1410103919">
        <div class="frame-1410103869">
            <div class="frame-1410103870">
                <button class="button" on:click={handleBack}>
                    <div class="arrowleft">
                        <img src={arrowLeft} alt="back" class="arrowleft-icon" />
                    </div>
                    <div class="account-settings_01"><span class="accountsettings_01_span">Account Settings</span></div>
                </button>
            </div>
        </div>
        <div class="frame-1410103888">
            <div class="frame-1410103916">
                <div class="frame-1410103915">
                    <div class="profile"><span class="profile_span">Profile</span></div>
                    <button class="button_01" on:click={handleEditProfile}>
                        <img src={pencilSimple} alt="edit" class="edit-icon" />
                        <div class="edit-profile"><span class="editprofile_span">Edit Profile</span></div>
                        <div class="ellipse-1415"></div>
                    </button>
                </div>
            </div>
            <div class="frame-1410103917">
                <div class="frame-1410103916_01">
                    <div class="frame-1410103915_01">
                        <div><span class="profilepicture_span">Profile Picture</span></div>
                    </div>
                    <img class="ellipse-10" src={userProfilePicture} alt="User profile" />
                </div>
                <div class="rectangle-39"></div>
                <div class="form">
                    <div class="frame-1410103918">
                        <div><span class="name_span">Name</span></div>
                        <div class="drawtopia-kids"><span class="drawtopiakids_span">{userName}</span></div>
                    </div>
                </div>
                <div class="rectangle-38"></div>
                <div class="form_01">
                    <div class="frame-1410103918_01">
                        <div><span class="email_span">Email</span></div>
                        <div class="drawtopiagmailcom"><span class="drawtopiagmailcom_span">{userEmail}</span></div>
                    </div>
                </div>
                <div class="rectangle-37"></div>
                <div class="form_02">
                    <div class="frame-1410103918_02">
                        <div><span class="languagebooks_span">Language Books</span></div>
                        <div class="english"><span class="english_span">English</span></div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Subscription Plan Section -->
        <div class="frame-1410103889">
            <div class="frame-1410103917_01">
                <div class="frame-1410103916_02">
                    <div class="frame-1410103915_02">
                        <div><span class="subscriptionplan_span">Subscription Plan</span></div>
                    </div>
                </div>
                <div class="form_subscription">
                    <div class="subscription-info">
                        <div class="subscription-plan-badge" class:premium={isSubscriptionActive} class:free={!isSubscriptionActive}>
                            <span class="plan-name">{subscriptionPlan}</span>
                        </div>
                        {#if isSubscriptionActive}
                            <div class="subscription-details">
                                <div class="detail-row">
                                    <span class="detail-label">Plan Type:</span>
                                    <span class="detail-value">{planType === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                                </div>
                                {#if currentPeriodEnd}
                                    <div class="detail-row">
                                        <span class="detail-label">Renews on:</span>
                                        <span class="detail-value">{formatDate(currentPeriodEnd)}</span>
                                    </div>
                                {/if}
                            </div>
                            <button class="manage-subscription-button" on:click={() => goto('/account/edit')}>
                                <span>Manage Subscription</span>
                            </button>
                        {:else}
                            <div class="subscription-cta">
                                <p class="cta-text">Unlock unlimited stories and premium features</p>
                                <button class="upgrade-button" on:click={() => goto('/pricing')}>
                                    <span>Upgrade to Premium</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="frame-1410103889">
            <div class="frame-1410103917_01">
                <div class="frame-1410103916_02">
                    <div class="frame-1410103915_02">
                        <div><span class="emailpreferences_span">Email Preferences</span></div>
                    </div>
                </div>
                <div class="form_03">
                    <div class="frame-1410103918_03">
                        <div class="onboarding-emails"><span class="onboardingemails_span">Onboarding emails</span></div>
                        <div class="guides-and-tips-to-help-you-get-started"><span class="guidesandtipstohelpyougetstarted_span">Guides and tips to help you get started</span></div>
                    </div>
                    <button 
                        class={onboardingEmailsEnabled ? "switch-button" : "switch-button_01"}
                        on:click={toggleOnboardingEmails}
                        type="button"
                        aria-label="Toggle onboarding emails"
                        role="switch"
                        aria-checked={onboardingEmailsEnabled}
                    >
                        <div class="ellipse-11"></div>
                    </button>
                </div>
                <div class="rectangle-38_01"></div>
                <div class="form_04">
                    <div class="frame-1410103918_04">
                        <div class="product-updates-announcements"><span class="productupdatesannouncements_span">Product updates & announcements</span></div>
                        <div class="new-features-improvements-and-news"><span class="newfeaturesimprovementsandnews_span">New features, improvements, and news</span></div>
                    </div>
                    <button 
                        class={productUpdatesEnabled ? "switch-button" : "switch-button_01"}
                        on:click={toggleProductUpdates}
                        type="button"
                        aria-label="Toggle product updates"
                        role="switch"
                        aria-checked={productUpdatesEnabled}
                    >
                        <div class="ellipse-11_01"></div>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Push Notifications Section -->
        <div class="frame-1410103889">
            <div class="frame-1410103917_01">
                <PushNotificationSettings />
            </div>
        </div>
        
        {#if isEditing}
        <div class="action-buttons">
            <button class="save-button" on:click={handleSave}>
                <img src={check} alt="save" class="action-icon" />
                <span>Save Changes</span>
            </button>
            <button class="cancel-button" on:click={handleCancel}>
                <img src={x} alt="cancel" class="action-icon" />
                <span>Cancel</span>
            </button>
        </div>
        {/if}
    </div>
</div>

<style>

.edit-icon {
    width: 20px;
    height: 20px;
}

.editprofilepicture_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
    text-decoration: underline;
    cursor: pointer;
}

.action-icon {
    width: 20px;
    height: 20px;
}

.accountsettings_01_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.account-settings_01 {
    text-align: center;
}

.profile_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
}

.profile {
    align-self: stretch;
}

.editprofile_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
}

.edit-profile {
    text-align: center;
}

.ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 48px;
    top: 4px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
}

.profilepicture_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
}

.ellipse-10 {
    width: 80px;
    height: 80px;
    background: #D9D9D9;
    border-radius: 9999px;
    object-fit: cover;
}

.rectangle-39 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.name_span {
    color: black;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.drawtopiakids_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.drawtopia-kids {
    align-self: stretch;
}

.rectangle-38 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.email_span {
    color: black;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.drawtopiagmailcom_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.drawtopiagmailcom {
    align-self: stretch;
}

.rectangle-37 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.languagebooks_span {
    color: black;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.english_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.english {
    align-self: stretch;
}

.emailpreferences_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
}

.onboardingemails_span {
    color: black;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.onboarding-emails {
    align-self: stretch;
}

.guidesandtipstohelpyougetstarted_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.guides-and-tips-to-help-you-get-started {
    align-self: stretch;
}

.ellipse-11 {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 9999px;
}

.rectangle-38_01 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
}

.productupdatesannouncements_span {
    color: black;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.product-updates-announcements {
    align-self: stretch;
}

.newfeaturesimprovementsandnews_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.new-features-improvements-and-news {
    align-self: stretch;
}

.ellipse-11_01 {
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 9999px;
}

.frame-1410103915_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
}

.frame-1410103918 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_01 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103915_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: inline-flex;
}

.frame-1410103918_03 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103918_04 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.logo-text-full {
    width: 170.15px;
    height: 31.80px;
    position: relative;
}

.drawtopialogo {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
}

.button_01 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438BFF;
    box-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.button_01:hover {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.switch-button {
    width: 53px;
    padding: 6px;
    background: #438BFF;
    border-radius: 24px;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.switch-button:hover {
    opacity: 0.9;
}

.switch-button:focus {
    outline: 2px solid #438BFF;
    outline-offset: 2px;
}

.switch-button_01 {
    width: 53px;
    padding: 6px;
    background: #A4ACB9;
    border-radius: 24px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.switch-button_01:hover {
    opacity: 0.9;
}

.switch-button_01:focus {
    outline: 2px solid #A4ACB9;
    outline-offset: 2px;
}

.frame-1410103916_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.form {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.form_01 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.form_02 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.frame-1410103916_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}

.button:hover {
    background: #F5F5F5;
}

.frame-1410103915 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.form_03 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
}

.form_04 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: inline-flex;
}

.frame-1410103917 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
}

.frame-1410103870 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-1410103916 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
}

.frame-1410103917_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
}

.frame-2147227655 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
}

.icon-list {
    display: none;
}

.icon-list:hover {
    opacity: 0.7;
}

.icon-list:active {
    opacity: 0.5;
}

.icon-list img {
    width: 24px;
    height: 18px;
}

.navbar {
    align-self: stretch;
    padding: 12px 24px 12px 24px;
    border-radius: 20px;
    border: 1px solid #DCDCDC;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
}

.frame-1410103869 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
}

.frame-1410103888 {
    align-self: stretch;
    padding: 16px;
    background: white;
    overflow: hidden;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-1410103889 {
    align-self: stretch;
    padding: 16px;
    overflow: hidden;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-1410103919 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.account-settings {
    width: 100%;
    height: 100%;
    padding: 24px 100px 48px 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: inline-flex;
}

.action-buttons {
    align-self: stretch;
    padding: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
}

.save-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #438BFF;
    color: white;
    border: none;
    border-radius: 12px;
    box-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    transition: all 0.2s ease;
}

.save-button:hover {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.cancel-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    color: #727272;
    border: 1px #DCDCDC solid;
    border-radius: 12px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    transition: all 0.2s ease;
}

.cancel-button:hover {
    background: #F5F5F5;
    border-color: #B0B0B0;
}

/* Subscription Plan Section Styles */
.subscriptionplan_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
}

.form_subscription {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

.subscription-info {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.subscription-plan-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    border-radius: 20px;
    width: fit-content;
}

.subscription-plan-badge.premium {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    box-shadow: 0px 2px 8px rgba(255, 165, 0, 0.3);
}

.subscription-plan-badge.free {
    background: #E8E8E8;
}

.plan-name {
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    color: #333;
}

.subscription-plan-badge.premium .plan-name {
    color: #5C4800;
}

.subscription-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    background: #F9F9F9;
    border-radius: 12px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
}

.detail-value {
    color: #333;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 600;
}

.manage-subscription-button {
    padding: 12px 24px;
    background: white;
    border: 1px solid #DCDCDC;
    border-radius: 12px;
    color: #438BFF;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: fit-content;
}

.manage-subscription-button:hover {
    background: #F5F5F5;
    border-color: #438BFF;
}

.subscription-cta {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.cta-text {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    margin: 0;
}

.upgrade-button {
    padding: 12px 24px;
    background: linear-gradient(135deg, #438BFF 0%, #6C63FF 100%);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    width: fit-content;
    box-shadow: 0px 4px 12px rgba(67, 139, 255, 0.3);
}

.upgrade-button:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 16px rgba(67, 139, 255, 0.4);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
    .account-settings {
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 16px;
        padding-bottom: 24px;
        gap: 24px;
    }

    .navbar {
        padding-left: 12px;
        padding-right: 12px;
    }

    .logo-text-full {
        width: 140px;
        height: 26px;
    }

    .frame-1410103888,
    .frame-1410103889 {
        padding: 12px;
        gap: 24px;
    }

    .frame-1410103916 {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .frame-1410103915 {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .profile_span {
        line-height: 24px;
    }

    .button_01 {
        width: 100%;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .editprofile_span {
        font-size: 14px;
    }

    .frame-1410103917 {
        gap: 12px;
    }

    .frame-1410103916_01 {
        gap: 16px;
    }

    .profilepicture_span {
        font-size: 18px;
        line-height: 22px;
    }

    .ellipse-10 {
        width: 64px;
        height: 64px;
    }

    .name_span,
    .email_span,
    .languagebooks_span {
        font-size: 16px;
        line-height: 22px;
    }

    .drawtopiakids_span,
    .drawtopiagmailcom_span,
    .english_span {
        font-size: 14px;
        line-height: 20px;
    }

    .emailpreferences_span {
        font-size: 18px;
        line-height: 22px;
    }

    .onboardingemails_span,
    .productupdatesannouncements_span {
        font-size: 16px;
        line-height: 22px;
    }

    .guidesandtipstohelpyougetstarted_span,
    .newfeaturesimprovementsandnews_span {
        font-size: 14px;
        line-height: 20px;
    }

    .form_03,
    .form_04 {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .switch-button,
    .switch-button_01 {
        width: 48px;
        padding: 5px;
    }

    .ellipse-11,
    .ellipse-11_01 {
        width: 18px;
        height: 18px;
    }

    .frame-1410103869 {
        gap: 16px;
    }

    .button {
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 12px;
        padding-bottom: 12px;
    }

    .accountsettings_01_span {
        font-size: 16px;
        line-height: 22px;
    }

    .arrowleft-icon {
        width: auto;
        height: auto;
    }

    .action-buttons {
        flex-direction: column;
        gap: 12px;
    }

    .save-button,
    .cancel-button {
        width: 100%;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .icon-list {
        width: 32px;
        height: 32px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: opacity 0.2s;
    }
}

@media (max-width: 480px) {
    .account-settings {
        padding: 24px 16px 32px 16px;
        gap: 20px;
    }

    .frame-1410103888,
    .frame-1410103889 {
        padding: 16px;
        gap: 20px;
        border-radius: 16px;
    }

    .frame-1410103919 {
        gap: 20px;
    }

    .frame-1410103916_01,
    .frame-1410103916_02 {
        gap: 12px;
    }

    .frame-1410103917,
    .frame-1410103917_01 {
        gap: 10px;
    }

    .profile_span {
        line-height: 22px;
    }

    .emailpreferences_span {
        font-size: 16px;
        line-height: 20px;
    }

    .button_01 {
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 8px;
        padding-bottom: 8px;
    }

    .form_03,
    .form_04 {
        gap: 6px;
    }

    .switch-button,
    .switch-button_01 {
        width: 44px;
        padding: 4px;
    }
}
</style>