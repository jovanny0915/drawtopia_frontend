<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    import arrow_left from "../../../../assets/ArrowLeft.svg";
    import logo from "../../../../assets/logo.png";
    import shieldstart from "../../../../assets/ShieldStar.svg";
    import star from "../../../../assets/star.png";
    import CalendarBlank from "../../../../assets/CalendarBlank.svg";

    import { giftCreation } from "../../../../lib/stores/giftCreation";
    import {
        user,
        authLoading,
        isAuthenticated,
    } from "../../../../lib/stores/auth";
    import PrimarySelect from "../../../../components/PrimarySelect.svelte";
    import GiftStepComponent from "../../../../components/GiftStepComponent.svelte";
    import AdvancedSelect from "../../../../components/AdvancedSelect.svelte";

    // Age group options
    const ageGroupOptions = [
        { value: "0-2", label: "👶 Ages 0-2 (Reserved)", disabled: true },
        { value: "3-6", label: "👶 Ages 3-6 (Imagination Builders)" },
        { value: "7-10", label: "👶 Ages 7-10 (Developing Readers)" },
        { value: "11-12", label: "🧑 Ages 11-12 (Independent Readers)" },
    ];

    // Occasion options
    const occasionOptions = [
        { value: "birthday", label: "Birthday" },
        { value: "graduation", label: "Graduation" },
        { value: "first-day-school", label: "First Day of School" },
        { value: "sibling", label: "Sibling" },
        { value: "just-because", label: "Just Because" },
        { value: "holiday-christmas", label: "Holiday / Christmas" },
    ];

    let parentEmail = "";
    let selectedAgeGroup = "";
    let childName = "";
    let dedicationMessage = "";
    let selectedOccasion = "";
    let deliveryDate = "";
    let deliveryTime = "";

    let characterCount = 0;
    const maxCharacters = 200;
    let scheduleDelivery = false;

    // Reactive statements for auth state
    $: currentUser = $user;
    $: loading = $authLoading;
    $: authenticated = $isAuthenticated;
    $: safeToRedirect = browser && !loading && currentUser !== undefined;

    // Update character count
    $: characterCount = dedicationMessage.length;

    // Check authentication on mount (client-side only)
    onMount(() => {
        if (browser) {
            setTimeout(() => {
                if (safeToRedirect && !authenticated) {
                    goto("/login");
                    return;
                }
            }, 100);
        }
    });

    // Reactive redirect when auth state changes
    $: if (safeToRedirect && !authenticated) {
        goto("/login");
    }

    const handleAgeGroupChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        selectedAgeGroup = target.value;
    };

    const handleOccasionChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        selectedOccasion = target.value;
    };

    const handleDedicationChange = (event: Event) => {
        const target = event.target as HTMLTextAreaElement;
        if (target.value.length <= maxCharacters) {
            dedicationMessage = target.value;
        }
    };

    const handleContinue = () => {
        // Validate required fields
        if (!parentEmail.trim()) {
            alert("Please enter parent's email");
            return;
        }
        if (!selectedAgeGroup) {
            alert("Please select child's age group");
            return;
        }
        if (!childName.trim()) {
            alert("Please enter child's name");
            return;
        }
        if (!selectedOccasion) {
            alert("Please select an occasion");
            return;
        }

        // Validate scheduled delivery date and time
        if (scheduleDelivery) {
            if (!deliveryDate) {
                alert("Please select a delivery date");
                return;
            }
            if (!deliveryTime) {
                alert("Please select a delivery time");
                return;
            }
            
            // Validate that the scheduled date/time is in the future
            const scheduledDateTime = new Date(`${deliveryDate}T${deliveryTime}`);
            const now = new Date();
            if (scheduledDateTime <= now) {
                alert("Please select a future date and time for delivery");
                return;
            }
        }

        // Save data to store
        giftCreation.setRecipientDetails({
            childName,
            ageGroup: selectedAgeGroup,
            relationship: "parent", // Default for send link flow
        });

        giftCreation.setOccasionAndStory({
            occasion: selectedOccasion,
        });

        // Combine date and time into ISO string for scheduled delivery
        let deliveryDateTime = undefined;
        if (scheduleDelivery && deliveryDate && deliveryTime) {
            const dateTime = new Date(`${deliveryDate}T${deliveryTime}`);
            deliveryDateTime = dateTime.toISOString();
        }

        // Save delivery details including parent email as delivery email
        giftCreation.setDeliveryDetails({
            deliveryEmail: parentEmail,
            deliveryTime: deliveryDateTime,
            deliveryOption: scheduleDelivery ? 'scheduled' : 'surprise',
        });

        // Navigate to next step
        goto("/gift/sendlink/2");
    };

    const handleBack = () => {
        goto("/gift/1");
    };
