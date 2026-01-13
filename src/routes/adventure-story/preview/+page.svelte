<script lang="ts">
    import logo from "../../../assets/logo.png";
    import shieldStar from "../../../assets/ShieldStar.svg";
    import star from "../../../assets/star.png";
    import classicStorybook from "../../../assets/classic_storybook.png";
    import modernMinimalist from "../../../assets/modern_minimalist.png";
    import adventureTheme from "../../../assets/adventure_theme.png";
    import arrowLeft from "../../../assets/ArrowLeft.svg";
    import { goto } from "$app/navigation";

    // State for title selection
    let selectedTitle = 0; // 0 = "The Great Addventure", 1 = "The Amazing of Journey", 2 = "Space Adventure", 3 = "Custom Title"

    // State for cover design selection
    let selectedCoverDesign = 0; // 0 = "Classic Storybook", 1 = "Modern Minimalist", 2 = "Adventure Theme"

    function selectTitle(index: number) {
        selectedTitle = index;
    }

    function selectCoverDesign(index: number) {
        selectedCoverDesign = index;
    }

    function handleBackToStep() {
        goto("/adventure-story");
    }
</script>

<div class="cover-book-preview-filled">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={logo} alt="logo" class="logo-img" />
        </div>
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
                    <img src={shieldStar} alt="shieldstar" />
                </div>
                <div>
                    <span class="ffreepagepreview_span"
                        >2 Free Page Preview</span
                    >
                </div>
            </div>
        </div>
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
        <div class="frame-1410104027">
            <div class="">
                <img src={star} alt="star" class="loopa" />
            </div>
            <div class="frame-1410104029">
                <div class="polygon-1"></div>
                <div class="frame-1410104026">
                    <div>
                        <span class="letsdesigntheperfectcoverforyourstory_span"
                            >Let's design the perfect cover for your story!</span
                        >
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410104031">
            <div class="frame-8">
                <div class="frame-1410104034">
                    <div class="cover-book-preview">
                        <span class="coverbookpreview_span"
                            >Cover Book Preview</span
                        >
                    </div>
                </div>
                <img class="book" src={selectedCoverDesign === 0 ? classicStorybook : selectedCoverDesign === 1 ? modernMinimalist : adventureTheme} alt="Book Cover Preview" />
            </div>
            <div class="frame-9">
                <div class="information-cover">
                    <span class="informationcover_span">Information Cover</span>
                </div>
                <div class="form">
                    <div class="form_01">
                        <div>
                            <span class="titleselection_span"
                                >TItle Selection</span
                            >
                        </div>
                        <div class="frame-1410103942">
                            <div 
                                class={selectedTitle === 0 ? "selected" : "selected_01"}
                                on:click={() => selectTitle(0)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectTitle(0)}
                            >
                                <div class="frame-1410103940">
                                    <div class="frame-1410103939">
                                        <div>
                                            <span
                                                class="thegreataddventureyourname_span"
                                                >The Great Addventure [Your
                                                Name]
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13"></div>
                                {#if selectedTitle === 0}
                                    <div class="frame-1410104043">
                                        <div class="ellipse-14"></div>
                                        <div class="ellipse-13_01"></div>
                                    </div>
                                {/if}
                            </div>
                            <div 
                                class={selectedTitle === 1 ? "selected" : "selected_01"}
                                on:click={() => selectTitle(1)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectTitle(1)}
                            >
                                <div class="frame-1410103940_01">
                                    <div class="frame-1410103939_01">
                                        <div>
                                            <span
                                                class="theamazingofjourneyyourname_span"
                                                >The Amazing of Journey [Your
                                                Name]
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_02"></div>
                                {#if selectedTitle === 1}
                                    <div class="frame-1410104043">
                                        <div class="ellipse-14"></div>
                                        <div class="ellipse-13_01"></div>
                                    </div>
                                {/if}
                            </div>
                            <div 
                                class={selectedTitle === 2 ? "selected" : "selected_01"}
                                on:click={() => selectTitle(2)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectTitle(2)}
                            >
                                <div class="frame-1410103940_02">
                                    <div class="frame-1410103939_02">
                                        <div>
                                            <span
                                                class="yournameandthespaceadventure_span"
                                                >[Your Name] and the Space
                                                Adventure</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_03"></div>
                                {#if selectedTitle === 2}
                                    <div class="frame-1410104043">
                                        <div class="ellipse-14"></div>
                                        <div class="ellipse-13_01"></div>
                                    </div>
                                {/if}
                            </div>
                            <div 
                                class={selectedTitle === 3 ? "selected" : "selected_03"}
                                on:click={() => selectTitle(3)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectTitle(3)}
                            >
                                <div class="frame-1410104084">
                                    <div class="frame-1410103940_03">
                                        <div class="frame-1410103939_03">
                                            <div>
                                                <span class="customtitle_span"
                                                    >Custom Title</span
                                                >
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_04"></div>
                                {#if selectedTitle === 3}
                                    <div class="frame-1410104043">
                                        <div class="ellipse-14"></div>
                                        <div class="ellipse-13_01"></div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="form_02">
                        <div class="select-your-book-cover-design">
                            <span class="selectyourbookcoverdesign_span"
                                >Select your Book Cover Design</span
                            >
                        </div>
                        <div class="frame-1410103942_01">
                            <div 
                                class={selectedCoverDesign === 0 ? "selected_04" : "selected_05"}
                                on:click={() => selectCoverDesign(0)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectCoverDesign(0)}
                            >
                                <img
                                    class="frame-1410104088"
                                    src={classicStorybook}
                                    alt="Classic Storybook Cover"
                                />
                                <div class="frame-1410103940_04">
                                    <div class="frame-1410103939_04">
                                        <div>
                                            <span class="classicstorybook_span"
                                                >Classic Storybook</span
                                            >
                                        </div>
                                        <div>
                                            <span
                                                class="ornateborderwithtraditionalcharm_span"
                                                >Ornate border with traditional
                                                charm</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_05"></div>
                                {#if selectedCoverDesign === 0}
                                    <div class="frame-1410104043_01">
                                        <div class="ellipse-14_01"></div>
                                        <div class="ellipse-13_06"></div>
                                    </div>
                                {/if}
                            </div>
                            <div 
                                class={selectedCoverDesign === 1 ? "selected_04" : "selected_05"}
                                on:click={() => selectCoverDesign(1)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectCoverDesign(1)}
                            >
                                <div class="frame-1410103940_05">
                                    <img
                                        class="frame-1410104088_01"
                                        src={modernMinimalist}
                                        alt="modernMinimalist"
                                    />
                                    <div class="frame-1410103939_05">
                                        <div>
                                            <span class="modernminimalist_span"
                                                >Modern Minimalist</span
                                            >
                                        </div>
                                        <div>
                                            <span
                                                class="characterfocuswithcleandesign_span"
                                                >Character focus with clean
                                                design</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_07"></div>
                                {#if selectedCoverDesign === 1}
                                    <div class="frame-1410104043_01">
                                        <div class="ellipse-14_01"></div>
                                        <div class="ellipse-13_06"></div>
                                    </div>
                                {/if}
                            </div>
                            <div 
                                class={selectedCoverDesign === 2 ? "selected_04" : "selected_06"}
                                on:click={() => selectCoverDesign(2)}
                                role="button"
                                tabindex="0"
                                on:keydown={(e) => e.key === 'Enter' && selectCoverDesign(2)}
                            >
                                <div class="frame-1410103940_06">
                                    <img
                                        class="frame-1410104088_02"
                                        src={adventureTheme}
                                        alt="adventureTheme"
                                    />
                                    <div class="frame-1410103939_06">
                                        <div>
                                            <span class="adventuretheme_span"
                                                >Adventure Theme</span
                                            >
                                        </div>
                                        <div>
                                            <span
                                                class="worldelementsanddynamiclayout_span"
                                                >World elements and dynamic
                                                layout</span
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div class="ellipse-13_08"></div>
                                {#if selectedCoverDesign === 2}
                                    <div class="frame-1410104043_01">
                                        <div class="ellipse-14_01"></div>
                                        <div class="ellipse-13_06"></div>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103860">
            <div class="frame-1410103870">
                <div class="button" on:click={handleBackToStep} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleBackToStep()}>
                    <div class="arrowleft">
                        <img src={arrowLeft} alt="arrow" />
                    </div>
                    <div class="back-to-step">
                        <span class="backtostep_span">Back To Step</span>
                    </div>
                </div>
            </div>
            <div class="frame-1410104246">
                <div class="continue-to-dedication-page">
                    <span class="continuetodedicationpage_span"
                        >Continue to Dedication Page</span
                    >
                </div>
                <div class="ellipse-1415"></div>
            </div>
        </div>
    </div>
</div>

<style>

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

    .letsdesigntheperfectcoverforyourstory_span {
        color: black;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .coverbookpreview_span {
        color: black;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .cover-book-preview {
        text-align: center;
    }

    .book {
        align-self: stretch;
        height: 700px;
        position: relative;
        box-shadow: 2px -12px 4px 1px white inset;
        border-radius: 24px;
    }

    .informationcover_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28.8px;
        word-wrap: break-word;
    }

    .information-cover {
        align-self: stretch;
    }

    .titleselection_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .thegreataddventureyourname_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 1px #ededed solid;
    }

    .ellipse-14 {
        width: 24px;
        height: 24px;
        left: 0px;
        top: 0px;
        position: absolute;
        border-radius: 9999px;
        border: 1px #438bff solid;
    }

    .ellipse-13_01 {
        width: 12px;
        height: 12px;
        left: 6px;
        top: 6px;
        position: absolute;
        background: #438bff;
        border-radius: 9999px;
        border: 1px #438bff solid;
    }

    .theamazingofjourneyyourname_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_02 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 2px #ededed solid;
    }

    .yournameandthespaceadventure_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_03 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 2px #ededed solid;
    }

    .customtitle_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_04 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 2px #ededed solid;
    }

    .selectyourbookcoverdesign_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .select-your-book-cover-design {
        align-self: stretch;
    }

    .frame-1410104088 {
        width: 80px;
        height: 91px;
        position: relative;
        background: white;
        border-radius: 4px;
    }

    .classicstorybook_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ornateborderwithtraditionalcharm_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_05 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 1px #ededed solid;
    }

    .ellipse-14_01 {
        width: 24px;
        height: 24px;
        left: 0px;
        top: 0px;
        position: absolute;
        border-radius: 9999px;
        border: 1px #438bff solid;
    }

    .ellipse-13_06 {
        width: 12px;
        height: 12px;
        left: 6px;
        top: 6px;
        position: absolute;
        background: #438bff;
        border-radius: 9999px;
        border: 1px #438bff solid;
    }

    .frame-1410104088_01 {
        width: 80px;
        height: 91px;
        position: relative;
        background: white;
        border-radius: 4px;
    }

    .modernminimalist_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .characterfocuswithcleandesign_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_07 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 1px #ededed solid;
    }

    .frame-1410104088_02 {
        width: 80px;
        height: 91px;
        position: relative;
        background: white;
        border-radius: 4px;
    }

    .adventuretheme_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .worldelementsanddynamiclayout_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ellipse-13_08 {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        border: 1px #ededed solid;
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
        cursor: pointer;
    }

    .continuetodedicationpage_span {
        color: white;
        font-size: 17px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .continue-to-dedication-page {
        text-align: center;
        cursor: pointer;
    }

    .ellipse-1415 {
        width: 248px;
        height: 114px;
        left: 10px;
        top: 25px;
        position: absolute;
        background: radial-gradient(
            ellipse 42.11% 42.11% at 50% 52.94%,
            white 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 9999px;
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

    .frame-1410103939 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_01 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_02 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_03 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_04 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_05 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410103939_06 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .logo-img {
        width: 100%;
        height: 100%;
    }

    .shieldstar {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
        align-items: center;
    }

    .frame-1410104043 {
        width: 24px;
        height: 24px;
        position: relative;
    }

    .frame-1410104043_01 {
        width: 24px;
        height: 24px;
        position: relative;
    }

    .arrowleft {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .frame-1410104246 {
        width: 278px;
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

    .frame-1410103940 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410103940_01 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410103940_02 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410103940_03 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410103940_04 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410103940_05 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410103940_06 {
        flex: 1 1 0;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
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
    }

    .progress-bar_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 8px;
        display: inline-flex;
    }

    .selected {
        align-self: stretch;
        padding: 12px;
        background: #eef6ff;
        border-radius: 12px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected:hover {
        background: #d9eaff;
    }

    .selected_01 {
        align-self: stretch;
        padding: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected_01:hover {
        outline: 1px #438bff solid;
        background: #f9fbff;
    }

    .frame-1410104084 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 4px;
        display: inline-flex;
    }

    .selected_04 {
        align-self: stretch;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        background: #eef6ff;
        border-radius: 12px;
        outline: 1px #438bff solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected_04:hover {
        background: #d9eaff;
    }

    .selected_05 {
        align-self: stretch;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected_05:hover {
        outline: 1px #438bff solid;
        background: #f9fbff;
    }

    .selected_06 {
        align-self: stretch;
        padding-top: 8px;
        padding-bottom: 8px;
        padding-left: 8px;
        padding-right: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected_06:hover {
        outline: 1px #438bff solid;
        background: #f9fbff;
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

    .selected_03 {
        align-self: stretch;
        padding: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .selected_03:hover {
        outline: 1px #438bff solid;
        background: #f9fbff;
    }

    .frame-1410103942_01 {
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

    .frame-1410103942 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .form_02 {
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

    .form {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame-9 {
        width: 627px;
        height: 791px;
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

    .cover-book-preview-filled {
        width: 100%;
        height: 100%;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        overflow: hidden;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 48px;
        display: inline-flex;
    }
</style>
