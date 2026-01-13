<script lang="ts">
    import drawtopiaLogo from "../../../../assets/logo.png";
    import ShieldStar from "../../../../assets/ShieldStar.svg";
    import star from "../../../../assets/star.png";
    import ArrowLeft from "../../../../assets/ArrowLeft.svg"
    import std_book_cover from "../../../../assets/std_book_cover.png"
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";
    import MobileStepProgressBar from "../../../../components/MobileStepProgressBar.svelte";
    import ProgressBar from "../../../../components/ProgressBar.svelte";
    
    let dedicationMessage: string = "";
    const maxChars: number = 200;
    let isMobile = false;
    
    $: if (browser) {
        isMobile = window.innerWidth < 800;
    }
    
    // Computed property to check if continue button should be enabled
    $: canContinue = dedicationMessage && dedicationMessage.trim().length > 0;
    
    function handleDedicationInput(event: Event) {
        const target = event.target as HTMLTextAreaElement | null;
        const value = target?.value ?? "";
        dedicationMessage = value.length > maxChars ? value.slice(0, maxChars) : value;
        
        // Save dedication text to sessionStorage
        if (browser) {
            sessionStorage.setItem("dedication_text", dedicationMessage);
        }
    }
    
    function handleContinueToPreview() {
        // Only proceed if dedication text is not empty
        if (!canContinue) return;
        
        // Ensure dedication text is saved before navigating
        if (browser && dedicationMessage) {
            sessionStorage.setItem("dedication_text", dedicationMessage);
        }
        goto("/adventure-story/story-preview");
    }
</script>