</script>

<div class="send-link-page">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={logo} alt="logo" class="logo-img">
        </div>
    </div>

    <div class="content">
        <div class="divider">
            <div class="header">
                <h1 class="title">Send Creation Link</h1>
                <p class="subtitle">Copy and send the link to your recipient</p>
            </div>

            <div class="preview-button">
                <img src={shieldstart} alt="shield" class="preview-icon" />
                <span>2 Free Page Preview</span>
            </div>
        </div>

        <GiftStepComponent
            currentStep={1}
            totalSteps={2}
            stepTitle="Recipient Information"
            stepLabel="Step 1"
        />

        <div class="tip-question">
            <img src={star} alt="star" class="star-icon" />
            <div class="tip-question-container">
                <div class="speech-bubble">
                    How do you hisyam want to give your gift?
                </div>
            </div>
        </div>

        <div class="form-container">
            <div class="form-title">Recipient's Information:</div>

            <div class="form-section">
                <div class="form-group">
                    <label class="form-label" for="parent-email"
                        >Parent's Email:</label
                    >
                    <input
                        id="parent-email"
                        type="email"
                        class="form-input"
                        placeholder="Input your Parent's Email"
                        bind:value={parentEmail}
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="age-group"
                        >Childs Age Group</label
                    >
                    <AdvancedSelect
                        id="age-group"
                        options={ageGroupOptions}
                        selectedOption={selectedAgeGroup}
                        onChange={handleAgeGroupChange}
                        placeholder="Select your childs Age Group"
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="child-name"
                        >Child Name:</label
                    >
                    <input
                        id="child-name"
                        type="text"
                        class="form-input"
                        placeholder="Input your child name"
                        bind:value={childName}
                    />
                </div>

                <div class="form-group">
                    <label class="form-label" for="dedication"
                        >Your Dedication Messages for Storybook</label
                    >
                    <textarea
                        id="dedication"
                        class="form-textarea"
                        placeholder="Input your Dedication Messages"
                        bind:value={dedicationMessage}
                        on:input={handleDedicationChange}
                    ></textarea>
                    <div class="character-count">
                        {characterCount}/{maxCharacters} Characters
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="occasion">Occasion</label>
                    <AdvancedSelect
                        id="occasion"
                        options={occasionOptions}
                        selectedOption={selectedOccasion}
                        onChange={handleOccasionChange}
                        placeholder="Select your Occasion"
                    />
                </div>

                <div class="checkbox-group">
                    <input
                        type="checkbox"
                        id="schedule-delivery"
                        class="checkbox"
                        bind:checked={scheduleDelivery}
                    />
                    <label for="schedule-delivery" class="checkbox-label">
                        Schedule delivery for a specific date
                    </label>
                </div>

                {#if scheduleDelivery}
                    <div class="form-group">
                        <label class="form-label" for="delivery-date"
                            >Delivery Date & Time</label
                        >
                        <div class="datetime-input-container">
                            <div class="date-input-wrapper">
                                <input
                                    id="delivery-date"
                                    type="date"
                                    class="form-input date-input"
                                    placeholder="MM/DD/YYYY"
                                    bind:value={deliveryDate}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div class="time-input-wrapper">
                                <input
                                    id="delivery-time"
                                    type="time"
                                    class="form-input time-input"
                                    placeholder="HH:MM"
                                    bind:value={deliveryTime}
                                />
                            </div>
                        </div>
                        <p class="input-hint">Select when the gift link should be sent to the recipient</p>
                    </div>
                {/if}
            </div>
        </div>
        <div class="actions">
            <button class="back-button" on:click={handleBack}>
                <img src={arrow_left} alt="back" class="arrow-icon" />
                Back To Step
            </button>
            <button class="continue-button" on:click={handleContinue}>
                Continue
            </button>
        </div>
    </div>
</div>

<style>
    .send-link-page {
        width: 1240px;
        min-height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        margin: auto;
    }

    .content {
        width: 100%;
        min-height: 1075px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        justify-content: space-between;
    }

    .divider {
        width: 1240px;
        border-bottom: 1px #d9d9d9 solid;
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 24px;
    }

    .navbar {
        align-self: stretch;
        height: 79px;
        padding: 12px 12px 12px 24px;
        border-radius: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .logo-text-full {
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

    .header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        justify-content: space-between;
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
        line-height: 22px;
        color: #121212;
        margin-top: 8px;
    }

    .preview-button {
        margin: auto;
        width: 179px;
        height: 36px;
        border: 1px solid #438bff;
        color: #438bff;
        background-color: #eef6ff;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px 8px 8px;
        border-radius: 99px;
        font-size: 14px;
        line-height: 100%;
        font-family: Quicksand;
    }

    .preview-icon {
        width: 20px;
        height: 20px;
    }

    .tip-question {
        display: flex;
        text-align: center;
        margin: auto;
        width: 531px;
        height: 88px;
        gap: 12px;
    }

    .star-icon {
        width: 88px;
        height: 88px;
    }

    .tip-question-container {
        width: 431px;
        height: 82px;
    }

    .speech-bubble {
        margin-left: 21.5px;
        width: 393px;
        height: 57px;
        border-radius: 24px;
        background-color: #d9eaff;
        padding: 16px 12px 16px 12px;
        font-size: 18px;
        font-style: SemiBold;
        font-weight: 600;
        line-height: 140%;
        color: #141414;
        font-family: Quicksand;
    }

    .form-container {
        background: white;
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        padding: 24px;
        width: 100%;
        max-width: 700px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .form-title {
        font-family: Quicksand;
        font-weight: 600;
        font-size: 24px;
        color: #121212;
    }

    .form-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .form-label {
        font-family: Quicksand;
        font-weight: 600;
        font-size: 16px;
        color: #141414;
    }

    .form-input {
        height: 50px;
        padding: 4px 10px;
        background: white;
        border-radius: 12px;
        outline: 1px #dcdcdc solid;
        border: none;
        font-family: Nunito;
        font-size: 16px;
        color: #141414;
        transition: all 0.2s ease;
    }

    .form-input:focus {
        outline: 2px solid #438bff;
        outline-offset: -2px;
        box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    }

    .form-input::placeholder {
        color: #727272;
    }

    .form-textarea {
        min-height: 168px;
        padding: 10px;
        background: white;
        border-radius: 12px;
        outline: 1px #dcdcdc solid;
        border: none;
        font-family: Nunito;
        font-size: 16px;
        color: #141414;
        resize: vertical;
        transition: all 0.2s ease;
    }

    .form-textarea:focus {
        outline: 2px solid #438bff;
        outline-offset: -2px;
        box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    }

    .form-textarea::placeholder {
        color: #727272;
    }

    .character-count {
        font-family: Nunito;
        font-size: 14px;
        color: #666d80;
        text-align: left;
        margin-top: 4px;
    }

    .checkbox-group {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
    }

    .checkbox {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .checkbox-label {
        font-family: Nunito;
        font-size: 16px;
        color: #141414;
        cursor: pointer;
    }

    .datetime-input-container {
        display: flex;
        gap: 12px;
        width: 100%;
    }

    .date-input-wrapper {
        position: relative;
        flex: 1;
    }

    .time-input-wrapper {
        position: relative;
        flex: 1;
    }

    .date-input,
    .time-input {
        width: 100%;
    }

    .input-hint {
        font-family: Nunito;
        font-size: 14px;
        color: #666d80;
        margin-top: 8px;
        margin-bottom: 0;
    }

    .actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .back-button,
    .continue-button {
        border: none;
        border-radius: 20px;
        padding: 16px 24px;
        cursor: pointer;
        font-family: Quicksand;
        font-weight: 600;
        font-size: 18px;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 10px;
    }

    .back-button {
        background: white;
        outline: 1px #dcdcdc solid;
        color: #121212;
    }

    .back-button:hover {
        background: #f8fafb;
    }

    .continue-button {
        background: #438bff;
        color: white;
    }

    .continue-button:hover {
        background: #3a7ae4;
    }

    .arrow-icon {
        width: 20px;
        height: 20px;
    }

    @media (max-width: 800px) {
        .send-link-page {
            padding: 16px;
            gap: 20px;
        }

        .title {
            font-size: 32px;
            line-height: 44px;
        }

        .subtitle {
            font-size: 16px;
        }

        .form-container {
            padding: 16px;
        }

        .form-title {
            font-size: 20px;
        }

        .datetime-input-container {
            flex-direction: column;
            gap: 12px;
        }

        .actions {
            flex-direction: column-reverse;
            gap: 12px;
        }

        .back-button,
        .continue-button {
            width: 100%;
            justify-content: center;
        }

        .tip-question {
            flex-direction: column;
            gap: 8px;
        }

        .star-icon {
            width: 60px;
            height: 60px;
        }

        .speech-bubble {
            font-size: 16px;
            padding: 12px;
        }
    }
</style>
