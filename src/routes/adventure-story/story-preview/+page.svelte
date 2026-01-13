<script lang="ts">
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { storyCreation } from "../../../lib/stores/storyCreation";
    import drawtopia from "../../../assets/logo.png";
    import shieldstar from "../../../assets/ShieldStar.svg";
    import arrowleft from "../../../assets/ArrowLeft.svg";
    import floppydiskback from "../../../assets/FloppyDiskBack.svg";
    import bookopentext from "../../../assets/BookOpenText.svg";
    import palette from "../../../assets/Palette.svg";
    import globehemispherewest from "../../../assets/GlobeHemisphereWest.svg";
    import globestand from "../../../assets/GlobeStand.svg";
    import notepad from "../../../assets/Notepad.svg";
    import genderneuter from "../../../assets/GenderNeuter.svg";
    import check from "../../../assets/Check_blue.svg";
    import { goto } from "$app/navigation";
    import ProgressBar from "../../../components/ProgressBar.svelte";
    import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";

    let isMobile = false;

    $: if (browser) {
        isMobile = window.innerWidth < 800;
    }

    // Helper functions for display names
    function getCharacterTypeDisplayName(type: string): string {
        if (!type) return "[Type]";
        const typeMap: { [key: string]: string } = {
            "person": "Person",
            "animal": "Animal",
            "magical_creature": "Magical Creature"
        };
        return typeMap[type.toLowerCase()] || type;
    }

    function getWorldDisplayName(world: string): string {
        if (!world) return "Outer Space";
        const worldMap: { [key: string]: string } = {
            "forest": "Enchanted Forest",
            "space": "Outer Space",
            "outerspace": "Outer Space",
            "outspace": "Outer Space",
            "underwater": "Underwater Kingdom"
        };
        return worldMap[world.toLowerCase()] || world;
    }

    function getAdventureTypeDisplayName(adventure: string): string {
        if (!adventure) return "Help a Friend";
        const adventureMap: { [key: string]: string } = {
            "treasure_hunt": "Treasure Hunt",
            "helping_friend": "Help a Friend"
        };
        return adventureMap[adventure.toLowerCase()] || adventure;
    }

    function getStyleDisplayName(style: string): string {
        if (!style) return "Anime";
        const styleMap: { [key: string]: string } = {
            "3d": "3D",
            "cartoon": "Cartoon",
            "anime": "Anime"
        };
        return styleMap[style.toLowerCase()] || style;
    }

    // Initialize store on mount
    onMount(() => {
        if (browser) {
            storyCreation.init();
        }
    });

    // Reactive store subscription
    $: storyState = $storyCreation;
    
    // Computed values for display
    $: storyTitle = storyState?.storyTitle || "[Storybook Title]";
    $: characterName = storyState?.characterName || "[Character Name]";
    $: characterType = storyState?.characterType || "";
    $: specialAbility = storyState?.specialAbility || "[Special Ability]";
    $: storyCover = storyState?.storyCover || "https://placehold.co/287x431";
    $: originalImageUrl = storyState?.originalImageUrl || "https://placehold.co/91x90";
    $: storyWorld = storyState?.storyWorld || "";
    $: adventureType = storyState?.adventureType || "";
    $: characterStyle = storyState?.characterStyle || "";
    
    $: characterTypeDisplay = getCharacterTypeDisplayName(characterType);
    $: characterInfo = characterName && characterType && characterName !== "[Character Name]" && characterType !== ""
        ? `${characterName} ${characterTypeDisplay}${specialAbility && specialAbility !== "[Special Ability]" ? ` with ${specialAbility}` : ""}`
        : "[Character Name] [Type] with [Special Ability]";
    $: worldDisplay = getWorldDisplayName(storyWorld);
    $: adventureDisplay = getAdventureTypeDisplayName(adventureType);
    $: styleDisplay = getStyleDisplayName(characterStyle);
</script>

