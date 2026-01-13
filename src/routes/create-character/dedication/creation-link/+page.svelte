<script>
    import drawtopiaLogo from "../../../../assets/logo.png"
    import ShieldStar from "../../../../assets/ShieldStar.svg"
    import ArrowLeft from "../../../../assets/ArrowLeft.svg"
    import star from "../../../../assets/star.png"
    import std_book_image from "../../../../assets/std_book_cover.png"
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";

    let isCustomDedicationSelected = false;
    let customDedicationText = "Dear Emma, Adventure awaits for the bravest of hearts — just like yours.       — From Papa";
    const maxCharacters = 200;
    let selectedPresetIndex = 0;
    
    $: characterCount = customDedicationText.length;
    
    // Get selected dedication text (preset or custom)
    $: selectedDedicationText = isCustomDedicationSelected 
        ? customDedicationText 
        : (selectedPresetIndex === 0 
            ? "May you always believe in magic, wonder, and your beautiful imagination. — With love, Grandma"
            : selectedPresetIndex === 1
            ? "Every page is a hug from me to you. — With love, Grandma"
            : selectedPresetIndex === 2
            ? "Every adventure begins with a little bit of love and imagination. — With love, Grandma"
            : selectedPresetIndex === 3
            ? "May your heart stay curious and your dreams grow brighter every day. — Love always, Grandma"
            : customDedicationText);
    
    // Save dedication text to sessionStorage whenever it changes
    $: if (browser && selectedDedicationText) {
        sessionStorage.setItem("dedication_text", selectedDedicationText);
    }
    
    function handleContinueToPreview() {
        // Ensure dedication text is saved before navigating
        if (browser && selectedDedicationText) {
            sessionStorage.setItem("dedication_text", selectedDedicationText);
        }
        goto("/adventure-story/story-preview");
    }
</script>

