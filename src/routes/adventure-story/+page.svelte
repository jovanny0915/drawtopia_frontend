<script lang="ts">
    import enchantedforest from "../../assets/cenchanted_forest.png";
    import outerspace from "../../assets/couter_space.png";
    import underwaterkingdom from "../../assets/cunderwater_kingdom.png";
    import logo from "../../assets/logo.png";
    import arrowleft from "../../assets/WhiteArrowLeft.svg";
    import globehemispherewest from "../../assets/BlackGlobeHemiSphereWest.svg";
    import shieldstar from "../../assets/ShieldStar.svg";
    import treasurehunt from "../../assets/treasure_hunt.png";
    import helpfriend from "../../assets/help_friend.png";
    import { goto } from "$app/navigation";

    let selectedScene: string | null = null;
    let selectedAdventureType: string | null = null;

    function selectScene(scene: string) {
        selectedScene = scene;
    }

    function selectAdventureType(type: string) {
        selectedAdventureType = type;
    }

    function handleKeydown(event: KeyboardEvent, callback: () => void) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            callback();
        }
    }

    function handleGenerateSearchAdventure() {
        goto("/adventure-story/preview")
    }
</script>

<div class="story-adventure-configuration-default">
    <div class="navbar">
        <div class="logo-text-full">
            <img src={logo} alt="Drawtopia Logo" class="logo-img" />
        </div>
    </div>
    <div class="frame-1410103818">
        <div class="heading">
            <div class="configure-your-story-adventure"><span class="configureyourstoryadventure_span">  Configure Your Story Adventure</span></div>
            <div class="tag">
                <div class="shieldstar">
                    <img src={shieldstar} alt="shieldstar">
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
        <div class="rectangle-261"></div>
        <div class="frame-1410103884">
            <div class="step-1-choose-story-world"><span class="step1choosestoryworld_span">Step 1: Choose Story World</span></div>
            <div class="frame-1410103852">
                <div 
                    class="card" 
                    class:selected={selectedScene === 'enchanted-forest'}
                    on:click={() => selectScene('enchanted-forest')}
                    on:keydown={(e) => handleKeydown(e, () => selectScene('enchanted-forest'))}
                    role="button"
                    tabindex="0"
                >
                    <img class="image" src={enchantedforest} alt="Enchanted Forest" />
                    <div class="frame-10">
                        <div class="heading_01">
                            <div class="enchanted-forest"><span class="enchantedforest_span">Enchanted Forest</span></div>
                            <div class="frame-2147227581">
                                <div class="icons">
                                    <div class="globehemispherewest">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="magicalcreaturestalkingtrees_span">Magical Creatures & Talking Trees</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button" 
                            class:selected={selectedScene === 'enchanted-forest'}
                            on:click|stopPropagation={() => selectScene('enchanted-forest')}
                            on:keydown={(e) => handleKeydown(e, () => selectScene('enchanted-forest'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select"><span class="select_span">Select</span></div>
                        </div>
                    </div>
                </div>
                <div 
                    class="card_01" 
                    class:selected={selectedScene === 'outer-space'}
                    on:click={() => selectScene('outer-space')}
                    on:keydown={(e) => handleKeydown(e, () => selectScene('outer-space'))}
                    role="button"
                    tabindex="0"
                >
                    <img class="image_01" src={outerspace} alt="Outer Space" />
                    <div class="frame-10_01">
                        <div class="heading_02">
                            <div class="outer-space"><span class="outerspace_span">Outer Space</span></div>
                            <div class="frame-2147227581_01">
                                <div class="icons_01">
                                    <div class="globehemispherewest_01">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="cosmicplanetaliensfriendly_span">Cosmic Planet & Aliens Friendly</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button_01" 
                            class:selected={selectedScene === 'outer-space'}
                            on:click|stopPropagation={() => selectScene('outer-space')}
                            on:keydown={(e) => handleKeydown(e, () => selectScene('outer-space'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_01"><span class="select_01_span">Select</span></div>
                        </div>
                    </div>
                </div>
                <div 
                    class="card_02" 
                    class:selected={selectedScene === 'underwater-kingdom'}
                    on:click={() => selectScene('underwater-kingdom')}
                    on:keydown={(e) => handleKeydown(e, () => selectScene('underwater-kingdom'))}
                    role="button"
                    tabindex="0"
                >
                    <img class="image_02" src={underwaterkingdom} alt="Underwater Kingdom" />
                    <div class="frame-10_02">
                        <div class="heading_03">
                            <div class="underwater-kingdom"><span class="underwaterkingdom_span">Underwater Kingdom</span></div>
                            <div class="frame-2147227581_02">
                                <div class="icons_02">
                                    <div class="globehemispherewest_02">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="mermaidsvibrantsealife_span">Mermaids & Vibrant Sea Life</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button_02" 
                            class:selected={selectedScene === 'underwater-kingdom'}
                            on:click|stopPropagation={() => selectScene('underwater-kingdom')}
                            on:keydown={(e) => handleKeydown(e, () => selectScene('underwater-kingdom'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_02"><span class="select_02_span">Select</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410103885">
            <div class="step-2-choose-adventure-type"><span class="step2chooseadventuretype_span">Step 2: Choose Adventure Type</span></div>
            <div class="frame-1410103852_01">
                <div 
                    class="card_03" 
                    class:selected={selectedAdventureType === 'treasure-hunt'}
                    on:click={() => selectAdventureType('treasure-hunt')}
                    on:keydown={(e) => handleKeydown(e, () => selectAdventureType('treasure-hunt'))}
                    role="button"
                    tabindex="0"
                >
                    <img class="image_03" src={treasurehunt} alt="Treasure Hunt" />
                    <div class="frame-10_03">
                        <div class="frame-2147227609">
                            <div class="treasure-hunt"><span class="treasurehunt_span">Treasure Hunt</span></div>
                            <div class="frame-1410104048">
                                <div class="character-name-will-search-for-a-legendary-treasure-hidden-in-the-selected-world"><span class="characternamewillsearchforalegendarytreasurehiddenintheselectedworld_span">[Character Name] will search for a legendary treasure hidden in the [Selected World]</span></div>
                            </div>
                        </div>
                        <div 
                            class="button_03" 
                            class:selected={selectedAdventureType === 'treasure-hunt'}
                            on:click|stopPropagation={() => selectAdventureType('treasure-hunt')}
                            on:keydown={(e) => handleKeydown(e, () => selectAdventureType('treasure-hunt'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_03"><span class="select_03_span">Select</span></div>
                        </div>
                    </div>
                </div>
                <div 
                    class="card_04" 
                    class:selected={selectedAdventureType === 'helping-a-friend'}
                    on:click={() => selectAdventureType('helping-a-friend')}
                    on:keydown={(e) => handleKeydown(e, () => selectAdventureType('helping-a-friend'))}
                    role="button"
                    tabindex="0"
                >
                    <div class="image_04">
                        <img class="image-6" src={helpfriend} alt="Helping a Friend" />
                    </div>
                    <div class="frame-10_04">
                        <div class="frame-2147227610">
                            <div class="helping-a-friend"><span class="helpingafriend_span">Helping a Friend</span></div>
                            <div class="frame-1410104048_01">
                                <div class="character-name-will-help-a-friend-in-a-need-using-their-special-ability"><span class="characternamewillhelpafriendinaneedusingtheirspecialability_span">[Character Name] will help a friend in a need using their [Special Ability] <br/></span></div>
                            </div>
                        </div>
                        <div 
                            class="button_04" 
                            class:selected={selectedAdventureType === 'helping-a-friend'}
                            on:click|stopPropagation={() => selectAdventureType('helping-a-friend')}
                            on:keydown={(e) => handleKeydown(e, () => selectAdventureType('helping-a-friend'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_04"><span class="select_04_span">Select</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="frame-1410104246" on:click={handleGenerateSearchAdventure}>
            <div class="generate-search-adventure"><span class="generatesearchadventure_span">Generate Search Adventure</span></div>
            <div class="ellipse-1415"></div>
            <div class="arrowleft">
                <img class="arrowleft-img" src={arrowleft} alt="Arrow Left" />
            </div>
        </div>
    </div>
</div>

<style>
.configureyourstoryadventure_span {
    color: #141414;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 57.60px;
    word-wrap: break-word;
}

.configure-your-story-adventure {
    align-self: stretch;
    text-align: center;
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
    background: #EEF6FF;
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

.rectangle-261 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
}

.step1choosestoryworld_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
}

.step-1-choose-story-world {
    text-align: center;
}

.image {
    align-self: stretch;
    height: 280px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px #D3D3D3 solid;
}

.enchantedforest_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.enchanted-forest {
    align-self: stretch;
}


.magicalcreaturestalkingtrees_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.select_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select {
    text-align: center;
}

.image_01 {
    align-self: stretch;
    height: 280px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px #D3D3D3 solid;
}

.outerspace_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.outer-space {
    align-self: stretch;
}


.cosmicplanetaliensfriendly_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.select_01_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select_01 {
    text-align: center;
}

.image_02 {
    align-self: stretch;
    height: 280px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    border: 1px #D3D3D3 solid;
}

.underwaterkingdom_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.underwater-kingdom {
    align-self: stretch;
}


.mermaidsvibrantsealife_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.select_02_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select_02 {
    text-align: center;
}

.step2chooseadventuretype_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
}

.step-2-choose-adventure-type {
    text-align: center;
}

.image_03 {
    align-self: stretch;
    height: 280px;
    position: relative;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.treasurehunt_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.treasure-hunt {
    align-self: stretch;
}

.characternamewillsearchforalegendarytreasurehiddenintheselectedworld_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
}

.character-name-will-search-for-a-legendary-treasure-hidden-in-the-selected-world {
    align-self: stretch;
}

.select_03_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select_03 {
    text-align: center;
}

.image-6 {
    height: 280px;
    position: absolute;
}

.helpingafriend_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.helping-a-friend {
    align-self: stretch;
}

.characternamewillhelpafriendinaneedusingtheirspecialability_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
}

.character-name-will-help-a-friend-in-a-need-using-their-special-ability {
    align-self: stretch;
}

.select_04_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select_04 {
    text-align: center;
}

.generatesearchadventure_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.generate-search-adventure {
    text-align: center;
}

.ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 24px;
    top: 25px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
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

.button {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
}

.button.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button.selected .select_span {
    color: #438BFF;
}

.button_01 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
}

.button_01.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button_01.selected .select_01_span {
    color: #438BFF;
}

.button_02 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
}

.button_02.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button_02.selected .select_02_span {
    color: #438BFF;
}

.frame-1410104048 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.button_03 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
}

.button_03.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button_03.selected .select_03_span {
    color: #438BFF;
}

.frame-1410104048_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.button_04 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
}

.button_04.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button_04.selected .select_04_span {
    color: #438BFF;
}

.logo-text-full {
    height: 43px;
    position: relative;
    margin: auto;
}

.logo-img {
    width: 100%;
    height: 100%;
}

.arrowleft-img {
    width: 100%;
    height: 100%;
    color: white;
}

.shieldstar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_02 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.image_04 {
    align-self: stretch;
    height: 280px;
    position: relative;
    overflow: hidden;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    background-image: url(https://placehold.co/586x280);
}

.arrowleft {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
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

.frame-2147227609 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-2147227610 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
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
    background: #EEF6FF;
    border-radius: 99px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
}

.icons {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
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
    display: inline-flex;
    cursor: pointer;
}

.progress-bar_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.frame-10_03 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-10_04 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 32px;
    display: flex;
    justify-content: space-between;
    flex: 1;
}

.heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
}

.frame-2147227581 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227581_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227581_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
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

.card_03 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.card_03.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.card_04 {
    flex: 1 1 0;
    height: 500px;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-space;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.card_04.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.heading_01 {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.heading_02 {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.heading_03 {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-1410103852_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
}

.frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-10_01 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-10_02 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-1410103885 {
    align-self: stretch;
    padding: 24px;
    border-radius: 12px;
    outline: 2px #EDEDED solid;
    outline-offset: -2px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.card {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.card.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.card_01 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.card_01.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.card_02 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
}

.card_02.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.frame-1410103852 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
}

.frame-1410103884 {
    align-self: stretch;
    padding: 24px;
    border-radius: 12px;
    outline: 2px #EDEDED solid;
    outline-offset: -2px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
    display: flex;
}

.frame-1410103818 {
    width: 1240px;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
}

.story-adventure-configuration-default {
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