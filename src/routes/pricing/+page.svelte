<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import { page } from "$app/stores";
    import drawtopia from "../../assets/logo.png";
    import xicon from "../../assets/X.svg";
    import checkicon from "../../assets/GrayCheck.svg";
    import bluecheckicon from "../../assets/Check_blue.svg";
    import whitecheckicon from "../../assets/WhiteCheck.svg";
    import heavygroup from "../../assets/Heavy-Group.svg";
    import lightgroup from "../../assets/Light-Group.svg";
    import { supabase } from "../../lib/supabase";
    import { user } from "../../lib/stores/auth";

    // API base URL for the backend
    const API_BASE_URL = "https://drawtopia-backend.vercel.app";

    let isLoadingSubscription = false;
    let isLoadingSingleStory = false;
    let isLoadingStoryBundle = false;
    let subscriptionError = "";
    let purchaseError = "";
    
    // Get story ID from URL query parameters
    $: purchaseStoryId = $page.url.searchParams.get('storyId');
    
    // Log when story ID is present
    $: if (purchaseStoryId) {
        console.log('[pricing] Found story ID for purchase:', purchaseStoryId);
    }

    async function handlePurchase(purchaseType: 'single_story' | 'story_bundle') {
        if (isLoadingSingleStory || isLoadingStoryBundle) return;
        
        // Set loading state based on purchase type
        if (purchaseType === 'single_story') {
            isLoadingSingleStory = true;
        } else {
            isLoadingStoryBundle = true;
        }
        
        purchaseError = "";
        
        try {
            // Get current user info from auth store
            let userEmail = null;
            let userId = null;
            
            if ($user) {
                userEmail = $user.email;
                userId = $user.id;
            }
            console.log('[handlePurchase] userEmail:', userEmail);
            console.log('[handlePurchase] userId:', userId);
            console.log('[handlePurchase] purchaseType:', purchaseType);

            // Call the backend to create a Stripe checkout session
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-onetime-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purchase_type: purchaseType,
                    story_id: purchaseStoryId, // Include story ID if available
                    user_email: userEmail,
                    user_id: userId,
                    success_url: `${window.location.origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/pricing`
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create checkout session');
            }
            
            const data = await response.json();
            
            if (data.success && data.checkout_url) {
                // Redirect to Stripe Checkout
                window.location.href = data.checkout_url;
            } else {
                throw new Error(data.message || 'Failed to get checkout URL');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            purchaseError = error instanceof Error ? error.message : 'An error occurred';
            // Show error to user
            alert(`Failed to start purchase: ${purchaseError}`);
        } finally {
            if (purchaseType === 'single_story') {
                isLoadingSingleStory = false;
            } else {
                isLoadingStoryBundle = false;
            }
        }
    }

    function handleKeyDown(event: KeyboardEvent, purchaseType: 'single_story' | 'story_bundle') {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handlePurchase(purchaseType);
        }
    }

    function handleSubscriptionKeyDown(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleStartSubscription();
        }
    }

    async function handleStartSubscription() {
        if (isLoadingSubscription) return;
        
        isLoadingSubscription = true;
        subscriptionError = "";
        
        try {
            // Get current user info from auth store (already synced and refreshed)
            let userEmail = null;
            let userId = null;
            
            if ($user) {
                userEmail = $user.email;
                userId = $user.id;
            }
            console.log('[handleStartSubscription] userEmail:', userEmail);
            console.log('[handleStartSubscription] userId:', userId);

            // Call the backend to create a Stripe checkout session
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-subscription-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price_type: 'monthly',
                    user_email: userEmail,
                    user_id: userId,
                    success_url: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${window.location.origin}/pricing`
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create checkout session');
            }
            
            const data = await response.json();
            
            if (data.success && data.checkout_url) {
                // Redirect to Stripe Checkout
                window.location.href = data.checkout_url;
            } else {
                throw new Error(data.message || 'Failed to get checkout URL');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            subscriptionError = error instanceof Error ? error.message : 'An error occurred';
            // Show error to user
            alert(`Failed to start subscription: ${subscriptionError}`);
        } finally {
            isLoadingSubscription = false;
        }
    }
</script>

<div class="pop-up">
    <div class="frame-1410103845">
        <div class="frame-1410103839">
            <div class="logo-text-full">
                <img src={drawtopia} alt="drawtopia" class="drawtopia-logo" />
            </div>
            <div class="x">
                <img src={xicon} alt="" />
            </div>
        </div>
        <div class="stroke"></div>
    </div>
    <div class="heading">
        <div class="choose-your-story-adventure">
            <span class="chooseyourstoryadventure_span"
                >Choose Your Story Adventure</span
            >
        </div>
        <div
            class="create-magical-personalized-stories-for-your-children-start-free-and-unlock-endless-possibilities"
        >
            <span
                class="createmagicalpersonalizedstoriesforyourchildrenstartfreeandunlockendlesspossibilities_span"
                >Create magical personalized stories for your children. Start
                free and unlock endless possibilities!</span
            >
        </div>
    </div>
    <div class="frame-2147227474">
        <div class="frame-2147227468">
            <div class="frame-2147227465">
                <div class="ellipse-1426"></div>
                <div class="frame-2147227464">
                    <div class="frame-2147227463">
                        <div class="heading_01">
                            <div class="single-story">
                                <span class="singlestory_span"
                                    >Single Story</span
                                >
                            </div>
                            <div class="perfect-for-trying-drawtopia">
                                <span class="perfectfortryingdrawtopia_span"
                                    >Perfect for trying Drawtopia</span
                                >
                            </div>
                        </div>
                        <div class="text-999story">
                            <span class="f99story_span_01">$9.99</span><span
                                class="f99story_span_02">/story</span
                            >
                        </div>
                </div>
                <div class="button" on:click={() => handlePurchase('single_story')} on:keydown={(e) => handleKeyDown(e, 'single_story')} role="button" tabindex="0" class:loading={isLoadingSingleStory}>
                    <div class="start-creating-free">
                        <span class="startcreatingfree_span">
                            {#if isLoadingSingleStory}
                                Loading...
                            {:else}
                                Start Creating Free
                            {/if}
                        </span>
                    </div>
                </div>
                </div>
                <div class="checklist-container">
                    <div class="checklist">
                        <div class="check">
                            <div class="check_01">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="one-personalized-digital-storybook">
                            <span class="onepersonalizeddigitalstorybook_span"
                                >One personalized digital storybook</span
                            >
                        </div>
                    </div>
                    <div class="checklist_01">
                        <div class="check_02">
                            <div class="check_03">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="preview-first-2-pages-free">
                            <span class="previewfirst2pagesfree_span"
                                >Preview first 2 pages free</span
                            >
                        </div>
                    </div>
                    <div class="checklist_02">
                        <div class="check_04">
                            <div class="check_05">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="high-resolution-download-after-purchase">
                            <span
                                class="high-resolutiondownloadafterpurchase_span"
                                >High-resolution download after purchase</span
                            >
                        </div>
                    </div>
                    <div class="checklist_03">
                        <div class="check_06">
                            <div class="check_07">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="share-via-email-or-social-media">
                            <span class="shareviaemailorsocialmedia_span"
                                >Share via email or social media</span
                            >
                        </div>
                    </div>
                </div>
            </div>
            <div class="frame-2147227467">
                <div class="ellipse-1426_01"></div>
                <div class="ellipse-1427"></div>
                <div class="frame-2147227464_01">
                    <div class="frame-2147227463_01">
                        <div class="heading_02">
                            <div class="story-bundle">
                                <span class="storybundle_span"
                                    >Story Bundle</span
                                >
                            </div>
                            <div class="save-20-with-three-stories">
                                <span class="save20withthreestories_span"
                                    >Save 20% with three stories</span
                                >
                            </div>
                        </div>
                        <div class="text-24993-stories">
                            <span class="f4993stories_span_01">$24.99</span
                            ><span class="f4993stories_span_02">/3 stories</span
                            >
                        </div>
                    </div>
                    <div class="button_01" on:click={() => handlePurchase('story_bundle')} on:keydown={(e) => handleKeyDown(e, 'story_bundle')} role="button" tabindex="0" class:loading={isLoadingStoryBundle}>
                        <div class="get-story-bundle">
                            <span class="getstorybundle_span">
                                {#if isLoadingStoryBundle}
                                    Loading...
                                {:else}
                                    Get Story Bundle
                                {/if}
                            </span>
                        </div>
                        <div class="ellipse-1415"></div>
                    </div>
                </div>
                <div class="checklist-container_01">
                    <div class="checklist_04">
                        <div class="check_08">
                            <div class="check_09">
                                <img src={bluecheckicon} alt="bluecheckicon" />
                            </div>
                        </div>
                        <div class="three-personalized-digital-storybook">
                            <span class="threepersonalizeddigitalstorybook_span"
                                >Three personalized digital storybook</span
                            >
                        </div>
                    </div>
                    <div class="checklist_05">
                        <div class="check_10">
                            <div class="check_11">
                                <img src={bluecheckicon} alt="bluecheckicon" />
                            </div>
                        </div>
                        <div class="high-resolution-downloads">
                            <span class="high-resolutiondownloads_span"
                                >High-resolution downloads</span
                            >
                        </div>
                    </div>
                    <div class="checklist_06">
                        <div class="check_12">
                            <div class="check_13">
                                <img src={bluecheckicon} alt="bluecheckicon" />
                            </div>
                        </div>
                        <div class="high-resolution-download-after-purchase_01">
                            <span
                                class="high-resolutiondownloadafterpurchase_01_span"
                                >High-resolution download after purchase</span
                            >
                        </div>
                    </div>
                    <div class="checklist_07">
                        <div class="check_14">
                            <div class="check_15">
                                <img src={bluecheckicon} alt="bluecheckicon" />
                            </div>
                        </div>
                        <div class="save-598-20-discount">
                            <span class="save59820discount_span"
                                >Save $5.98 (20% discount)</span
                            >
                        </div>
                    </div>
                </div>
            </div>
            <div class="frame-2147227466">
                <div class="ellipse-1427_01"></div>
                <div class="frame-2147227464_02">
                    <div class="frame-2147227463_02">
                        <div class="heading_03">
                            <div class="family-subcription">
                                <span class="familysubcription_span"
                                    >Family Subcription</span
                                >
                            </div>
                            <div>
                                <span class="storiesforthewholefamily_span"
                                    >Stories for the whole family</span
                                >
                            </div>
                        </div>
                        <div class="frame-2147227475">
                            <div class="text-1499month">
                                <span class="f499month_span_01">$14.99</span
                                ><span class="f499month_span_02">/month</span>
                            </div>
                            <div class="frame-1410104176">
                                <div>
                                    <span class="f7988annually_span"
                                        >179.88/annually</span
                                    >
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="button_02" on:click={handleStartSubscription} on:keydown={handleSubscriptionKeyDown} role="button" tabindex="0" class:loading={isLoadingSubscription}>
                        <div class="start-subscription">
                            <span class="startsubscription_span">
                                {#if isLoadingSubscription}
                                    Loading...
                                {:else}
                                    Start Subscription
                                {/if}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="checklist-container_02">
                    <div class="checklist_08">
                        <div class="check_16">
                            <div class="check_17">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="up-to-20-storiesmonth-digital-storybooks">
                            <span
                                class="upto20storiesmonthdigitalstorybooks_span"
                                >(Up to 20 stories/month) digital storybooks</span
                            >
                        </div>
                        <div class="scroll">
                            <div class="rectangle-172"></div>
                        </div>
                    </div>
                    <div class="checklist_09">
                        <div class="check_18">
                            <div class="check_19">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="preview-all-stories-for-free">
                            <span class="previewallstoriesforfree_span"
                                >Preview all stories for free</span
                            >
                        </div>
                    </div>
                    <div class="checklist_10">
                        <div class="check_20">
                            <div class="check_21">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="access-to-premium-templates">
                            <span class="accesstopremiumtemplates_span"
                                >Access to premium templates</span
                            >
                        </div>
                    </div>
                    <div class="checklist_11">
                        <div class="check_22">
                            <div class="check_23">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="create-stories-with-multiple-characters">
                            <span
                                class="createstorieswithmultiplecharacters_span"
                                >Create stories with multiple characters</span
                            >
                        </div>
                    </div>
                    <div class="checklist_12">
                        <div class="check_24">
                            <div class="check_25">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="gifting-options-available">
                            <span class="giftingoptionsavailable_span"
                                >Gifting options available</span
                            >
                        </div>
                    </div>
                    <div class="checklist_13">
                        <div class="check_26">
                            <div class="check_27">
                                <img src={checkicon} alt="checkicon" />
                            </div>
                        </div>
                        <div class="billed-annually-same-monthly-rate">
                            <span class="billedannuallysamemonthlyrate_span"
                                >Billed annually (same monthly rate)</span
                            >
                        </div>
                    </div>
                    <div class="rectangle-171"></div>
                </div>
                <div class="ellipse-1428"></div>
            </div>
        </div>
        <div class="frame-2147227473">
            <div class="frame-2147227471">
                <div class="frame-1410103777">
                    <div class="frame-1410103753">
                        <div>
                            <span class="freepreview_span">Free Preview</span>
                        </div>
                        <div>
                            <span
                                class="createyourstoryandpreviewthefirst2pagesforfree-nocreditcardrequired_span"
                                >Create your story and preview the first<br />2
                                pages for free - no credit card required!</span
                            >
                        </div>
                    </div>
                </div>
                <div class="ellipse-1426_02"></div>
                <div class="button_03" on:click={() => handlePurchase('single_story')} on:keydown={(e) => handleKeyDown(e, 'single_story')} role="button" tabindex="0" class:loading={isLoadingSingleStory}>
                    <div class="start-creating-free_01">
                        <span class="startcreatingfree_01_span">
                            {#if isLoadingSingleStory}
                                Loading...
                            {:else}
                                Start Creating Free
                            {/if}
                        </span>
                    </div>
                </div>
                <img src={lightgroup} alt="lightgroup" class="lightgroup" />
            </div>
            <div class="frame-2147227472">
                <div class="all-plans-include">
                    <span class="allplansinclude_span"
                        >All Plans Include</span
                    >
                </div>
                <div class="checklist-container_03">
                    <div class="frame-1410103780">
                        <div class="checklist_14">
                            <div class="check_28">
                                <div class="check_29">
                                    <img
                                        src={whitecheckicon}
                                        alt="whitecheckicon"
                                        class="whitecheckicon"
                                    />
                                </div>
                            </div>
                            <div class="character-enhancement-technology">
                                <span
                                    class="characterenhancementtechnology_span"
                                    >Character enhancement technology</span
                                >
                            </div>
                        </div>
                        <div class="checklist_15">
                            <div class="check_30">
                                <div class="check_31">
                                    <img
                                        src={whitecheckicon}
                                        alt="whitecheckicon"
                                        class="whitecheckicon"
                                    />
                                </div>
                            </div>
                            <div class="professional-story-templates">
                                <span
                                    class="professionalstorytemplates_span"
                                    >Professional story templates</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="frame-1410103781">
                        <div class="checklist_16">
                            <div class="check_32">
                                <div class="check_33">
                                    <img
                                        src={whitecheckicon}
                                        alt="whitecheckicon"
                                        class="whitecheckicon"
                                    />
                                </div>
                            </div>
                            <div class="educational-value-integration">
                                <span
                                    class="educationalvalueintegration_span"
                                    >Educational value integration</span
                                >
                            </div>
                        </div>
                        <div class="checklist_17">
                            <div class="check_34">
                                <div class="check_35">
                                    <img
                                        src={whitecheckicon}
                                        alt="whitecheckicon"
                                        class="whitecheckicon"
                                    />
                                </div>
                            </div>
                            <div class="digital-download-options">
                                <span class="digitaldownloadoptions_span"
                                    >Digital download options</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="button_04" on:click={() => handlePurchase('single_story')} on:keydown={(e) => handleKeyDown(e, 'single_story')} role="button" tabindex="0" class:loading={isLoadingSingleStory}>
                    <div class="start-creating-free_02">
                        <span class="startcreatingfree_02_span">
                            {#if isLoadingSingleStory}
                                Loading...
                            {:else}
                                Start Creating Free
                            {/if}
                        </span>
                    </div>
                </div>
                <img src={heavygroup} alt="heavygroup" class="heavygroup" />
            </div>
        </div>
    </div>
</div>

<style>
    .drawtopia {
        width: 216px;
        height: 40.37px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: radial-gradient(
            ellipse 50% 50% at 50% 50%,
            #0fe3ef 44%,
            #438bff 100%
        );
        box-shadow: 0px 0.6032477617263794px 1.8097431659698486px #871fff inset;
    }

    .subtract {
        width: 30.16px;
        height: 30.16px;
        left: 129.13px;
        top: 1.94px;
        position: absolute;
        transform: rotate(4deg);
        transform-origin: top left;
        background: radial-gradient(
            ellipse 50% 50% at 50% 50%,
            #0fe3ef 44%,
            #438bff 100%
        );
        box-shadow: 0px 0.6032479405403137px 1.8097436428070068px #871fff inset;
    }

    .vector {
        width: 15px;
        height: 15px;
        left: 4.5px;
        top: 4.5px;
        position: absolute;
        background: black;
    }

    .stroke {
        align-self: stretch;
        height: 1px;
        background: #dcdcdc;
    }

    .chooseyourstoryadventure_span {
        color: black;
        font-size: 40px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 56px;
        word-wrap: break-word;
    }

    .choose-your-story-adventure {
        align-self: stretch;
        text-align: center;
    }

    .createmagicalpersonalizedstoriesforyourchildrenstartfreeandunlockendlesspossibilities_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .create-magical-personalized-stories-for-your-children-start-free-and-unlock-endless-possibilities {
        align-self: stretch;
        text-align: center;
    }

    .ellipse-1426 {
        width: 330px;
        height: 300px;
        left: 379.96px;
        top: -202px;
        position: absolute;
        transform: rotate(58deg);
        transform-origin: top left;
        background: rgba(242, 242, 242, 0.62);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .singlestory_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .single-story {
        width: 203px;
    }

    .perfectfortryingdrawtopia_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .perfect-for-trying-drawtopia {
        width: 289px;
    }

    .f99story_span_01 {
        color: black;
        font-size: 48px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 67.2px;
        word-wrap: break-word;
    }

    .f99story_span_02 {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .text-999story {
        align-self: stretch;
    }

    .startcreatingfree_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .start-creating-free {
        text-align: center;
    }

    .vector_01 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .onepersonalizeddigitalstorybook_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .one-personalized-digital-storybook {
        text-align: center;
    }

    .vector_02 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .previewfirst2pagesfree_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .preview-first-2-pages-free {
        text-align: center;
    }

    .vector_03 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .high-resolutiondownloadafterpurchase_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .high-resolution-download-after-purchase {
        flex: 1 1 0;
    }

    .vector_04 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .shareviaemailorsocialmedia_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .share-via-email-or-social-media {
        text-align: center;
    }

    .ellipse-1426_01 {
        width: 330px;
        height: 300px;
        left: 359.53px;
        top: -216px;
        position: absolute;
        transform: rotate(51deg);
        transform-origin: top left;
        background: rgba(67.43, 139.33, 255, 0.25);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .ellipse-1427 {
        width: 330px;
        height: 300px;
        left: -225px;
        top: 0.08px;
        position: absolute;
        transform: rotate(-31deg);
        transform-origin: top left;
        background: rgba(67, 139, 255, 0.1);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .storybundle_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .story-bundle {
        width: 203px;
    }

    .save20withthreestories_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .save-20-with-three-stories {
        width: 289px;
    }

    .f4993stories_span_01 {
        color: black;
        font-size: 48px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 67.2px;
        word-wrap: break-word;
    }

    .f4993stories_span_02 {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .text-24993-stories {
        align-self: stretch;
    }

    .getstorybundle_span {
        color: white;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .get-story-bundle {
        text-align: center;
    }

    .ellipse-1415 {
        width: 248px;
        height: 114px;
        left: 53px;
        top: 17px;
        position: absolute;
        background: radial-gradient(
            ellipse 42.11% 42.11% at 50% 52.94%,
            white 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 9999px;
    }

    .vector_05 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #438bff;
    }

    .threepersonalizeddigitalstorybook_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .three-personalized-digital-storybook {
        text-align: center;
    }

    .vector_06 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #438bff;
    }

    .high-resolutiondownloads_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .high-resolution-downloads {
        text-align: center;
    }

    .vector_07 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #438bff;
    }

    .high-resolutiondownloadafterpurchase_01_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .high-resolution-download-after-purchase_01 {
        flex: 1 1 0;
    }

    .vector_08 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #438bff;
    }

    .save59820discount_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .save-598-20-discount {
        text-align: center;
    }

    .ellipse-1427_01 {
        width: 330px;
        height: 300px;
        left: 369.53px;
        top: -201px;
        position: absolute;
        transform: rotate(51deg);
        transform-origin: top left;
        background: rgba(153.29, 199.66, 237.59, 0.1);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .familysubcription_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .family-subcription {
        width: 208px;
    }

    .storiesforthewholefamily_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .f499month_span_01 {
        color: black;
        font-size: 48px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 67.2px;
        word-wrap: break-word;
    }

    .f499month_span_02 {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .text-1499month {
        align-self: stretch;
    }

    .f7988annually_span {
        color: #438bff;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .startsubscription_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .start-subscription {
        text-align: center;
    }

    .vector_09 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .upto20storiesmonthdigitalstorybooks_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .up-to-20-storiesmonth-digital-storybooks {
        width: 306px;
    }

    .rectangle-172 {
        width: 6px;
        height: 50px;
        background: #dedede;
        border-radius: 10px;
    }

    .vector_10 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .previewallstoriesforfree_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .preview-all-stories-for-free {
        text-align: center;
    }

    .vector_11 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .accesstopremiumtemplates_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .access-to-premium-templates {
        flex: 1 1 0;
    }

    .vector_12 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .createstorieswithmultiplecharacters_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .create-stories-with-multiple-characters {
        width: 306px;
    }

    .vector_13 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .giftingoptionsavailable_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .gifting-options-available {
        width: 306px;
    }

    .vector_14 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: #8c8c8c;
    }

    .billedannuallysamemonthlyrate_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .billed-annually-same-monthly-rate {
        width: 306px;
    }

    .rectangle-171 {
        width: 382px;
        height: 49px;
        left: 0px;
        top: 276px;
        position: absolute;
        background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0) 0%,
            white 74%
        );
    }

    .ellipse-1428 {
        width: 330px;
        height: 300px;
        left: -214px;
        top: -7.92px;
        position: absolute;
        transform: rotate(-31deg);
        transform-origin: top left;
        background: rgba(186.35, 126.27, 255, 0.08);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .freepreview_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .createyourstoryandpreviewthefirst2pagesforfree-nocreditcardrequired_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .ellipse-1426_02 {
        width: 330px;
        height: 300px;
        left: -134px;
        top: 64.77px;
        position: absolute;
        transform: rotate(-36deg);
        transform-origin: top left;
        background: rgba(67.43, 139.33, 255, 0.09);
        border-radius: 9999px;
        filter: blur(50px);
    }

    .startcreatingfree_01_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .start-creating-free_01 {
        text-align: center;
    }

    .subtract_01 {
        width: 210px;
        height: 210px;
        transform: rotate(4deg);
        transform-origin: top left;
        background: linear-gradient(
                0deg,
                rgba(67, 139, 255, 0.5) 0%,
                rgba(67, 139, 255, 0.5) 100%
            ),
            radial-gradient(
                ellipse 50% 50% at 50% 50%,
                #0fe3ef 44%,
                #438bff 100%
            );
    }

    .subtract_02 {
        width: 200px;
        height: 200px;
        transform: rotate(4deg);
        transform-origin: top left;
        background: linear-gradient(0deg, #e7feff 0%, #e7feff 100%),
            radial-gradient(
                ellipse 50% 50% at 50% 50%,
                #0fe3ef 44%,
                #438bff 100%
            );
    }

    .allplansinclude_span {
        color: white;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .all-plans-include {
        align-self: stretch;
    }

    .vector_15 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: white;
    }

    .characterenhancementtechnology_span {
        color: white;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .character-enhancement-technology {
        text-align: center;
    }

    .vector_16 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: white;
    }

    .professionalstorytemplates_span {
        color: white;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .professional-story-templates {
        text-align: center;
    }

    .vector_17 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: white;
    }

    .educationalvalueintegration_span {
        color: white;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .educational-value-integration {
        text-align: center;
    }

    .vector_18 {
        width: 12.5px;
        height: 9px;
        left: 2px;
        top: 4px;
        position: absolute;
        background: white;
    }

    .digitaldownloadoptions_span {
        color: white;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .digital-download-options {
        text-align: center;
    }

    .startcreatingfree_02_span {
        color: #141414;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .start-creating-free_02 {
        text-align: center;
    }

    .subtract_03 {
        width: 210px;
        height: 210px;
        transform: rotate(4deg);
        transform-origin: top left;
        background: linear-gradient(
                0deg,
                rgba(255, 255, 255, 0.5) 0%,
                rgba(255, 255, 255, 0.5) 100%
            ),
            radial-gradient(
                ellipse 50% 50% at 50% 50%,
                #0fe3ef 44%,
                #438bff 100%
            );
    }

    .subtract_04 {
        width: 200px;
        height: 200px;
        transform: rotate(4deg);
        transform-origin: top left;
        background: linear-gradient(
                0deg,
                rgba(255, 255, 255, 0.25) 0%,
                rgba(255, 255, 255, 0.25) 100%
            ),
            radial-gradient(
                ellipse 50% 50% at 50% 50%,
                #0fe3ef 44%,
                #438bff 100%
            );
    }

    .heading {
        align-self: stretch;
        padding-left: 4px;
        padding-right: 4px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 8px;
        display: flex;
    }

    .heading_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .button {
        align-self: stretch;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 16px;
        padding-right: 24px;
        background: white;
        box-shadow: 0px 0px 0px 2px #f0f0f0;
        border-radius: 20px;
        outline: 1px #e6e6e6 solid;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .button:hover {
        background: #f5f5f5;
        transform: scale(1.02);
        box-shadow: 0px 2px 8px 2px rgba(0, 0, 0, 0.08);
    }

    .button:active {
        background: #e8e8e8;
        transform: scale(0.98);
        box-shadow: 0px 0px 0px 2px #f0f0f0;
    }

    .button.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
    }

    .heading_02 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .heading_03 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410104176 {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 4px;
        padding-bottom: 4px;
        background: #eef6ff;
        border-radius: 12px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
    }

    .button_02 {
        align-self: stretch;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 16px;
        padding-right: 24px;
        background: white;
        box-shadow: 0px 0px 0px 2px #f0f0f0;
        border-radius: 20px;
        outline: 1px #e6e6e6 solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .button_02:hover {
        background: #f5f5f5;
        transform: scale(1.02);
        box-shadow: 0px 2px 8px 2px rgba(0, 0, 0, 0.08);
    }

    .button_02:active {
        background: #e8e8e8;
        transform: scale(0.98);
        box-shadow: 0px 0px 0px 2px #f0f0f0;
    }

    .button_02.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
    }

    .frame-1410103753 {
        width: 563px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .button_03 {
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 16px;
        padding-right: 24px;
        background: white;
        box-shadow: 0px 0px 0px 2px #f0f0f0;
        border-radius: 20px;
        outline: 2px #e6e6e6 solid;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 3;
    }

    .button_03:hover {
        background: #f5f5f5;
        transform: scale(1.02);
        box-shadow: 0px 2px 8px 2px rgba(0, 0, 0, 0.08);
    }

    .button_03:active {
        background: #e8e8e8;
        transform: scale(0.98);
        box-shadow: 0px 0px 0px 2px #f0f0f0;
    }

    .button_03.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
    }

    .button_04 {
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 16px;
        padding-right: 24px;
        background: white;
        box-shadow: 0px 0px 0px 2px white;
        border-radius: 20px;
        outline: 2px #e6e6e6 solid;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: flex;
        position: absolute;
        right: 0;
        bottom: 0;
        transform: translate(-24px, -24px);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .button_04:hover {
        background: #f5f5f5;
        transform: translate(-24px, -24px) scale(1.02);
        box-shadow: 0px 2px 8px 2px rgba(0, 0, 0, 0.08);
    }

    .button_04:active {
        background: #e8e8e8;
        transform: translate(-24px, -24px) scale(0.98);
        box-shadow: 0px 0px 0px 2px white;
    }

    .button_04.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
    }

    .logo-text-full {
        width: 216px;
        height: 40.37px;
        position: relative;
    }

    .drawtopia-logo {
        width: 100%;
    }

    .x {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .check_01 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_03 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_05 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_07 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .whitecheckicon {
        margin: auto;
    }

    .button_01 {
        align-self: stretch;
        padding-top: 16px;
        padding-bottom: 16px;
        padding-left: 16px;
        padding-right: 24px;
        position: relative;
        background: #438bff;
        box-shadow: 0px 0px 0px 2px #f0f0f0;
        border-radius: 20px;
        outline: 1px #e6e6e6 solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .button_01:hover {
        background: #3578e5;
        transform: scale(1.02);
        box-shadow: 0px 4px 12px 2px rgba(67, 139, 255, 0.3);
    }

    .button_01:active {
        background: #2d6bd1;
        transform: scale(0.98);
        box-shadow: 0px 0px 0px 2px #f0f0f0;
    }

    .button_01.loading {
        opacity: 0.7;
        cursor: wait;
        pointer-events: none;
    }

    .check_09 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_11 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_13 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_15 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_17 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .scroll {
        width: 6px;
        height: 293px;
        left: 344px;
        top: 0px;
        position: absolute;
        background: #f6f6f6;
        border-radius: 10px;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .check_19 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_21 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_23 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_25 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_27 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_29 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_31 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_33 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .check_35 {
        width: 16px;
        height: 16px;
        left: 8px;
        top: 8px;
        position: absolute;
        overflow: hidden;
    }

    .frame-2147227463 {
        width: 289px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .frame-2147227463_01 {
        width: 289px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .frame-2147227475 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103777 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410103839 {
        align-self: stretch;
        padding-left: 12px;
        padding-right: 12px;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .check {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_02 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_04 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_06 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_08 {
        width: 32px;
        height: 32px;
        position: relative;
        background: #e7feff;
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
    }

    .check_10 {
        width: 32px;
        height: 32px;
        position: relative;
        background: #e7feff;
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
    }

    .check_12 {
        width: 32px;
        height: 32px;
        position: relative;
        background: #e7feff;
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
    }

    .check_14 {
        width: 32px;
        height: 32px;
        position: relative;
        background: #e7feff;
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
    }

    .check_16 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_18 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_20 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_22 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_24 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_26 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(143.44, 143.44, 143.44, 0.1);
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_28 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px white solid;
        outline-offset: -1px;
    }

    .check_30 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px white solid;
        outline-offset: -1px;
    }

    .check_32 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px white solid;
        outline-offset: -1px;
    }

    .check_34 {
        width: 32px;
        height: 32px;
        position: relative;
        background: rgba(255, 255, 255, 0.2);
        overflow: hidden;
        border-radius: 99999px;
        outline: 1px white solid;
        outline-offset: -1px;
    }

    .frame-2147227464 {
        width: 354px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .frame-2147227464_01 {
        width: 354px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .frame-2147227463_02 {
        width: 289px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: flex;
    }

    .frame-2147227471 {
        height: 261px;
        padding: 24px;
        position: relative;
        background: white;
        overflow: hidden;
        border-radius: 10px;
        outline: 1px #f0f0f0 solid;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 54px;
        display: inline-flex;
    }

    .frame-1410103845 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .checklist {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_01 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_02 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_03 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_04 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_05 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_06 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_07 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_08 {
        position: relative;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_09 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_10 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_11 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_12 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_13 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_14 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_15 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_16 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .checklist_17 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-2147227464_02 {
        width: 354px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .checklist-container {
        width: 382px;
        height: 325px;
        padding: 16px;
        background: #fafafa;
        border-radius: 20px;
        outline: 1px #f0f0f0 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .checklist-container_01 {
        width: 382px;
        height: 325px;
        padding: 16px;
        background: #fafafa;
        border-radius: 20px;
        outline: 1px #f0f0f0 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .checklist-container_02 {
        width: 382px;
        height: 325px;
        padding: 16px;
        position: relative;
        background: #fafafa;
        overflow: hidden;
        border-radius: 20px;
        outline: 1px #f0f0f0 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .frame-1410103780 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .frame-1410103781 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .frame-2147227465 {
        padding-top: 24px;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-right: 10px;
        position: relative;
        background: white;
        box-shadow: 0px 0px 20px 1px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        border-radius: 20px;
        outline: 1px #f2f2f2 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227467 {
        padding-top: 24px;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-right: 10px;
        position: relative;
        background: white;
        box-shadow: 0px 0px 20px 1px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        border-radius: 20px;
        outline: 2px #438bff solid;
        outline-offset: -2px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227466 {
        height: 588px;
        padding-top: 24px;
        padding-bottom: 10px;
        padding-left: 10px;
        padding-right: 10px;
        position: relative;
        background: white;
        box-shadow: 0px 0px 20px 1px rgba(0, 0, 0, 0.04);
        overflow: hidden;
        border-radius: 20px;
        outline: 1px #f2f2f2 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .checklist-container_03 {
        align-self: stretch;
        height: 152px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .frame-2147227468 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227469 {
        width: 100%;
        height: 213px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 24px;
        display: inline-flex;
    }

    .frame-2147227470 {
        width: 100%;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 27px;
        display: inline-flex;
    }

    .heavygroup {
        position: absolute;
        right: 0;
        top: 0;
    }

    .lightgroup {
        position: absolute;
        bottom: 0;
        right: 0;
    }

    .frame-2147227472 {
        width: 611px;
        height: 261px;
        padding: 24px;
        background: #438bff;
        overflow: hidden;
        border-radius: 10px;
        outline: 1px #f0f0f0 solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
        display: inline-flex;
        position: relative;
    }

    .frame-2147227473 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: inline-flex;
    }

    .frame-2147227474 {
        width: 1238px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .pop-up {
        width: 100%;
        padding-top: 24px;
        padding-bottom: 16px;
        padding-left: 12px;
        padding-right: 12px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: white;
        border-radius: 20px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 24px;
        display: inline-flex;
    }
</style>