<div class="dedication-pages-when-selected-creation-link-default">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={drawtopiaLogo} alt="Drawtopia Logo" class="img-logo" />
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="heading_01">
                <div class="frame-1410103862">
                    <div class="here-your-magical-story"><span class="hereyourmagicalstory_span">Here your Magical Story</span></div>
                    <div class="your-character-is-now-part-of-their-very-own-adventure"><span class="yourcharacterisnowpartoftheirveryownadventure_span">Your character is now part of their very own adventure!</span></div>
                </div>
            </div>
            <div class="tag">
                <div class="shieldstar">
                    <img src={ShieldStar} alt="Shield Star" class="img-shieldstar" />
                </div>
                <div><span class="ffreepagepreview_span">2 Free Page Preview</span></div>
            </div>
        </div>
        <div class="progress-bar">
            <div class="progress-bar_01">
                <div class="progress-bar_02">
                    <div class="step-1"><span class="step1_span">Step 1</span></div>
                    <div class="bar"></div>
                    <div class="frame-1410103829">
                        <div class="character-upload"><span class="characterupload_span">Character Upload</span></div>
                    </div>
                </div>
                <div class="progress-bar_03">
                    <div class="frame-1410103829_01">
                        <div class="step-2"><span class="step2_span">Step 2</span></div>
                    </div>
                    <div class="bar_01"></div>
                    <div class="character-enhancement"><span class="characterenhancement_span">Character Enhancement</span></div>
                </div>
                <div class="progress-bar_04">
                    <div class="step-3"><span class="step3_span">Step 3</span></div>
                    <div class="bar_02"></div>
                    <div class="frame-1410103829_02">
                        <div class="format-selection"><span class="formatselection_span">Format Selection</span></div>
                    </div>
                </div>
                <div class="progress-bar_05">
                    <div class="step-4"><span class="step4_span">Step 4</span></div>
                    <div class="bar_03"></div>
                    <div class="frame-1410103829_03">
                        <div class="configuration"><span class="configuration_span">Configuration</span></div>
                    </div>
                </div>
                <div class="progress-bar_06">
                    <div class="step-5"><span class="step5_span">Step 5</span></div>
                    <div class="bar_04"></div>
                    <div class="frame-1410103829_04">
                        <div class="generation"><span class="generation_span">Generation</span></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410104027">
            <div class="loopa">
                <img src={star} alt="Star" class="img-star" />
            </div>
            <div class="frame-1410104029">
                <div class="polygon-1"></div>
                <div class="frame-1410104026">
                    <div><span class="letsdesignthededicationpagesforyourgift_span">Let's design the dedication pages for your gift!</span></div>
                </div>
            </div>
        </div>
        <div class="frame-1410104031">
            <div class="frame-8">
                <div class="frame-1410104034">
                    <div class="dedication-pages-preview"><span class="dedicationpagespreview_span">Dedication Pages Preview</span></div>
                </div>
                <img class="book" src={std_book_image} />
            </div>
            <div class="frame-9">
                <div><span class="informationdedicationpages_span">Information Dedication Pages</span></div>
                <div class="form">
                    <div><span class="selectiondedicationmessages_span"> Selection Dedication Messages</span></div>
                    <div class="frame-1410103942">
                        <div 
                            class="selected"
                            class:selected-active={selectedPresetIndex === 0}
                            on:click={() => { 
                                selectedPresetIndex = 0; 
                                isCustomDedicationSelected = false; 
                                const text = "May you always believe in magic, wonder, and your beautiful imagination. — With love, Grandma";
                                customDedicationText = text;
                                if (browser) sessionStorage.setItem("dedication_text", text);
                            }}
                            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedPresetIndex = 0, isCustomDedicationSelected = false, customDedicationText = "May you always believe in magic, wonder, and your beautiful imagination. — With love, Grandma", browser && sessionStorage.setItem("dedication_text", "May you always believe in magic, wonder, and your beautiful imagination. — With love, Grandma"), e.preventDefault())}
                            role="button"
                            tabindex="0"
                        >
                            <div class="frame-1410103940">
                                <div class="frame-1410103939">
                                    <div class="may-you-always-believe-in-magic-wonder-and-your-beautiful-imagination-with-love-grandma"><span class="mayyoualwaysbelieveinmagicwonderandyourbeautifulimaginationwithlovegrandma_span">May you always believe in magic, wonder, and your beautiful imagination. — With love, Grandma</span></div>
                                </div>
                            </div>
                            <div class="frame-1410104043">
                                <div class="ellipse-14"></div>
                                <div class="ellipse-13" class:hidden={selectedPresetIndex !== 0}></div>
                            </div>
                        </div>
                        <div class="frame-2147227640">
                            <div><span class="dedicationmessagesaienhanced_span">Dedication Messages AI Enhanced ✨</span></div>
                        </div>
                        <div 
                            class="selected_box"
                            class:selected-active={selectedPresetIndex === 1}
                            on:click={() => { 
                                selectedPresetIndex = 1; 
                                isCustomDedicationSelected = false; 
                                const text = "Every page is a hug from me to you. — With love, Grandma";
                                customDedicationText = text;
                                if (browser) sessionStorage.setItem("dedication_text", text);
                            }}
                            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedPresetIndex = 1, isCustomDedicationSelected = false, customDedicationText = "Every page is a hug from me to you. — With love, Grandma", browser && sessionStorage.setItem("dedication_text", "Every page is a hug from me to you. — With love, Grandma"), e.preventDefault())}
                            role="button"
                            tabindex="0"
                        >
                            <div class="frame-1410103940_01">
                                <div class="frame-1410103939_01">
                                    <div class="every-page-is-a-hug-from-me-to-you-with-love-grandma"><span class="everypageisahugfrommetoyouwithlovegrandma_span">Every page is a hug from me to you.                   — With love, Grandma</span></div>
                                </div>
                            </div>
                            <div class="frame-1410104043">
                                <div class="ellipse-14"></div>
                                <div class="ellipse-13" class:hidden={selectedPresetIndex !== 1}></div>
                            </div>
                        </div>
                        <div 
                            class="selected_box"
                            class:selected-active={selectedPresetIndex === 2}
                            on:click={() => { 
                                selectedPresetIndex = 2; 
                                isCustomDedicationSelected = false; 
                                const text = "Every adventure begins with a little bit of love and imagination. — With love, Grandma";
                                customDedicationText = text;
                                if (browser) sessionStorage.setItem("dedication_text", text);
                            }}
                            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedPresetIndex = 2, isCustomDedicationSelected = false, customDedicationText = "Every adventure begins with a little bit of love and imagination. — With love, Grandma", browser && sessionStorage.setItem("dedication_text", "Every adventure begins with a little bit of love and imagination. — With love, Grandma"), e.preventDefault())}
                            role="button"
                            tabindex="0"
                        >
                            <div class="frame-1410103940_02">
                                <div class="frame-1410103939_02">
                                    <div class="every-adventure-begins-with-a-little-bit-of-love-and-imagination-with-love-grandma"><span class="everyadventurebeginswithalittlebitofloveandimaginationwithlovegrandma_span">Every adventure begins with a little bit of love and imagination.                   — With love, Grandma</span></div>
                                </div>
                            </div>
                            <div class="frame-1410104043">
                                <div class="ellipse-14"></div>
                                <div class="ellipse-13" class:hidden={selectedPresetIndex !== 2}></div>
                            </div>
                        </div>
                        <div 
                            class="selected_box"
                            class:selected-active={selectedPresetIndex === 3}
                            on:click={() => { 
                                selectedPresetIndex = 3; 
                                isCustomDedicationSelected = false; 
                                const text = "May your heart stay curious and your dreams grow brighter every day. — Love always, Grandma";
                                customDedicationText = text;
                                if (browser) sessionStorage.setItem("dedication_text", text);
                            }}
                            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedPresetIndex = 3, isCustomDedicationSelected = false, customDedicationText = "May your heart stay curious and your dreams grow brighter every day. — Love always, Grandma", browser && sessionStorage.setItem("dedication_text", "May your heart stay curious and your dreams grow brighter every day. — Love always, Grandma"), e.preventDefault())}
                            role="button"
                            tabindex="0"
                        >
                            <div class="frame-1410103940_03">
                                <div class="frame-1410103939_03">
                                    <div class="may-your-heart-stay-curious-and-your-dreams-grow-brighter-every-day-love-always-grandma"><span class="mayyourheartstaycuriousandyourdreamsgrowbrightereverydaylovealwaysgrandma_span">May your heart stay curious and your dreams grow brighter every day. — Love always, Grandma</span></div>
                                </div>
                            </div>
                            <div class="frame-1410104043">
                                <div class="ellipse-14"></div>
                                <div class="ellipse-13" class:hidden={selectedPresetIndex !== 3}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form_01">
                    <div><span class="customdedicationmessages_span">Custom Dedication Messages</span></div>
                    <div class="frame-1410103942_01">
                        <div 
                            class="selected_04" 
                            class:selected-custom={isCustomDedicationSelected} 
                            on:click={() => { 
                                isCustomDedicationSelected = !isCustomDedicationSelected; 
                                if (isCustomDedicationSelected) { 
                                    selectedPresetIndex = -1;
                                    if (browser && customDedicationText) {
                                        sessionStorage.setItem("dedication_text", customDedicationText);
                                    }
                                }
                            }}
                            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') ? (isCustomDedicationSelected = !isCustomDedicationSelected, isCustomDedicationSelected && (selectedPresetIndex = -1, browser && customDedicationText && sessionStorage.setItem("dedication_text", customDedicationText)), e.preventDefault()) : null}
                            role="button"
                            tabindex="0"
                        >
                            <div class="frame-1410104084">
                                <div class="frame-1410103940_04">
                                    <div class="frame-1410103939_04">
                                        <div><span class="customdedicationmessage_span">Custom Dedication Message</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-1410104043">
                                <div class="ellipse-14"></div>
                                <div class="ellipse-13" class:hidden={!isCustomDedicationSelected}></div>
                            </div>
                        </div>
                        {#if isCustomDedicationSelected}
                            <div class="input-form">
                                <div class="input-placeholder">
                                    <textarea 
                                        class="dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa"
                                        bind:value={customDedicationText}
                                        maxlength={maxCharacters}
                                        placeholder="Enter your custom dedication message..."
                                        on:input={() => {
                                            if (browser && isCustomDedicationSelected && customDedicationText) {
                                                sessionStorage.setItem("dedication_text", customDedicationText);
                                            }
                                        }}
                                    ></textarea>
                                </div>
                                <div class="text-42200-characters"><span class="f2200characters_span">{characterCount}/{maxCharacters} Characters</span></div>
                            </div>
                        {/if}
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
                    <div class="back-to-step"><span class="backtostep_span">Back To Step</span></div>
                </div>
            </div>
            <div class="frame-1410104246" on:click={handleContinueToPreview} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleContinueToPreview()}>
                <div class="continue-to-preview-story"><span class="continuetopreviewstory_span">Continue to Preview Story</span></div>
                <div class="ellipse-1415"></div>
            </div>
        </div>
    </div>