<div class="dedication-pages-when-selected-create-send">
    <div class="navbar">
        <img src={drawtopiaLogo} alt="Drawtopia Logo" class="img-logo" />
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="heading_01">
                <div class="frame-1410103862">
                    <div class="here-your-magical-story">
                        <span class="hereyourmagicalstory_span"
                            >Here your Magical Story</span
                        >
                    </div>
                    <div
                        class="your-character-is-now-part-of-their-very-own-adventure"
                    >
                        <span
                            class="yourcharacterisnowpartoftheirveryownadventure_span"
                            >Your character is now part of their very own
                            adventure!</span
                        >
                    </div>
                </div>
            </div>
            <div class="tag">
                <div class="shieldstar">
                    <img
                        src={ShieldStar}
                        alt="Shield Star"
                        class="img-shieldstar"
                    />
                </div>
                <div>
                    <span class="ffreepagepreview_span"
                        >2 Free Page Preview</span
                    >
                </div>
            </div>
        </div>
        {#if isMobile}
            <MobileStepProgressBar currentStep={6} />
        {:else}
            <div class="progress-bar">
                <div class="progress-bar_01">
                    <div class="progress-bar_02">
                        <div class="step-1">
                            <span class="step1_span">Step 1</span>
                        </div>
                        <div class="bar"></div>
                        <div class="frame-1410103829">
                            <div class="character-upload">
                                <span class="characterupload_span"
                                    >Character Upload</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="progress-bar_03">
                        <div class="frame-1410103829_01">
                            <div class="step-2">
                                <span class="step2_span">Step 2</span>
                            </div>
                        </div>
                        <div class="bar_01"></div>
                        <div class="character-enhancement">
                            <span class="characterenhancement_span"
                                >Character Enhancement</span
                            >
                        </div>
                    </div>
                    <div class="progress-bar_04">
                        <div class="step-3">
                            <span class="step3_span">Step 3</span>
                        </div>
                        <div class="bar_02"></div>
                        <div class="frame-1410103829_02">
                            <div class="format-selection">
                                <span class="formatselection_span"
                                    >Format Selection</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="progress-bar_05">
                        <div class="step-4">
                            <span class="step4_span">Step 4</span>
                        </div>
                        <div class="bar_03"></div>
                        <div class="frame-1410103829_03">
                            <div class="configuration">
                                <span class="configuration_span">Configuration</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="progress-bar_06">
                        <div class="step-5">
                            <span class="step5_span">Step 5</span>
                        </div>
                        <div class="bar_04"></div>
                        <div class="frame-1410103829_04">
                            <div class="generation">
                                <span class="generation_span">Generation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
        <div class="frame-1410104027">
            <img src={star} alt="Star" class="img-star" />
            <div class="frame-1410104029">
                <div class="polygon-1"></div>
                <div class="frame-1410104026">
                    <div>
                        <span
                            class="letsdesignthededicationpagesforyourgift_span"
                            >Let's design the dedication pages for your gift!</span
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410104031">
            <div class="frame-8">
                <div class="frame-1410104034">
                    <div class="dedication-pages-preview">
                        <span class="dedicationpagespreview_span"
                            >Dedication Pages Preview</span
                        >
                    </div>
                </div>
                <img class="book" src={std_book_cover} alt="Book cover" />
            </div>
            <div class="frame-9">
                <div>
                    <span class="informationdedicationpages_span"
                        >Information Dedication Pages</span
                    >
                </div>
                <div class="form">
                    <div class="form_01">
                        <div>
                            <span class="dedicationmessages_span"
                                >Dedication Messages</span
                            >
                        </div>
                        <div class="input-form">
                            <div class="input-placeholder">
                                <textarea
                                    class="dedication-textarea"
                                    placeholder="Write your dedication here..."
                                    on:input={handleDedicationInput}
                                    bind:value={dedicationMessage}
                                    maxlength={maxChars}
                                ></textarea>
                            </div>
                            <div class="text-42200-characters">
                                <span class="f2200characters_span">{dedicationMessage.length}/{maxChars} Characters</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103860">
            <div class="frame-1410103870">
                <div class="button" on:click={() => goto('/create-character/7')} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && goto('/create-character/7')}>
                    <div class="arrowleft">
                        <img src={ArrowLeft} alt="Arrow Left" class="img-arrowleft" />
                    </div>
                    <div class="back-to-step">
                        <span class="backtostep_span">Back To Step</span>
                    </div>
                </div>
            </div>
            <div 
                class="frame-1410104246" 
                class:disabled={!canContinue}
                on:click={handleContinueToPreview} 
                role="button" 
                tabindex={canContinue ? 0 : -1}
                on:keydown={(e) => e.key === 'Enter' && canContinue && handleContinueToPreview()}
            >
                <div class="continue-to-preview-story">
                    <span class="continuetopreviewstory_span"
                        >Continue to Preview Story</span
                    >
                </div>
                <div class="ellipse-1415"></div>
            </div>
        </div>
    </div>
</div>