<div class="story-preview-summary-default">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopia} alt="drawtopia logo" class="img-logo" />
        </div>
    </div>
    <div class="arrow">
        <div class="button" on:click={() => {goto('/create-character/dedication/create-send')}}>
            <div class="arrowleft">
                <img
                    src={arrowleft}
                    alt="arrowleft"
                    class="img-arrowleft"
                />
            </div>
            <div class="back">
                <span class="back_span">Back</span>
            </div>
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="heading_01">
                <div class="frame-1410103862">
                    <div class="here-your-preview-story">
                        <span class="hereyourpreviewstory_span"
                            >Here your Preview Story</span
                        >
                    </div>
                    <div
                        class="review-your-personalized-story-details-before-completing-your-order"
                    >
                        <span
                            class="reviewyourpersonalizedstorydetailsbeforecompletingyourorder_span"
                            >Review your personalized story details before
                            completing your order.</span
                        >
                    </div>
                </div>
            </div>
            <div class="tag">
                <div class="shieldstar">
                    <img
                        src={shieldstar}
                        alt="shieldstar"
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
        <MobileStepProgressBar currentStep={6} />
        <ProgressBar currentStep={6} />
        <div class="frame-1410104031">
            <div class="frame-9">
                <div class="story-summary">
                    <span class="storysummary_span">Story Summary</span>
                </div>
                <div class="frame-1410104097">
                    <div class="frame-1410104091">
                        <img
                            class="frame-1410104089"
                            src={originalImageUrl}
                            alt="Story summary"
                        />
                        <div class="frame-1410104090">
                            <div class="storybook-title">
                                <span class="storybooktitle_span"
                                    >{storyTitle}</span
                                >
                            </div>
                            <div
                                class="character-name-type-with-special-ability"
                            >
                                <span
                                    class="characternametypewithspecialability_span"
                                    >{characterInfo}</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="stroke"></div>
                    <div class="frame-1410104096">
                        <div class="frame-1410104094">
                            <div class="frame-1410104092">
                                <div class="frame-1410104099">
                                    <div class="bookopentext">
                                        <img
                                            src={bookopentext}
                                            alt="bookopentext"
                                            class="img-bookopentext"
                                        />
                                    </div>
                                </div>
                                <div class="frame-1410104098">
                                    <div class="style">
                                        <span class="style_span">Style</span>
                                    </div>
                                    <div class="anime">
                                        <span class="anime_span">{styleDisplay}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104093">
                                <div class="frame-1410104099_01">
                                    <div class="palette">
                                        <img src={palette} alt="palette" class="img-palette" />
                                    </div>
                                </div>
                                <div class="frame-1410104100">
                                    <div class="enhancement">
                                        <span class="enhancement_span"
                                            >Enhancement:</span
                                        >
                                    </div>
                                    <div class="normal">
                                        <span class="normal_span">Normal</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="frame-1410104095">
                            <div class="frame-1410104092_01">
                                <div class="frame-1410104099_02">
                                    <div class="globehemispherewest">
                                        <img
                                            src={globehemispherewest}
                                            alt="globehemispherewest"
                                            class="img-globehemispherewest"
                                        />
                                    </div>
                                </div>
                                <div class="frame-1410104102">
                                    <div class="story-world">
                                        <span class="storyworld_span"
                                            >Story World:</span
                                        >
                                    </div>
                                    <div class="outer-space">
                                        <span class="outerspace_span"
                                            >{worldDisplay}</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104093_01">
                                <div class="frame-1410104099_03">
                                    <div class="globestand">
                                        <img
                                            src={globestand}
                                            alt="globestand"
                                            class="img-globestand"
                                        />
                                    </div>
                                </div>
                                <div class="frame-1410104101">
                                    <div class="difficulty-adventure-type">
                                        <span
                                            class="difficultyadventuretype_span"
                                            >Difficulty / Adventure Type::</span
                                        >
                                    </div>
                                    <div class="help-a-friend">
                                        <span class="helpafriend_span"
                                            >{adventureDisplay}</span
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="frame-1410104096_01">
                            <div class="frame-1410104092_02">
                                <div class="frame-1410104099_04">
                                    <div class="notepad">
                                        <img src={notepad} alt="notepad" class="img-notepad" />
                                    </div>
                                </div>
                                <div class="frame-1410104102_01">
                                    <div class="format">
                                        <span class="format_span">Format</span>
                                    </div>
                                    <div class="story-adventure">
                                        <span class="storyadventure_span"
                                            >Story Adventure</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104093_02">
                                <div class="frame-1410104099_05">
                                    <div class="genderneuter">
                                        <img
                                            src={genderneuter}
                                            alt="genderneuter"
                                            class="img-genderneuter"
                                        />
                                    </div>
                                </div>
                                <div class="frame-1410104101_01">
                                    <div class="age-group">
                                        <span class="agegroup_span"
                                            >Age Group</span
                                        >
                                    </div>
                                    <div class="ages-11-12">
                                        <span class="ages11-12_span"
                                            >Ages 11-12
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="frame-1410104098_01">
                    <div class="frame-1410104091_01">
                        <div class="frame-1410104090_01">
                            <div class="story-details">
                                <span class="storydetails_span"
                                    >Story Details</span
                                >
                            </div>
                        </div>
                    </div>
                    <div class="stroke_01"></div>
                    <div class="frame-1410104096_02">
                        <div class="frame-1410104094_01">
                            <div class="frame-1410104092_03">
                                <div class="frame-1410104098_02">
                                    <div class="pages">
                                        <span class="pages_span">Pages</span>
                                    </div>
                                    <div class="text-8">
                                        <span class="f_span">8</span>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104094_02">
                                <div class="frame-1410104098_03">
                                    <div class="min-read">
                                        <span class="minread_span"
                                            >Min Read</span
                                        >
                                    </div>
                                    <div class="text-5-7-min">
                                        <span class="f-7min_span">5-7 Min</span>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104093_03">
                                <div class="frame-1410104100_01">
                                    <div class="min-audio">
                                        <span class="minaudio_span"
                                            >Min Audio</span
                                        >
                                    </div>
                                    <div class="text-12-min">
                                        <span class="f2min_span">12 Min</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form">
                <div class="information-book-cover">
                    <span class="informationbookcover_span"
                        >Information Book Cover</span
                    >
                </div>
                <div class="frame-1410104103">
                    <img class="image" src={storyCover} alt="Book cover" />
                    <div class="frame-1410104075">
                        <div class="checklist">
                            <div class="check">
                                <div class="check_01">
                                    <img src={check} alt="check" />
                                </div>
                            </div>
                            <div>
                                <span class="digitalbook_span"
                                    >Digital Book</span
                                >
                            </div>
                        </div>
                        <div class="checklist_01">
                            <div class="check_02">
                                <div class="check_03">
                                    <img src={check} alt="check" />
                                </div>
                            </div>
                            <div>
                                <span class="audioversion_span"
                                    >Audio Version</span
                                >
                            </div>
                        </div>
                        <div class="checklist_02">
                            <div class="check_04">
                                <div class="check_05">
                                    <img
                                        src={check}
                                        alt="check"
                                        class="check"
                                    />
                                </div>
                            </div>
                            <div>
                                <span class="print-readypdf_span">
                                    Print-Ready PDF</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103860">
            <div class="frame-1410103870">
                <div class="button" on:click={() => {goto('/create-character/dedication/create-send')}}>
                    <div class="arrowleft">
                        <img
                            src={arrowleft}
                            alt="arrowleft"
                            class="img-arrowleft"
                        />
                    </div>
                    <div class="back-to-step">
                        <span class="backtostep_span">Back To Step</span>
                    </div>
                </div>
            </div>
            <div class="frame-2147227646">
                <div class="button_01" on:click={() => {goto('/dashboard')}} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && goto('/dashboard')}>
                    <div class="save-as-draft">
                        <span class="saveasdraft_span">Save as Draft</span>
                    </div>
                </div>
                <div class="frame-1410104246" on:click={() => {goto('/adventure-story/loading')}}>
                    <div class="ellipse-1415"></div>
                    <div class="floppydiskback">
                        <img
                            src={floppydiskback}
                            alt="floppydiskback"
                            class="img-floppydiskback"
                        />
                    </div>
                    <div class="generate-and-preview-story">
                        <span class="generateandpreviewstory_span"
                            >Generate and Preview Story</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .hereyourpreviewstory_span {
        color: #141414;
        font-size: 48px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 57.6px;
        word-wrap: break-word;
    }

    .here-your-preview-story {
        width: 1040px;
        text-align: center;
    }

    .reviewyourpersonalizedstorydetailsbeforecompletingyourorder_span {
        color: #727272;
        font-size: 18px;
        font-family: DM Sans;
        font-weight: 400;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .review-your-personalized-story-details-before-completing-your-order {
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


    .storysummary_span {
        color: #141414;
        font-size: 20px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28px;
        word-wrap: break-word;
    }

    .story-summary {
        align-self: stretch;
    }

    .frame-1410104089 {
        width: 91px;
        position: relative;
        border-radius: 4px;
    }

    .storybooktitle_span {
        color: black;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .storybook-title {
        width: 320px;
    }

    .characternametypewithspecialability_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .character-name-type-with-special-ability {
        align-self: stretch;
    }

    .stroke {
        align-self: stretch;
        height: 1px;
        background: #ededed;
    }

    .style_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .style {
        align-self: stretch;
    }

    .anime_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .anime {
        align-self: stretch;
    }

    .enhancement_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .enhancement {
        width: 141px;
    }

    .normal_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .normal {
        align-self: stretch;
    }

    .storyworld_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .story-world {
        align-self: stretch;
    }

    .outerspace_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .outer-space {
        align-self: stretch;
    }

    .difficultyadventuretype_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .difficulty-adventure-type {
        align-self: stretch;
    }

    .helpafriend_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .help-a-friend {
        width: 150px;
    }

    .format_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .format {
        align-self: stretch;
    }

    .storyadventure_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .story-adventure {
        align-self: stretch;
    }

    .agegroup_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .age-group {
        align-self: stretch;
    }

    .ages11-12_span {
        color: #141414;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .ages-11-12 {
        width: 203px;
    }

    .storydetails_span {
        color: black;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .story-details {
        width: 320px;
    }

    .stroke_01 {
        align-self: stretch;
        height: 1px;
        background: #ededed;
    }

    .pages_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .pages {
        align-self: stretch;
        text-align: center;
    }

    .f_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .text-8 {
        align-self: stretch;
        text-align: center;
    }

    .minread_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .min-read {
        align-self: stretch;
        text-align: center;
    }

    .f-7min_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .text-5-7-min {
        align-self: stretch;
        text-align: center;
    }

    .minaudio_span {
        color: #727272;
        font-size: 16px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 22.4px;
        word-wrap: break-word;
    }

    .min-audio {
        width: 141px;
        text-align: center;
    }

    .f2min_span {
        color: #141414;
        font-size: 24px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 33.6px;
        word-wrap: break-word;
    }

    .text-12-min {
        align-self: stretch;
        text-align: center;
    }

    .informationbookcover_span {
        color: #141414;
        font-size: 20px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 28px;
        word-wrap: break-word;
    }

    .information-book-cover {
        align-self: stretch;
    }

    .image {
        height: 431px;
        position: relative;
        border-radius: 12px;
    }

    .digitalbook_span {
        color: #727272;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .audioversion_span {
        color: #727272;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .print-readypdf_span {
        color: #727272;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 700;
        line-height: 25.2px;
        word-wrap: break-word;
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

    .saveasdraft_span {
        color: #438bff;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .save-as-draft {
        text-align: center;
    }

    .ellipse-1415 {
        width: 248px;
        height: 114px;
        left: 28px;
        top: 25px;
        position: absolute;
        background: radial-gradient(
            ellipse 42.11% 42.11% at 50% 52.94%,
            white 0%,
            rgba(255, 255, 255, 0) 100%
        );
        border-radius: 9999px;
    }

    .generateandpreviewstory_span {
        color: white;
        font-size: 18px;
        font-family: Quicksand;
        font-weight: 600;
        line-height: 25.2px;
        word-wrap: break-word;
    }

    .generate-and-preview-story {
        text-align: center;
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

    .frame-1410104090 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: inline-flex;
    }

    .frame-1410104098 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104100 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104102 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104101 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104102_01 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104101_01 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 2px;
        display: inline-flex;
    }

    .frame-1410104090_01 {
        flex: 1 1 0;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 10px;
        display: inline-flex;
    }

    .frame-1410104098_02 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;
        display: flex;
    }

    .frame-1410104098_03 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;
        display: flex;
    }

    .frame-1410104100_01 {
        align-self: stretch;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 2px;
        display: flex;
    }

    .button_01 {
        padding-left: 24px;
        padding-right: 24px;
        padding-top: 12px;
        padding-bottom: 12px;
        background: #e7feff;
        box-shadow: 0px 4px 0px #438bff;
        border-radius: 12px;
        outline: 2px rgba(231, 254, 255, 0.2) solid;
        outline-offset: -2px;
        justify-content: center;
        align-items: center;
        gap: 10px;
        display: flex;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .button_01:hover {
        transform: translateY(-1px);
        box-shadow: 0px 5px 0px #438bff;
    }

    .button_01:active {
        transform: translateY(1px);
        box-shadow: 0px 3px 0px #438bff;
    }

    .logo-text-full {
        width: 203.32px;
        height: 38px;
        position: relative;
        margin: auto;
    }

    .img-logo {
        width: 100%;
        height: 100%;
    }

    .shieldstar {
        width: 20px;
        height: 20px;
        position: relative;
        overflow: hidden;
        margin: auto;
    }

    .bookopentext {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .palette {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .globehemispherewest {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .globestand {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .notepad {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .genderneuter {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .check_01 {
        width: 16px;
        height: 16px;
        left: 1px;
        top: 1px;
        position: absolute;
        overflow: hidden;
    }

    .check_03 {
        width: 16px;
        height: 16px;
        left: 1px;
        top: 1px;
        position: absolute;
        overflow: hidden;
    }

    .check_05 {
        width: 16px;
        height: 16px;
        left: 1px;
        top: 1px;
        position: absolute;
        overflow: hidden;
    }

    .arrowleft {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .floppydiskback {
        width: 24px;
        height: 24px;
        position: relative;
        overflow: hidden;
    }

    .heading_01 {
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }


    .frame-1410104091 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104091_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104092_03 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104094_02 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104093_03 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        gap: 12px;
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

    .frame-1410104099 {
        padding: 8px;
        background: #ff2f6a;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .frame-1410104099_01 {
        padding: 8px;
        background: #6912c5;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .frame-1410104099_02 {
        padding: 8px;
        background: #173db6;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .frame-1410104099_03 {
        padding: 8px;
        background: #0c8092;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .frame-1410104099_04 {
        padding: 8px;
        background: #ff1bdd;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .frame-1410104099_05 {
        padding: 8px;
        background: #ffb01f;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        display: flex;
    }

    .check {
        width: 18px;
        height: 18px;
        position: relative;
        background: #eef6ff;
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_02 {
        width: 18px;
        height: 18px;
        position: relative;
        background: #eef6ff;
        overflow: hidden;
        border-radius: 99999px;
    }

    .check_04 {
        width: 18px;
        height: 18px;
        position: relative;
        background: #eef6ff;
        overflow: hidden;
        border-radius: 99999px;
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

    .frame-1410104246:hover {
        background: #3578e5;
    }

    .frame-1410104246:active {
        background: #2d6bd1;
    }


    .frame-1410104094_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .heading {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 16px;
        display: flex;
    }

    .frame-1410104092 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104093 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104092_01 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104093_01 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104092_02 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .frame-1410104093_02 {
        flex: 1 1 0;
        padding: 12px;
        background: #f8fafb;
        border-radius: 12px;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
    }

    .checklist {
        justify-content: flex-start;
        align-items: center;
        gap: 4px;
        display: flex;
    }

    .checklist_01 {
        justify-content: flex-start;
        align-items: center;
        gap: 4px;
        display: flex;
    }

    .checklist_02 {
        justify-content: flex-start;
        align-items: center;
        gap: 4px;
        display: flex;
    }

    .frame-1410103870 {
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: flex;
        cursor: pointer;
    }

    .frame-2147227646 {
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }


    .frame-1410104096_02 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame-1410104094 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104095 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104096_01 {
        align-self: stretch;
        justify-content: flex-start;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410104075 {
        align-self: stretch;
        justify-content: center;
        align-items: center;
        gap: 12px;
        display: inline-flex;
    }

    .frame-1410103860 {
        align-self: stretch;
        justify-content: space-between;
        align-items: center;
        display: inline-flex;
    }

    .frame-1410104098_01 {
        align-self: stretch;
        padding: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .frame-1410104096 {
        align-self: stretch;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 12px;
        display: flex;
    }

    .frame-1410104103 {
        align-self: stretch;
        padding: 16px;
        background: #f8fafb;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 24px;
        display: flex;
    }

    .frame-1410104097 {
        align-self: stretch;
        padding: 12px;
        border-radius: 12px;
        outline: 1px #ededed solid;
        outline-offset: -1px;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        gap: 16px;
        display: flex;
    }

    .form {
        flex: 1 1 0;
        padding: 16px;
        border-radius: 20px;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
        display: inline-flex;
    }

    .frame-9 {
        width: 627px;
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

    .story-preview-summary-default {
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

    .arrow {
        display: none;
    }

    .back_span {
        color: black;
        font-size: 16px;
        font-family: DM Sans;
        font-weight: 600;
        line-height: 22.40px;
        word-wrap: break-word;
    }

    .back {
        text-align: center;
    }

    /* Mobile Responsive Styles */
    @media (max-width: 768px) {
        .story-preview-summary-default {
            padding-top: 24px;
            padding-bottom: 32px;
            padding-left: 16px;
            padding-right: 16px;
            gap: 32px;
        }

        .arrow {
            width: 100%;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 6px;
            padding-bottom: 6px;
            justify-content: flex-start;
            align-items: center;
            gap: 12px;
            display: inline-flex;
        }

        .arrow .button {
            padding-left: 24px;
            padding-right: 24px;
            padding-top: 12px;
            padding-bottom: 12px;
            box-shadow: 0px 0px 0px 2px #EEF6FF;
            border-radius: 20px;
            outline: 1px #DCDCDC solid;
            outline-offset: -1px;
            justify-content: center;
            align-items: center;
            gap: 10px;
            display: flex;
            cursor: pointer;
            width: auto;
        }

        .arrow .arrowleft {
            width: 20px;
            height: 20px;
        }

        .navbar {
            padding-left: 24px;
            padding-right: 12px;
        }

        .logo-text-full {
            width: 170.15px;
            height: 31.80px;
        }

        .frame-1410103818 {
            width: 100%;
            align-self: stretch;
            flex-direction: column;
            justify-content: flex-end;
            align-items: center;
            gap: 24px;
        }

        .hereyourpreviewstory_span {
            font-size: 32px;
            line-height: 38.40px;
        }

        .here-your-preview-story {
            width: 100%;
            text-align: left;
        }

        .reviewyourpersonalizedstorydetailsbeforecompletingyourorder_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .review-your-personalized-story-details-before-completing-your-order {
            width: 100%;
            text-align: left;
        }

        .ffreepagepreview_span {
            font-size: 16px;
        }

        .frame-1410103862 {
            align-items: flex-start;
        }

        .heading_01 {
            align-items: flex-start;
        }

        .heading {
            align-items: flex-start;
        }


        .frame-1410104031 {
            width: 100%;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }

        .frame-9 {
            width: 100%;
            align-self: stretch;
        }

        .form {
            width: 100%;
            align-self: stretch;
        }

        .frame-1410104031 {
            width: 100%;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 16px;
        }

        .frame-9 {
            order: 2;
        }

        .form {
            order: 1;
        }

        .image {
            width: 239px;
            height: 338px;
        }

        .frame-1410104103 {
            padding: 12px;
        }

        .digitalbook_span,
        .audioversion_span,
        .print-readypdf_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .storysummary_span {
            font-size: 20px;
            line-height: 24px;
        }

        .storybooktitle_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .storybook-title {
            width: 100%;
        }

        .characternametypewithspecialability_span {
            font-size: 14px;
            line-height: 19.60px;
        }

        .style_span,
        .anime_span,
        .enhancement_span,
        .normal_span,
        .storyworld_span,
        .outerspace_span,
        .difficultyadventuretype_span,
        .helpafriend_span,
        .format_span,
        .storyadventure_span,
        .agegroup_span,
        .ages11-12_span {
            font-size: 14px;
            line-height: 19.60px;
        }

        .storydetails_span {
            font-size: 18px;
            line-height: 21.60px;
        }

        .story-details {
            width: 100%;
        }

        .pages_span,
        .minread_span,
        .minaudio_span {
            font-size: 14px;
            line-height: 19.60px;
        }

        .f_span,
        .f-7min_span,
        .f2min_span {
            font-size: 20px;
            line-height: 24px;
        }

        .frame-1410104094_01 {
            flex-direction: column;
            gap: 12px;
        }

        .frame-1410104092_03,
        .frame-1410104094_02,
        .frame-1410104093_03 {
            align-self: stretch;
        }

        .frame-1410103860 {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
        }

        .frame-1410103870 {
            display: none;
        }

        .frame-2147227646 {
            width: 100%;
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
        }

        .button_01 {
            align-self: stretch;
            padding-left: 24px;
            padding-right: 24px;
            padding-top: 12px;
            padding-bottom: 12px;
        }

        .frame-1410104246 {
            align-self: stretch;
            height: 54px;
            padding-left: 20px;
            padding-right: 20px;
            padding-top: 16px;
            padding-bottom: 16px;
        }

        .saveasdraft_span,
        .generateandpreviewstory_span {
            font-size: 16px;
            line-height: 22.40px;
        }

        .ellipse-1415 {
            width: 248px;
            height: 114px;
            left: 52px;
            top: 25px;
        }

        .frame-1410104094,
        .frame-1410104095,
        .frame-1410104096_01 {
            flex-direction: column;
        }

        .frame-1410104092,
        .frame-1410104093,
        .frame-1410104092_01,
        .frame-1410104093_01,
        .frame-1410104092_02,
        .frame-1410104093_02 {
            padding: 8px;
            width: 100%;
        }

        .frame-1410104099,
        .frame-1410104099_01,
        .frame-1410104099_02,
        .frame-1410104099_03,
        .frame-1410104099_04,
        .frame-1410104099_05 {
            padding: 8px;
        }


        .check,
        .check_02,
        .check_04 {
            width: 16px;
            height: 16px;
        }

        .check_01,
        .check_03,
        .check_05 {
            width: 12.50px;
        }

        .frame-1410104075 {
            flex-direction: column;
            align-items: flex-start;
        }

        .informationbookcover_span {
            font-size: 20px;
            line-height: 24px;
        }

        .img-bookopentext {
            width: 100%;
        }
    }

    .img-palette {
        width: 100%;
    }

    .img-globehemispherewest {
        width: 100%;
    }

    .img-globestand {
        width: 100%;
    }

    .img-notepad {
        width: 100%;
    }

    .img-genderneuter {
        width: 100%;
    }
</style>