</div>

<style>
.drawtopia {
    width: 203.32px;
    height: 38px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, #0FE3EF 44%, #438BFF 100%);
    box-shadow: 0px 0.5678421258926392px 1.703526258468628px #871FFF inset;
}

.subtract {
    width: 28.39px;
    height: 28.39px;
    left: 121.55px;
    top: 1.82px;
    position: absolute;
    transform: rotate(4deg);
    transform-origin: top left;
    background: radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, #0FE3EF 44%, #438BFF 100%);
    box-shadow: 0px 0.5678421854972839px 1.703526496887207px #871FFF inset;
}

.hereyourmagicalstory_span {
    color: #141414;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 57.60px;
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
    line-height: 25.20px;
    word-wrap: break-word;
}

.your-character-is-now-part-of-their-very-own-adventure {
    width: 1040px;
    text-align: center;
}

.vector {
    width: 15px;
    height: 15.63px;
    left: 2.50px;
    top: 3.12px;
    position: absolute;
    background: #438BFF;
}

.ffreepagepreview_span {
    color: #438BFF;
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
    line-height: 19.60px;
    word-wrap: break-word;
}

.step-1 {
    width: 63px;
}

.bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
}

.characterupload_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 22.40px;
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
    line-height: 19.60px;
    word-wrap: break-word;
}

