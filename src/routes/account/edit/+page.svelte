<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";
    import drawtopialogo from "../../../assets/logo.png";
    import arrowLeft from "../../../assets/ArrowLeft.svg";
    import caretdown from "../../../assets/CaretDown.svg";
    import camera from "../../../assets/Camera.svg";
    import selectLayerIcon from "../../../assets/List.svg";
    import { goto } from "$app/navigation";
    import { auth } from "../../../lib/stores/auth";
    import { getUserProfile } from "../../../lib/auth";
    import { supabase } from "../../../lib/supabase";
    import { uploadAvatar } from "../../../lib/storage";
    import AccountDropdown from "../../../components/AccountDropdown.svelte";

    // User data state
    let userName = "Alex Smith";
    let userEmail = "drawtopia@gmail.com";
    let userLanguage = "English";
    let userAvatarUrl = "https://placehold.co/40x40";
    let userProfilePicture = "https://placehold.co/120x120";
    let subscriptionPlan = "Free Plan";
    let lastFetchedUserId: string | null = null;
    
    // Form state
    let firstName = "";
    let lastName = "";
    let email = "";
    let accountLanguage = "English";
    let isSaving = false;
    let isUploading = false;
    let uploadProgress = 0;
    let fileInput: HTMLInputElement | null = null;
    
    // Subscription state
    let subscriptionStatus = "free";
    let planType = "";
    let currentPeriodEnd: Date | null = null;
    let isSubscriptionActive = false;
    let isCancelling = false;
    let showCancelConfirmModal = false;
    let stripeSubscriptionId: string | null = null;
    
    // API Base URL
    const API_BASE_URL = "https://drawtopia-backend.vercel.app";

    // Get name and email from auth session (stored in localStorage by Supabase)
    function getAuthInfo() {
        if (!browser) return;
        
        const authState = get(auth);
        if (authState.user) {
            // Get email from auth user
            userEmail = authState.user.email || "";
            email = authState.user.email || "";
            
            // Get name from user_metadata or construct from metadata
            if (authState.user.user_metadata?.full_name) {
                userName = authState.user.user_metadata.full_name;
                const nameParts = authState.user.user_metadata.full_name.split(' ');
                if (nameParts.length > 0) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ') || '';
                }
            } else if (authState.user.user_metadata?.name) {
                userName = authState.user.user_metadata.name;
                const nameParts = authState.user.user_metadata.name.split(' ');
                if (nameParts.length > 0) {
                    firstName = nameParts[0];
                    lastName = nameParts.slice(1).join(' ') || '';
                }
            } else if (authState.user.user_metadata?.first_name || authState.user.user_metadata?.last_name) {
                firstName = authState.user.user_metadata.first_name || '';
                lastName = authState.user.user_metadata.last_name || '';
                userName = `${firstName} ${lastName}`.trim();
            } else {
                // Fallback to email username if no name available
                userName = authState.user.email?.split('@')[0] || "Alex Smith";
                firstName = userName;
                lastName = "";
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
                    const profile = Array.isArray(result.profile) 
                        ? result.profile[0] 
                        : result.profile;
                    
                    if (profile) {
                        // Set first and last name from users table if available
                        if (profile.first_name) {
                            firstName = profile.first_name;
                        }
                        if (profile.last_name) {
                            lastName = profile.last_name;
                        }
                        if (profile.full_name) {
                            userName = profile.full_name;
                            const nameParts = profile.full_name.split(' ');
                            if (nameParts.length > 0 && !profile.first_name) {
                                firstName = nameParts[0];
                                lastName = nameParts.slice(1).join(' ') || '';
                            }
                        }

                        // Get avatar URL from users table or user metadata
                        if (authState.user.user_metadata?.avatar_url) {
                            userAvatarUrl = authState.user.user_metadata.avatar_url;
                            userProfilePicture = authState.user.user_metadata.avatar_url;
                        } else if (authState.user.user_metadata?.picture) {
                            userAvatarUrl = authState.user.user_metadata.picture;
                            userProfilePicture = authState.user.user_metadata.picture;
                        } else {
                            userAvatarUrl = "https://placehold.co/40x40";
                            userProfilePicture = "https://placehold.co/120x120";
                        }
                    }
                }
                
                // Fetch subscription details
                await fetchSubscriptionDetails(authState.user.id);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        }
    }
    
    // Fetch subscription details from subscriptions table and users table
    async function fetchSubscriptionDetails(userId: string) {
        try {
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
                stripeSubscriptionId = subscriptionData.stripe_subscription_id || null;
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
                stripeSubscriptionId = null;
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
    
    // Format subscription status for display
    function formatSubscriptionStatus(status: string | null | undefined): string {
        if (!status) return "Free Plan";
        
        const statusMap: { [key: string]: string } = {
            'premium': 'Premium Plan',
            'free plan': 'Free Plan',
            'free': 'Free Plan',
            'trial': 'Trial Plan',
            'basic': 'Basic Plan'
        };
        
        const normalizedStatus = status.toLowerCase();
        return statusMap[normalizedStatus] || status.charAt(0).toUpperCase() + status.slice(1) + ' Plan';
    }
    
    // Show cancel confirmation modal
    function showCancelConfirmation() {
        showCancelConfirmModal = true;
    }
    
    // Close cancel confirmation modal
    function closeCancelConfirmation() {
        showCancelConfirmModal = false;
    }
    
    // Handle subscription cancellation
    async function handleCancelSubscription() {
        if (isCancelling) return;
        isCancelling = true;
        
        try {
            const authState = get(auth);
            if (!authState.session?.access_token) {
                throw new Error("Not authenticated");
            }
            
            if (!stripeSubscriptionId) {
                throw new Error("No active subscription found");
            }
            
            const response = await fetch(`${API_BASE_URL}/api/subscriptions/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.session.access_token}`
                },
                body: JSON.stringify({
                    stripe_subscription_id: stripeSubscriptionId
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to cancel subscription');
            }
            
            // Update local state
            isSubscriptionActive = false;
            subscriptionStatus = "free";
            subscriptionPlan = "Free Plan";
            planType = "";
            currentPeriodEnd = null;
            stripeSubscriptionId = null;
            
            // Close modal and show success message
            showCancelConfirmModal = false;
            alert("Your subscription has been cancelled successfully. You'll retain access until the end of your current billing period.");
            
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            alert(error instanceof Error ? error.message : 'Failed to cancel subscription. Please try again.');
        } finally {
            isCancelling = false;
        }
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
        goto("/account");
    }

    async function handleSave() {
        if (isSaving) return;
        isSaving = true;

        try {
            const authState = get(auth);
            if (!authState.user) {
                console.error("User not authenticated");
                return;
            }

            // Update user profile in database
            const { error } = await supabase
                .from('users')
                .update({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    updated_at: new Date().toISOString()
                })
                .eq('id', authState.user.id);

            if (error) {
                console.error("Error updating profile:", error);
                alert("Failed to save changes. Please try again.");
            } else {
                // Navigate back to account page
                goto("/account");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            isSaving = false;
        }
    }

    function handleCancel() {
        goto("/account");
    }

    function handleEditProfilePicture() {
        // Trigger the hidden file input to open file picker
        if (fileInput) {
            fileInput.click();
        }
    }

    async function handleFileSelected(event: Event) {
        const target = event.target as HTMLInputElement;
        if (!target || !target.files || target.files.length === 0) return;
        const file = target.files[0];
        // Basic client-side validation
        if (!file) return;

        const authState = get(auth);
        const userId = authState?.user?.id;

        isUploading = true;
        uploadProgress = 0;

        try {
            const result = await uploadAvatar(file, userId, (p) => {
                uploadProgress = p;
            });

            if (!result.success) {
                alert(result.error || 'Failed to upload image');
                return;
            }

            if (result.url) {
                // Update UI
                userAvatarUrl = result.url;
                userProfilePicture = result.url;

                // Update users table avatar_url
                if (userId) {
                    const { error } = await supabase
                        .from('users')
                        .update({ avatar_url: result.url, updated_at: new Date().toISOString() })
                        .eq('id', userId);
                    if (error) {
                        console.error('Failed to update users table avatar_url:', error);
                    }

                    // Attempt to update auth user metadata so other parts of the app pick it up
                    try {
                        await supabase.auth.updateUser({ data: { avatar_url: result.url } });
                    } catch (err) {
                        // Non-fatal
                        console.warn('Could not update auth user metadata:', err);
                    }
                }
            }

        } catch (err) {
            console.error('Error uploading avatar:', err);
            alert('An error occurred while uploading the image.');
        } finally {
            isUploading = false;
            uploadProgress = 0;
            // Reset file input so same file can be selected again if needed
            if (fileInput) {
                fileInput.value = '';
            }
        }
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
                <div class="profile"><span class="profile_span">Profile Settings</span></div>
            </div>
            
            <!-- Profile Picture Section -->
            <div class="frame-1410103917">
                <div class="frame-1410103916_01">
                    <div class="frame-1410103915_01">
                        <div><span class="profilepicture_span">Profile Picture</span></div>
                    </div>
                    
                    <div class="edit-profile-picture-link">
                        <div class="edit-link">
                            <span class="editprofilepicture_span">Edit Profile Picture</span>
                        </div>
                    </div>
                    <div class="profile-picture-wrapper">
                        <img class="ellipse-10" src={userProfilePicture} alt="User profile" />
                        <button class="camera-button" title="Change profile picture" on:click={handleEditProfilePicture}>
                            <img src={camera} alt="camera" class="camera-icon" />
                        </button>
                        <!-- Hidden file input triggered by camera button -->
                        <input
                            type="file"
                            accept="image/*"
                            bind:this={fileInput}
                            on:change={handleFileSelected}
                            style="display:none"
                        />

                        {#if isUploading}
                            <div class="upload-progress" aria-hidden="true">Uploading {uploadProgress}%</div>
                        {/if}
                    </div>
                </div>
            </div>
            
            <div class="rectangle-39"></div>
            
            <!-- Name Section -->
            <div class="form">
                <div class="frame-1410103918">
                    <div class="form-label-wrapper">
                        <div><span class="name_span">Name</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Edit your First Name and Last Name</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="firstName">First Name</label>
                            <input 
                                id="firstName"
                                type="text" 
                                class="input-field" 
                                bind:value={firstName}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="lastName">Last Name</label>
                            <input 
                                id="lastName"
                                type="text" 
                                class="input-field" 
                                bind:value={lastName}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rectangle-38"></div>
            
            <!-- Email Section -->
            <div class="form_01">
                <div class="frame-1410103918_01">
                    <div class="form-label-wrapper">
                        <div><span class="email_span">Email</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Edit your new email</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="email">Enter your email</label>
                            <input 
                                id="email"
                                type="email" 
                                class="input-field" 
                                bind:value={email}
                                placeholder="Enter your email"
                            />
                        </div>
                        <div class="input-group">
                            <label class="input-label" for="emailConfirm">Confirm email</label>
                            <input 
                                id="emailConfirm"
                                type="email" 
                                class="input-field" 
                                value={email}
                                placeholder="Confirm email"
                                readonly
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rectangle-37"></div>
            
            <!-- Language Section -->
            <div class="form_02">
                <div class="frame-1410103918_02">
                    <div class="form-label-wrapper">
                        <div><span class="language_span">Language</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Select your Language</span>
                    </div>
                    <div class="form-inputs">
                        <div class="input-group">
                            <label class="input-label" for="accountLanguage">Account Language</label>
                            <div class="select-wrapper">
                                <select id="accountLanguage" class="select-field" bind:value={accountLanguage}>
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="German">German</option>
                                    <option value="Italian">Italian</option>
                                    <option value="Portuguese">Portuguese</option>
                                </select>
                                <img src={caretdown} alt="dropdown" class="select-icon" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="rectangle-subscription"></div>
            
            <!-- Subscription Management Section -->
            <div class="form_subscription">
                <div class="frame-subscription">
                    <div class="form-label-wrapper">
                        <div><span class="subscription_span">Subscription Plan</span></div>
                    </div>
                    <div class="form-subtitle">
                        <span class="formsubtitle_span">Manage your subscription</span>
                    </div>
                    
                    <div class="subscription-content">
                        <div class="subscription-status-row">
                            <span class="status-label">Current Plan:</span>
                            <div class="subscription-plan-badge" class:premium={isSubscriptionActive} class:free={!isSubscriptionActive}>
                                <span class="plan-name">{formatSubscriptionStatus(subscriptionStatus)}</span>
                            </div>
                        </div>
                        
                        {#if isSubscriptionActive}
                            <div class="subscription-details">
                                <div class="detail-row">
                                    <span class="detail-label">Billing Cycle:</span>
                                    <span class="detail-value">{planType === 'yearly' ? 'Yearly ($179.88/year)' : 'Monthly ($14.99/month)'}</span>
                                </div>
                                {#if currentPeriodEnd}
                                    <div class="detail-row">
                                        <span class="detail-label">Next Billing Date:</span>
                                        <span class="detail-value">{formatDate(currentPeriodEnd)}</span>
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="subscription-actions">
                                <button class="cancel-subscription-button" on:click={showCancelConfirmation} disabled={isCancelling}>
                                    <span>{isCancelling ? 'Cancelling...' : 'Cancel Subscription'}</span>
                                </button>
                            </div>
                        {:else}
                            <div class="subscription-upgrade-cta">
                                <p class="cta-description">Upgrade to Premium to unlock unlimited stories and premium features!</p>
                                <button class="upgrade-button" on:click={() => goto('/pricing')}>
                                    <span>Upgrade to Premium</span>
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="action-buttons">
                <button class="cancel-button" on:click={handleCancel} disabled={isSaving}>
                    <span>Cancel</span>
                </button>
                <button class="save-button" on:click={handleSave} disabled={isSaving}>
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Cancel Subscription Confirmation Modal -->
{#if showCancelConfirmModal}
    <div class="modal-overlay" on:click={closeCancelConfirmation} on:keydown={(e) => e.key === 'Escape' && closeCancelConfirmation()} role="button" tabindex="0">
        <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title" tabindex="-1">
            <div class="modal-header">
                <h2 id="cancel-modal-title" class="modal-title">Cancel Subscription?</h2>
            </div>
            <div class="modal-body">
                <p class="modal-text">Are you sure you want to cancel your subscription?</p>
                <ul class="cancel-info-list">
                    <li>You'll lose access to premium features at the end of your current billing period</li>
                    <li>Your stories and data will remain saved</li>
                    <li>You can resubscribe anytime</li>
                </ul>
                {#if currentPeriodEnd}
                    <p class="access-until-text">You'll have access until <strong>{formatDate(currentPeriodEnd)}</strong></p>
                {/if}
            </div>
            <div class="modal-actions">
                <button class="modal-cancel-button" on:click={closeCancelConfirmation} disabled={isCancelling}>
                    <span>Keep Subscription</span>
                </button>
                <button class="modal-confirm-button" on:click={handleCancelSubscription} disabled={isCancelling}>
                    <span>{isCancelling ? 'Cancelling...' : 'Yes, Cancel'}</span>
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
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
    flex: 1 1 0;
}

.profilepicture_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.camera-icon {
    width: 20px;
    height: 20px;
}

.camera-button {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    background: #438BFF;
    border-radius: 50%;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0px 2px 8px rgba(67, 139, 255, 0.3);
    transition: all 0.2s ease;
}

.camera-button:hover {
    background: #3570E0;
    transform: scale(1.1);
    box-shadow: 0px 4px 12px rgba(67, 139, 255, 0.4);
}

.ellipse-10 {
    width: 120px;
    height: 120px;
    background: #D9D9D9;
    border-radius: 9999px;
}

.rectangle-39,
.rectangle-38,
.rectangle-37 {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
    margin: 24px 0;
}

.name_span,
.email_span,
.language_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.formsubtitle_span {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
}

.form-subtitle {
    margin-top: 4px;
    margin-bottom: 16px;
}

.form-inputs {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.input-label {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 25.20px;
}

.input-field {
    padding: 12px 16px;
    border: 1px solid #DCDCDC;
    border-radius: 12px;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    color: #121212;
    background: white;
    outline: none;
    transition: border-color 0.2s ease;
}

.input-field:focus {
    border-color: #438BFF;
    outline: 2px solid rgba(67, 139, 255, 0.1);
    outline-offset: 2px;
}

.input-field:read-only {
    background: #F5F5F5;
    color: #727272;
    cursor: not-allowed;
}

.select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.select-field {
    width: 100%;
    padding: 12px 40px 12px 16px;
    border: 1px solid #DCDCDC;
    border-radius: 12px;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 400;
    color: #121212;
    background: white;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.select-field:focus {
    border-color: #438BFF;
    outline: 2px solid rgba(67, 139, 255, 0.1);
    outline-offset: 2px;
}

.select-icon {
    position: absolute;
    right: 16px;
    width: 20px;
    height: 20px;
    pointer-events: none;
}

.frame-1410103915_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 0;
    display: flex;
    flex-direction: column;
}

.frame-1410103918,
.frame-1410103918_01,
.frame-1410103918_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
    width: 100%;
}

.frame-1410103916_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
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
    height: auto;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
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

.form,
.form_01,
.form_02 {
    align-self: stretch;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
}

/* Subscription Section Styles */
.rectangle-subscription {
    align-self: stretch;
    height: 1px;
    background: #D9D9D9;
    margin: 24px 0;
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

.frame-subscription {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
    width: 100%;
}

.subscription_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
}

.subscription-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    margin-top: 8px;
}

.subscription-status-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.status-label {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
}

.subscription-plan-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 14px;
    border-radius: 16px;
}

.subscription-plan-badge.premium {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    box-shadow: 0px 2px 8px rgba(255, 165, 0, 0.3);
}

.subscription-plan-badge.free {
    background: #E8E8E8;
}

.plan-name {
    font-size: 14px;
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
    padding: 16px;
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

.subscription-actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
}

.cancel-subscription-button {
    padding: 12px 24px;
    background: white;
    border: 1px solid #FF4D4D;
    border-radius: 12px;
    color: #FF4D4D;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.cancel-subscription-button:hover:not(:disabled) {
    background: #FFF5F5;
    border-color: #E53E3E;
}

.cancel-subscription-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.subscription-upgrade-cta {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: linear-gradient(135deg, #F0F7FF 0%, #E8F0FE 100%);
    border-radius: 12px;
    border: 1px solid #D4E4FF;
}

.cta-description {
    color: #333;
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

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px;
}

.modal-content {
    background: white;
    border-radius: 20px;
    padding: 24px;
    max-width: 480px;
    width: 100%;
    box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.2);
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    margin-bottom: 16px;
}

.modal-title {
    font-size: 22px;
    font-family: Quicksand;
    font-weight: 600;
    color: #333;
    margin: 0;
}

.modal-body {
    margin-bottom: 24px;
}

.modal-text {
    font-size: 16px;
    font-family: DM Sans;
    color: #555;
    margin: 0 0 16px 0;
}

.cancel-info-list {
    list-style: none;
    padding: 0;
    margin: 0 0 16px 0;
}

.cancel-info-list li {
    position: relative;
    padding-left: 24px;
    margin-bottom: 8px;
    font-size: 14px;
    font-family: DM Sans;
    color: #666;
}

.cancel-info-list li::before {
    content: "•";
    position: absolute;
    left: 8px;
    color: #999;
}

.access-until-text {
    font-size: 14px;
    font-family: DM Sans;
    color: #438BFF;
    margin: 0;
    padding: 12px;
    background: #F0F7FF;
    border-radius: 8px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
}

.modal-cancel-button {
    padding: 12px 24px;
    background: #438BFF;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-cancel-button:hover:not(:disabled) {
    background: #3570E0;
}

.modal-cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.modal-confirm-button {
    padding: 12px 24px;
    background: white;
    border: 1px solid #FF4D4D;
    border-radius: 12px;
    color: #FF4D4D;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-confirm-button:hover:not(:disabled) {
    background: #FFF5F5;
}

.modal-confirm-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.frame-1410103869 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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
    padding: 12px 24px;
    border-radius: 20px;
    border: 1px solid #DCDCDC;
    justify-content: space-between;
    align-items: center;
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

.profile-picture-wrapper {
    position: relative;
    display: inline-block;
}

.upload-progress {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -32px;
    background: white;
    padding: 6px 10px;
    border-radius: 10px;
    font-size: 13px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.08);
    color: #333;
}

.form-label-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-buttons {
    align-self: stretch;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
}

.save-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438BFF;
    color: white;
    border: none;
    border-radius: 20px;
    box-shadow: 0px 4px 4px rgba(255, 255, 255, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    transition: all 0.2s ease;
}

.save-button:hover:not(:disabled) {
    background: #3570E0;
    transform: translateY(-1px);
    box-shadow: 0px 6px 8px rgba(255, 255, 255, 0.3);
}

.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cancel-button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    color: #727272;
    border: 1px #DCDCDC solid;
    border-radius: 20px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
    background: #F5F5F5;
    border-color: #B0B0B0;
}

.cancel-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.edit-profile-picture-link {
    display: flex;
    align-items: center;
    margin-top: 8px;
}

.edit-link {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.edit-link:hover {
    opacity: 0.7;
}

.editprofilepicture_span {
    color: #727272;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 25.20px;
    word-wrap: break-word;
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

    /* Subscription Mobile Styles */
    .subscription-status-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .subscription-details {
        padding: 12px;
    }
    
    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .subscription-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .cancel-subscription-button,
    .upgrade-button {
        width: 100%;
        text-align: center;
        justify-content: center;
    }
    
    .modal-content {
        padding: 20px;
        margin: 16px;
    }
    
    .modal-title {
        font-size: 18px;
    }
    
    .modal-actions {
        flex-direction: column-reverse;
    }
    
    .modal-cancel-button,
    .modal-confirm-button {
        width: 100%;
        justify-content: center;
    }
    
    .rectangle-subscription {
        margin: 16px 0;
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

    .logo-text-full {
        width: 140px;
        height: 26px;
    }

    .frame-1410103888 {
        padding: 16px;
        gap: 24px;
    }

    .frame-1410103919 {
        gap: 24px;
    }

    .frame-1410103869 {
        gap: 16px;
    }

    .frame-1410103916 {
        gap: 20px;
    }

    .frame-1410103917 {
        gap: 12px;
    }

    .frame-1410103916_01 {
        gap: 12px;
        flex-direction: column;
        align-items: flex-start;
    }

    .frame-1410103915_01 {
        width: 100%;
    }

    .profile-picture-wrapper {
        align-self: flex-start;
    }

    .profile_span {
        line-height: 24px;
    }

    .profilepicture_span {
        font-size: 18px;
        line-height: 24px;
    }

    .editprofilepicture_span {
        font-size: 16px;
        line-height: 22.40px;
    }

    .ellipse-10 {
        width: 100px;
        height: 100px;
    }

    .camera-button {
        width: 32px;
        height: 32px;
        bottom: 4px;
        right: 4px;
    }

    .camera-icon {
        width: 16px;
        height: 16px;
    }

    .name_span,
    .email_span,
    .language_span {
        font-size: 18px;
        line-height: 24px;
    }

    .formsubtitle_span {
        font-size: 16px;
        line-height: 22.40px;
    }

    .form-subtitle {
        margin-bottom: 12px;
    }

    .form-inputs {
        gap: 12px;
    }

    .input-label {
        font-size: 16px;
        line-height: 22.40px;
    }

    .input-field {
        padding: 10px 14px;
        font-size: 16px;
        border-radius: 10px;
    }

    .select-field {
        padding: 10px 36px 10px 14px;
        font-size: 16px;
        border-radius: 10px;
    }

    .select-icon {
        right: 12px;
        width: 18px;
        height: 18px;
    }

    .action-buttons {
        flex-direction: column;
        gap: 12px;
        margin-top: 4px;
    }

    .save-button,
    .cancel-button {
        width: 100%;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 14px;
        padding-bottom: 14px;
        font-size: 16px;
        border-radius: 16px;
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

    .rectangle-39,
    .rectangle-38,
    .rectangle-37 {
        margin: 16px 0;
    }

    .form-label-wrapper {
        gap: 6px;
    }

    .input-group {
        gap: 6px;
    }
}

@media (max-width: 480px) {
    .account-settings {
        padding: 24px 16px 32px 16px;
        gap: 20px;
    }

    .navbar {
        padding-left: 12px;
        padding-right: 12px;
    }

    .logo-text-full {
        width: 140px;
        height: 26px;
    }

    .frame-1410103888 {
        padding: 16px;
        gap: 20px;
        border-radius: 16px;
    }

    .frame-1410103919 {
        gap: 20px;
    }

    .frame-1410103869 {
        gap: 12px;
    }

    .frame-1410103916 {
        gap: 16px;
    }

    .frame-1410103917 {
        gap: 10px;
    }

    .frame-1410103916_01 {
        gap: 10px;
        flex-direction: column;
        align-items: flex-start;
    }

    .frame-1410103915_01 {
        width: 100%;
    }

    .edit-profile-picture-link {
        width: 100%;
    }

    .profile-picture-wrapper {
        align-self: flex-start;
    }

    .profile_span {
        line-height: 22px;
    }

    .profilepicture_span {
        font-size: 16px;
        line-height: 22px;
    }

    .editprofilepicture_span {
        font-size: 14px;
        line-height: 19.60px;
    }

    .ellipse-10 {
        width: 80px;
        height: 80px;
    }

    .camera-button {
        width: 28px;
        height: 28px;
        bottom: 2px;
        right: 2px;
    }

    .camera-icon {
        width: 14px;
        height: 14px;
    }

    .rectangle-39,
    .rectangle-38,
    .rectangle-37 {
        margin: 12px 0;
        height: 1px;
    }

    .name_span,
    .email_span,
    .language_span {
        font-size: 16px;
        line-height: 22px;
    }

    .formsubtitle_span {
        font-size: 14px;
        line-height: 19.60px;
    }

    .form-subtitle {
        margin-top: 2px;
        margin-bottom: 10px;
    }

    .form-inputs {
        gap: 10px;
    }

    .input-group {
        gap: 4px;
    }

    .input-label {
        font-size: 14px;
        line-height: 19.60px;
    }

    .input-field {
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 8px;
    }

    .input-field:focus {
        outline-offset: 1px;
    }

    .select-field {
        padding: 8px 32px 8px 12px;
        font-size: 14px;
        border-radius: 8px;
    }

    .select-field:focus {
        outline-offset: 1px;
    }

    .select-icon {
        right: 10px;
        width: 16px;
        height: 16px;
    }

    .action-buttons {
        gap: 10px;
        margin-top: 0;
    }

    .save-button,
    .cancel-button {
        padding-left: 16px;
        padding-right: 16px;
        padding-top: 12px;
        padding-bottom: 12px;
        font-size: 15px;
        border-radius: 12px;
    }

    .form-label-wrapper {
        gap: 4px;
    }

    .frame-1410103918,
    .frame-1410103918_01,
    .frame-1410103918_02 {
        gap: 2px;
    }

    .form,
    .form_01,
    .form_02 {
        gap: 2px;
        padding-top: 0;
        padding-bottom: 0;
    }

    .upload-progress {
        font-size: 11px;
        padding: 4px 8px;
        bottom: -28px;
    }
}
</style>