<style>
    .img-logo {
        width: 203.32px;
        height: 38px;
        margin: auto;
    }

    .hereyourmagicalstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .here-your-magical-story {
        width: 1040px;
        text-align: center;
    }

    .yourcharacterisnowpartoftheirveryownadventure_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .your-character-is-now-part-of-their-very-own-adventure {
        width: 1040px;
        text-align: center;
    }

    .vector {
        width: 15px;
        height: 15.63px;
        left: 2.5px;
        top: 3.12px;
        position: absolute;
        background: #438bff;
    }

    .ffreepagepreview_span {
        color: #438bff;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        word-wrap: break-word;
    }

    .step1_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-1 {
        width: 63px;
    }

    .bar {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .characterupload_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .character-upload {
        align-self: stretch;
    }

    .step2_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-2 {
        width: 63px;
    }

    .bar_01 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .characterenhancement_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .character-enhancement {
        align-self: stretch;
    }

    .step3_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-3 {
        width: 63px;
    }

    .bar_02 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .formatselection_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .format-selection {
        align-self: stretch;
    }

    .step4_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-4 {
        width: 63px;
    }

    .bar_03 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .configuration_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .configuration {
        align-self: stretch;
    }

    .step5_span {
        color: #727272;
        font-size: 14px;
        font-family: Nunito;
        font-weight: 400;
        line-height: 19.6px;
        word-wrap: break-word;
    }

    .step-5 {
        width: 63px;
    }

    .bar_04 {
        align-self: stretch;
        height: 8px;
        position: relative;
        background: #438bff;
        border-radius: 12px;
    }

    .generation_span {
        color: #121212;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 500;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .generation {
        align-self: stretch;
    }

    .star-5 {
        width: 88px;
        height: 88px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: #0f0072;
        border: 0.88px #0f0072 solid;
    }

    .star-4 {
        width: 81.48px;
        height: 81.48px;
        left: 6.52px;
        top: 0px;
        position: absolute;
        background: white;
        border: 0.81px #0f0072 solid;
    }

    .star-6 {
        width: 65.19px;
        height: 65.19px;
        left: 14.66px;
        top: 8.15px;
        position: absolute;
        background: #438bff;
    }

    .eyebrow {
        width: 12.22px;
        height: 4.07px;
        left: 33px;
        top: 22.82px;
        position: absolute;
        border-radius: 3.37px;
        outline: 1.63px white solid;
        outline-offset: -0.81px;
    }

    .eyebrow_01 {
        width: 12.22px;
        height: 4.07px;
        left: 49.3px;
        top: 22.82px;
        position: absolute;
        border-radius: 3.37px;
        outline: 1.63px white solid;
        outline-offset: -0.81px;
    }

    .rectangle-10 {
        width: 16.3px;
        height: 16.3px;
        left: 0px;
        top: 0px;
        position: absolute;
        background: white;
        border-radius: 81.48px;
    }

    .rectangle-11 {
        width: 16.3px;
        height: 16.3px;
        left: 16.3px;
        top: 0px;
        position: absolute;
        background: white;
        border-radius: 81.48px;
    }

    .rectangle-12 {
        width: 9.78px;
        height: 9.78px;
        left: 16.3px;
        top: 3.26px;
        position: absolute;
        background: #111111;
        border-radius: 81.48px;
    }

    .rectangle-13 {
        width: 9.78px;
        height: 9.78px;
        left: 6.52px;
        top: 3.26px;
        position: absolute;
        background: #111111;
        border-radius: 81.48px;
    }

    .polygon-1 {
        width: 18.56px;
        height: 36.5px;
        left: -2.5px;
        top: 49.56px;
        position: absolute;
        transform: rotate(-90deg);
        transform-origin: top left;
        background: #d9eaff;
    }

    .letsdesignthededicationpagesforyourgift_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .dedicationpagespreview_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .dedication-pages-preview {
        text-align: center;
    }

    .book {
        align-self: stretch;
        height: 700px;
        position: relative;
        box-shadow: 2px -12px 4px 1px white inset;
        border-radius: 24px;
    }

    .informationdedicationpages_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .dedicationmessages_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .dearemmaadventureawaitsforthebravestofheartsjustlikeyoursfrompapa_span {
        color: #141414;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa {
        flex: 1 1 0;
    }

    .f2200characters_span {
        color: #727272;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .text-42200-characters {
        align-self: stretch;
    }

    .vector_01 {
        width: 18px;
        height: 15px;
        left: 3px;
        top: 4.5px;
        position: absolute;
        background: black;
    }

    .backtostep_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .back-to-step {
        text-align: center;
    }

    .continuetopreviewstory_span {
        color: white;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .continue-to-preview-story {
        text-align: center;
    }

    .ellipse-1415 {
        width: 248px;
        height: 114px;
        left: 2px;
        top: 25px;
        position: absolute;
        background: radial-gradient(
            ellipse 42.11% 42.11% at 50% 52.94%,
            white 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 9999px;
    }

    .dot {
        width: 8px;
        height: 8px;
        background: #131314;
        border-radius: 9999px;
    }

    .line {
        width: 106px;
        height: 2px;
        background: #131314;
    }

    .title_span {
        color: white;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 20px;
        word-wrap: break-word;
    }

    .content_01_span {
        color: white;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 20px;
        word-wrap: break-word;
    }

    .dot_01 {
        width: 8px;
        height: 8px;
        background: #131314;
        border-radius: 9999px;
    }

    .line_01 {
        width: 106px;
        height: 2px;
        background: #131314;
    }

    .title_01_span {
        color: white;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 20px;
        word-wrap: break-word;
    }

    .content_03_span {
        color: white;
        font-size: 14px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 20px;
        word-wrap: break-word;
    }

    .frame-1410103862 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .frame-1410103829 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_02 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_03 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410103829_04 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .frame-1410104026 {
        padding-left: 12px;
        padding-right: 12px;
        padding-top: 16px;
        padding-bottom: 16px;
        left: 22px;
        top: 0px;
        position: absolute;
        background: #d9eaff;
        border-radius: 24px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: inline-flex;
    }

    .frame-1410104034 {
        align-self: stretch;
        padding: 8px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: inline-flex;
    }

    .input-placeholder {
        align-self: stretch;
        height: 168px;
        padding: 12px;
        background: white;
        overflow: hidden;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: inline-flex;
    }

    .dedication-textarea {
        width: 100%;
        height: 100%;
        border: none;
        outline: none;
        resize: none;
        background: transparent;
        color: #141414;
        font-size: 16px;
        font-family: DM Sans;
        line-height: 22.4px;
    }

    .content {
        padding: 16px;
        background: #131314;
        box-shadow: 0px 3px 8px rgba(19, 19, 20, 0.12);
        overflow: hidden;
        border-radius: 8px;
        outline: 1px #44474a solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .content_02 {
        padding: 16px;
        background: #131314;
        box-shadow: 0px 3px 8px rgba(19, 19, 20, 0.12);
        overflow: hidden;
        border-radius: 8px;
        outline: 1px #44474a solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
    }

    .shieldstar {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
        margin: auto;
    }

    .eye {
        width: 32.59px;
        height: 16.3px;
        left: 30.96px;
        top: 30.76px;
        position: absolute;
    }

    .arrowleft {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .frame-1410104246 {
        height: 54px;
        padding-left: 20px;
        padding-right: 20px;
        padding-top: 16px;
        padding-bottom: 16px;
        position: relative;
        background: #438bff;
        overflow: hidden;
        border-radius: 12px;
        justify-content: center;
        align-items: center;
        gap: 8px;
        display: flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .frame-1410104246:hover:not(.disabled) {
        background: #3578e5;
    }
    
    .frame-1410104246:active:not(.disabled) {
        background: #2d6bd1;
    }
    
    .frame-1410104246.disabled {
        background: #cccccc;
        cursor: not-allowed;
        opacity: 0.6;
    }
    
    .frame-1410104246.disabled:hover {
        background: #cccccc;
    }

    .heading_01 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .progress-bar_02 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_03 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_04 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_05 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .progress-bar_06 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: inline-flex;
    }

    .frame-1410104029 {
        width: 468px;
        height: 82px;
        position: relative;
        background: white;
    }

    .frame-8 {
        flex: 1 1 0;
        height: 791px;
        padding: 10px;
        background: white;
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .input-form {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: flex;
    }

    .annotation {
        justify-content: center;
        align-items: center;
        display: inline-flex;
    }

    .annotation_01 {
        justify-content: center;
        align-items: center;
        display: inline-flex;
    }

    .navbar {
        align-self: stretch;
        height: 79px;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 24px;
        padding-right: 12px;
        border-radius: 20px;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .tag {
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        background: #eef6ff;
        border-radius: 99px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: flex-end;
        gap: 4px;
        display: inline-flex;
    }

    .loopa {
        width: 88px;
        height: 88px;
        position: relative;
    }

    .button {
        width: 200px;
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 16px;
        padding-bottom: 16px;
        box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
        border-radius: 20px;
        outline: 1px #dcdcdc solid;
        outline-offset: -1px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .button:hover {
        background: #f8f9fa;
        transform: translateY(-1px);
        box-shadow: 0px 6px 8px rgba(98.89, 98.89, 98.89, 0.25);
    }

    .progress-bar_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        display: inline-flex;
    }

    .form_01 {
        align-self: stretch;
        padding: 12px;
        border-radius: 10px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-1410104027 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .img-star {
        width: 88px;
        height: 88px;
        margin: auto;
    }

    .frame-1410103870 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .progress-bar {
        width: 1240px;
        padding: 8px;
        background: white;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 8px;
        display: flex;
    }

    .form {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame-1410103860 {
        align-self: stretch;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .frame-9 {
        flex: 1 1 0;
        padding: 16px;
        background: white;
        border-radius: 20px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 24px;
        display: inline-flex;
    }

    .frame-1410104031 {
        align-self: stretch;
        justify-content: center;
        align-items: flex-start;
        gap: 24px;
        display: inline-flex;
    }

    .frame-1410103818 {
        width: 1240px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .dedication-pages-when-selected-create-send {
        width: 100%;
        height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
        display: inline-flex;
    }

    @media (max-width: 800px) {
        .dedication-pages-when-selected-create-send {
            padding-left: 16px;
            padding-right: 16px;
            padding-top: 24px;
            padding-bottom: 32px;
            gap: 32px;
        }

        .frame-1410103818 {
            width: 100%;
            gap: 24px;
        }

        .heading {
            align-items: flex-start;
        }

        .here-your-magical-story {
            width: 100%;
            text-align: left;
        }

        .hereyourmagicalstory_span {
            font-size: 32px;
            line-height: 38.4px;
        }

        .your-character-is-now-part-of-their-very-own-adventure {
            width: 100%;
            text-align: left;
        }

        .yourcharacterisnowpartoftheirveryownadventure_span {
            font-size: 16px;
            line-height: 22.4px;
        }

        .progress-bar {
            width: 100%;
        }

        .frame-1410104027 {
            width: 100%;
            justify-content: center;
        }

        .img-star {
            width: 64px;
            height: 64px;
        }

        .frame-1410104029 {
            width: 100%;
            max-width: 100%;
        }

        .frame-1410104026 {
            width: calc(100% - 40px);
            max-width: 269px;
            left: 20px;
            padding-left: 10.70px;
            padding-right: 10.70px;
            padding-top: 14.26px;
            padding-bottom: 14.26px;
        }

        .letsdesignthededicationpagesforyourgift_span {
            font-size: 16px;
            line-height: 22.4px;
        }

        .frame-1410104031 {
            flex-direction: column;
            width: 100%;
            gap: 24px;
        }

        .frame-8 {
            width: 100%;
            height: auto;
            flex: none;
        }

        .book {
            height: 459px;
        }

        .dedicationpagespreview_span {
            font-size: 20px;
            line-height: 24px;
        }

        .frame-9 {
            width: 100%;
            flex: none;
        }

        .informationdedicationpages_span {
            font-size: 20px;
            line-height: 24px;
        }

        .dedicationmessages_span {
            font-size: 14px;
            line-height: 19.6px;
        }

        .dedication-textarea {
            font-size: 14px;
            line-height: 19.6px;
        }

        .f2200characters_span {
            font-size: 16px;
            line-height: 22.4px;
        }

        .frame-1410103860 {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
        }

        .frame-1410103870 {
            width: 100%;
        }

        .button {
            width: 100%;
        }

        .backtostep_span {
            font-size: 16px;
            line-height: 22.4px;
        }

        .frame-1410104246 {
            width: 100%;
        }

        .continuetopreviewstory_span {
            font-size: 16px;
            line-height: 22.4px;
        }

        .ellipse-1415 {
            width: 248px;
            height: 114px;
            left: 52px;
            top: 17px;
        }

        .navbar {
            padding-left: 20px;
            padding-right: 20px;
        }

        .img-logo {
            width: 170.15px;
            height: 31.80px;
        }
    }
</style>