.step-2 {
    width: 63px;
}

.bar_01 {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
}

.characterenhancement_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 22.40px;
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
    line-height: 19.60px;
    word-wrap: break-word;
}

.step-3 {
    width: 63px;
}

.bar_02 {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
}

.formatselection_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 22.40px;
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
    line-height: 19.60px;
    word-wrap: break-word;
}

.step-4 {
    width: 63px;
}

.bar_03 {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
}

.configuration_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 22.40px;
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
    line-height: 19.60px;
    word-wrap: break-word;
}

.step-5 {
    width: 63px;
}

.bar_04 {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438BFF;
    border-radius: 12px;
}

.generation_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 22.40px;
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
    background: #0F0072;
    border: 0.88px #0F0072 solid;
}

.star-4 {
    width: 81.48px;
    height: 81.48px;
    left: 6.52px;
    top: 0px;
    position: absolute;
    background: white;
    border: 0.81px #0F0072 solid;
}

.star-6 {
    width: 65.19px;
    height: 65.19px;
    left: 14.66px;
    top: 8.15px;
    position: absolute;
    background: #438BFF;
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
    left: 49.30px;
    top: 22.82px;
    position: absolute;
    border-radius: 3.37px;
    outline: 1.63px white solid;
    outline-offset: -0.81px;
}

.rectangle-10 {
    width: 16.30px;
    height: 16.30px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 81.48px;
}

.rectangle-11 {
    width: 16.30px;
    height: 16.30px;
    left: 16.30px;
    top: 0px;
    position: absolute;
    background: white;
    border-radius: 81.48px;
}

.rectangle-12 {
    width: 9.78px;
    height: 9.78px;
    left: 16.30px;
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
    height: 36.50px;
    left: -2.50px;
    top: 49.56px;
    position: absolute;
    transform: rotate(-90deg);
    transform-origin: top left;
    background: #D9EAFF;
}

.letsdesignthededicationpagesforyourgift_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.dedicationpagespreview_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
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
    line-height: 28.80px;
    word-wrap: break-word;
}

.selectiondedicationmessages_span {
    color: #141414;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.mayyoualwaysbelieveinmagicwonderandyourbeautifulimaginationwithlovegrandma_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.may-you-always-believe-in-magic-wonder-and-your-beautiful-imagination-with-love-grandma {
    align-self: stretch;
}

.ellipse-13 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #EDEDED solid;
}

.dedicationmessagesaienhanced_span {
    color: #438BFF;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
}

.everypageisahugfrommetoyouwithlovegrandma_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.every-page-is-a-hug-from-me-to-you-with-love-grandma {
    align-self: stretch;
}

.ellipse-13_01 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #EDEDED solid;
}

.everyadventurebeginswithalittlebitofloveandimaginationwithlovegrandma_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.every-adventure-begins-with-a-little-bit-of-love-and-imagination-with-love-grandma {
    align-self: stretch;
}

.ellipse-13_02 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #EDEDED solid;
}

.mayyourheartstaycuriousandyourdreamsgrowbrightereverydaylovealwaysgrandma_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.may-your-heart-stay-curious-and-your-dreams-grow-brighter-every-day-love-always-grandma {
    align-self: stretch;
}

.ellipse-13_03 {
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    border: 2px #EDEDED solid;
}

.customdedicationmessages_span {
    color: #141414;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.customdedicationmessage_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.frame-1410104043 {
    width: 24px;
    height: 24px;
    position: relative;
}

.ellipse-14 {
    width: 24px;
    height: 24px;
    left: 0px;
    top: 0px;
    position: absolute;
    border-radius: 9999px;
    border: 1px #438BFF solid;
}

.ellipse-13 {
    width: 12px;
    height: 12px;
    left: 6px;
    top: 6px;
    position: absolute;
    background: #438BFF;
    border-radius: 9999px;
}

.ellipse-13.hidden {
    display: none;
}

.selected-custom {
    background: #EEF6FF !important;
    outline: 1px #173DB6 solid !important;
}

.selected-active {
    background: #EEF6FF !important;
    outline: 1px #173DB6 solid !important;
}

.input-form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
}

.input-placeholder {
    align-self: stretch;
    min-height: 168px;
    padding: 12px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
}

.dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa {
    flex: 1 1 0;
    width: 100%;
    min-height: 144px;
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
    border: none;
    outline: none;
    resize: none;
    background: transparent;
}

.dear-emma-adventure-awaits-for-the-bravest-of-hearts-just-like-yours-from-papa::placeholder {
    color: #727272;
}

.text-42200-characters {
    align-self: stretch;
}

.f2200characters_span {
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
}

.vector_01 {
    width: 18px;
    height: 15px;
    left: 3px;
    top: 4.50px;
    position: absolute;
    background: black;
}

.backtostep_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
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
    line-height: 25.20px;
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
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
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
    background: #D9EAFF;
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

.frame-2147227640 {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 8px;
    padding-bottom: 8px;
    background: #EEF6FF;
    border-radius: 99px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
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

.content {
    padding: 16px;
    background: #131314;
    box-shadow: 0px 3px 8px rgba(19, 19, 20, 0.12);
    overflow: hidden;
    border-radius: 8px;
    outline: 1px #44474A solid;
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

.eye {
    width: 32.59px;
    height: 16.30px;
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
    background: #438BFF;
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
    outline: 1px #DCDCDC solid;
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
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-1410103940_04 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
}

.annotation {
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
    background: #EEF6FF;
    border-radius: 99px;
    outline: 1px #438BFF solid;
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

.img-star {
    width: 100%;
    height: 100%;
}

.button {
    width: 200px;
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

.selected {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.selected_box {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.frame-1410104084 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
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
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
}

.frame-1410103942 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.selected_04 {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
}

.form {
    align-self: stretch;
    padding: 12px;
    border-radius: 10px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
}

.frame-1410103942_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.form_01 {
    align-self: stretch;
    padding: 12px;
    border-radius: 10px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
}

.frame-9 {
    flex: 1 1 0;
    padding: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
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

.dedication-pages-when-selected-creation-link-default {
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