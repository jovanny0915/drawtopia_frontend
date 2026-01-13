<script lang="ts">
    import { goto } from '$app/navigation';
    import ProgressBar from "../../components/ProgressBar.svelte";
    import enchantedforest from "../../assets/enchanted_forest.png";
    import outerspace from "../../assets/outer_space.png";
    import underwaterkingdom from "../../assets/underwater_kingdom.png";
    import logo from "../../assets/logo.png";
    import arrowleft from "../../assets/WhiteArrowLeft.svg";
    import smiley from "../../assets/Smiley.svg";
    import globehemispherewest from "../../assets/BlackGlobeHemiSphereWest.svg";
    import crosshair from "../../assets/Crosshair.svg";
    import fire from "../../assets/Fire.svg";
    import shieldstar from "../../assets/ShieldStar.svg";
    import MobileBackBtn from "../../components/MobileBackBtn.svelte";
    import MobileStepProgressBar from "../../components/MobileStepProgressBar.svelte";
    import StarEmoticon from "../../components/StarEmoticon.svelte";

    let selectedScene: string | null = null;
    let selectedDifficulty: string | null = null;

    function selectScene(scene: string) {
        selectedScene = scene;
    }

    function selectDifficulty(difficulty: string) {
        selectedDifficulty = difficulty;
    }

    function handleKeydown(event: KeyboardEvent, callback: () => void) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            callback();
        }
    }

    function handleGenerateSearchAdventure() {
        if (!selectedScene || !selectedDifficulty) {
            alert('Please select both a story world and difficulty');
            return;
        }

        // Store selections in sessionStorage
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('intersearch_world', selectedScene);
            sessionStorage.setItem('intersearch_difficulty', selectedDifficulty);
            if (selectedDifficulty === 'easy') {
                sessionStorage.setItem('ageGroup', '3-6');
            } else if (selectedDifficulty === 'medium') {
                sessionStorage.setItem('ageGroup', '7-10');
            } else if (selectedDifficulty === 'hard') {
                sessionStorage.setItem('ageGroup', '11-12');
            }
            // Always force re-generation of scenes
            sessionStorage.setItem('intersearch_regenerate', 'true');
        }

        // Navigate to intersearch/1
        goto('/create-character/7');
    }
</script>

<div class="interactive-search-configuration-default">
    <div class="navbar">
        <div class="logo-text-full">
            <img class="logo-img" src={logo} alt="Drawtopia Logo" />
        </div>
    </div>

    <MobileBackBtn backRoute="/create-character/3" backText="Back" />

    <div class="frame-1410103818">
        <div class="heading">
            <div class="configure-your-search-adventure">
                <span class="configureyoursearchadventure_span">Configure Your Search Adventure</span>
            </div>
            <div class="tag-container">
                <div class="tag">
                    <div class="shieldstar">
                        <img src={shieldstar} alt="shieldstar">
                    </div>
                    <div><span class="ffreepagepreview_span">2 Free Page Preview</span></div>
                </div>
            </div>
        </div>

        <MobileStepProgressBar currentStep={4} />

        <div class="frame-1410104027">
            <div class="star-container">
                <StarEmoticon />
            </div>
            <div class="message-container">
                <div class="polygon-1"></div>
                <div class="message-content">
                    <div class="lets-craft-world">
                        <span class="lets-craft-world_span">Let’s craft the perfect world for your story!</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="desktop-progress">
            <ProgressBar currentStep={4} />
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
                                    <div><span class="fmagicalforestscenes_span">8 Magical Forest Scenes</span></div>
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
                                    <div><span class="fcosmicspacescenes_span">8 Cosmic Space Scenes</span></div>
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
                                    <div><span class="foceanscenes_span">8 Ocean Scenes</span></div>
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
            <div class="step-2-choose-difficulty"><span class="step2choosedifficulty_span">Step 2: Choose Difficulty</span></div>
            <div class="frame-2147227608">
                <div 
                    class="card_03" 
                    class:selected={selectedDifficulty === 'easy'}
                    on:click={() => selectDifficulty('easy')}
                    on:keydown={(e) => handleKeydown(e, () => selectDifficulty('easy'))}
                    role="button"
                    tabindex="0"
                >
                    <div class="frame-2147227585">
                        <div class="frame-2147227584">
                            <div class="frame-2147227503">
                                <div class="smiley">
                                    <img class="smiley-img" src={smiley} alt="Smiley" />
                                </div>
                            </div>
                            <div class="frame-2147227582">
                                <div class="heading_04">
                                    <div class="easy"><span class="easy_span">Easy</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="frame-10_03">
                        <div class="frame-2147227607">
                            <div class="frame-2147227582_01">
                                <div class="frame-2147227581_03">
                                    <div class="icons_03">
                                        <div class="eyes">
                                            <img src={globehemispherewest} alt="globehemispherewest">
                                        </div>
                                        <div><span class="character15-20visible_span">Character 15-20% Visible</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-2147227581_04">
                                <div class="icons_04">
                                    <div class="puzzlepiece">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="f-8otherelements_span">5-8 other elements</span></div>
                                </div>
                            </div>
                            <div class="frame-2147227583">
                                <div class="icons_05">
                                    <div class="user">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="age3-6recommended_span">Age 3-6 (Recommended)</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button_03" 
                            class:selected={selectedDifficulty === 'easy'}
                            on:click|stopPropagation={() => selectDifficulty('easy')}
                            on:keydown={(e) => handleKeydown(e, () => selectDifficulty('easy'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_03"><span class="select_03_span">Select</span></div>
                        </div>
                    </div>
                </div>
                <div 
                    class="card_04" 
                    class:selected={selectedDifficulty === 'medium'}
                    on:click={() => selectDifficulty('medium')}
                    on:keydown={(e) => handleKeydown(e, () => selectDifficulty('medium'))}
                    role="button"
                    tabindex="0"
                >
                    <div class="frame-2147227585_01">
                        <div class="frame-2147227584_01">
                            <div class="frame-2147227503_01">
                                <div class="crosshair">
                                    <img src={crosshair} alt="crosshair">
                                </div>
                            </div>
                            <div class="frame-2147227582_02">
                                <div class="heading_05">
                                    <div class="medium"><span class="medium_span">Medium</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="frame-10_04">
                        <div class="frame-2147227607_01">
                            <div class="frame-2147227582_03">
                                <div class="frame-2147227581_05">
                                    <div class="icons_06">
                                        <div class="globehemispherewest_03">
                                            <img src={globehemispherewest} alt="globehemispherewest">
                                        </div>
                                        <div><span class="character10-15visible_span">Character 10-15% Visible</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-2147227581_06">
                                <div class="icons_07">
                                    <div class="globehemispherewest_04">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="f0-15otherelements_span">10-15 other elements</span></div>
                                </div>
                            </div>
                            <div class="frame-2147227583_01">
                                <div class="icons_08">
                                    <div class="globehemispherewest_05">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="age7-10recommended_span">Age 7-10 (Recommended)</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button_04" 
                            class:selected={selectedDifficulty === 'medium'}
                            on:click|stopPropagation={() => selectDifficulty('medium')}
                            on:keydown={(e) => handleKeydown(e, () => selectDifficulty('medium'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_04"><span class="select_04_span">Select</span></div>
                        </div>
                    </div>
                </div>
                <div 
                    class="card_05" 
                    class:selected={selectedDifficulty === 'hard'}
                    on:click={() => selectDifficulty('hard')}
                    on:keydown={(e) => handleKeydown(e, () => selectDifficulty('hard'))}
                    role="button"
                    tabindex="0"
                >
                    <div class="frame-2147227585_02">
                        <div class="frame-2147227584_02">
                            <div class="frame-2147227503_02">
                                <div class="fire">
                                    <img src={fire} alt="fire">
                                </div>
                            </div>
                            <div class="frame-2147227582_04">
                                <div class="heading_06">
                                    <div class="hard"><span class="hard_span">Hard</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="frame-10_05">
                        <div class="frame-2147227607_02">
                            <div class="frame-2147227582_05">
                                <div class="frame-2147227581_07">
                                    <div class="icons_09">
                                        <div class="globehemispherewest_06">
                                            <img src={globehemispherewest} alt="globehemispherewest">
                                        </div>
                                        <div><span class="character8-12visible_span">Character 8-12% Visible</span></div>
                                    </div>
                                </div>
                            </div>
                            <div class="frame-2147227581_08">
                                <div class="icons_10">
                                    <div class="globehemispherewest_07">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="f5-25otherelements_span">15-25 other elements</span></div>
                                </div>
                            </div>
                            <div class="frame-2147227583_02">
                                <div class="icons_11">
                                    <div class="globehemispherewest_08">
                                        <img src={globehemispherewest} alt="globehemispherewest">
                                    </div>
                                    <div><span class="age11-12recommended_span">Age 11-12 (Recommended)</span></div>
                                </div>
                            </div>
                        </div>
                        <div 
                            class="button_05" 
                            class:selected={selectedDifficulty === 'hard'}
                            on:click|stopPropagation={() => selectDifficulty('hard')}
                            on:keydown={(e) => handleKeydown(e, () => selectDifficulty('hard'))}
                            role="button"
                            tabindex="0"
                        >
                            <div class="select_05"><span class="select_05_span">Select</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <button 
            class="frame-1410104246"
            on:click={handleGenerateSearchAdventure}
            disabled={!selectedScene || !selectedDifficulty}
            style="cursor: pointer; border: none;"
        >
            <div class="generate-search-adventure"><span class="generatesearchadventure_span">Generate Search Adventure</span></div>
            <div class="arrowleft">
                <img class="arrowleft-img" src={arrowleft} alt="Arrow Left" />
            </div>
            <div class="ellipse-1415">
            </div>
        </button>
    </div>
</div>

<style>

.configureyoursearchadventure_span {
    color: #141414;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 57.60px;
    word-wrap: break-word;
}

.configure-your-search-adventure {
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

.fmagicalforestscenes_span {
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

.fcosmicspacescenes_span {
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

.foceanscenes_span {
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

.step2choosedifficulty_span {
    color: #121212;
    font-size: 32px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 38.40px;
    word-wrap: break-word;
}

.step-2-choose-difficulty {
    text-align: center;
}

.easy_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.easy {
    align-self: stretch;
}

.character15-20visible_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.f-8otherelements_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.age3-6recommended_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
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

.medium_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.medium {
    align-self: stretch;
}

.character10-15visible_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.f0-15otherelements_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.age7-10recommended_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
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

.hard_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
}

.hard {
    align-self: stretch;
}

.character8-12visible_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.f5-25otherelements_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.age11-12recommended_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
}

.select_05_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
}

.select_05 {
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

.heading_04 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
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

.heading_05 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
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

.heading_06 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
}

.button_05 {
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

.button_05.selected {
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
}

.button_05.selected .select_05_span {
    color: #438BFF;
}

.logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    margin: auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
.logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

.smiley {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
}

.eyes {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.puzzlepiece {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.user {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.crosshair {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_03 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_04 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_05 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.fire {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_06 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_07 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.globehemispherewest_08 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}

.arrowleft {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
}


.frame-2147227582 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
}

.frame-2147227582_02 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
}

.frame-2147227582_04 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
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
    background: #EEF6FF;
    border-radius: 99px;
    outline: 1px #438BFF solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
}

.tag-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
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

.frame-2147227503 {
    padding: 12px;
    background: #E7FEFF;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
}

.icons_03 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_04 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_05 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.frame-2147227503_01 {
    padding: 12px;
    background: #E7FEFF;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
}

.icons_06 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_07 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_08 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.frame-2147227503_02 {
    padding: 12px;
    background: #E7FEFF;
    border-radius: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
}

.icons_09 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_10 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
}

.icons_11 {
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
    display: flex;
    flex-direction: row;
    transition: background 0.2s;
  }
  
  .frame-1410104246:hover:not(:disabled) {
    background: #2566c9;
  }
  
  .frame-1410104246:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

.frame-2147227584 {
    flex: 1 1 0;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 16px;
    padding-bottom: 16px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-2147227581_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227581_04 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227583 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227584_01 {
    flex: 1 1 0;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 16px;
    padding-bottom: 16px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-2147227581_05 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227581_06 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227583_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227584_02 {
    flex: 1 1 0;
    padding-left: 15px;
    padding-right: 15px;
    padding-top: 16px;
    padding-bottom: 16px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
}

.frame-2147227581_07 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227581_08 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
}

.frame-2147227583_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 6px;
    display: flex;
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

.frame-2147227585 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
}

.frame-2147227582_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-2147227585_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
}

.frame-2147227582_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-2147227585_02 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
}

.frame-2147227582_05 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
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

.frame-2147227607 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-2147227607_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
}

.frame-2147227607_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
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
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
}

.frame-10_05 {
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

.frame-1410103852 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
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
    gap: 4px;
    display: inline-flex;
    cursor: pointer;
}

.card_03.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.card_04 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
    cursor: pointer;
}

.card_04.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
}

.card_05 {
    flex: 1 1 0;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
    cursor: pointer;
}

.card_05.selected {
    outline: 1px #173DB6 solid;
    box-shadow: 0px 1px 8px #438BFF;
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

.frame-2147227608 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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

.frame-1410103818 {
  width: 100%;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
  display: flex;
}

.interactive-search-configuration-default {
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

/* Callout styles (star + speech bubble) */
.polygon-1 {
  width: 0;
  height: 0;
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
  border-top: 12px solid transparent;
  border-right: 18px solid #d9eaff;
}

.star-container {
  flex-shrink: 0;
  width: 88px;
  height: 88px;
}

.message-container {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.message-content {
  padding-left: 12px;
  padding-right: 12px;
  padding-top: 16px;
  padding-bottom: 16px;
  background: #d9eaff;
  border-radius: 24px;
  margin-left: 22px;
  max-width: 446px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lets-craft-world_span {
  color: black;
  font-size: 18px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 25.2px;
  word-wrap: break-word;
}

.frame-1410104027 {
  justify-content: center;
  align-items: center;
  display: flex;
  width: 100%;
}

.desktop-progress {
  width: 100%;
}

/* Hide desktop progress bar on small screens so only the mobile one shows */
@media (max-width: 800px) {
  .desktop-progress {
    display: none;
  }

  .tag {
    text-align: left;
  }

  .tag-container {
    justify-content: flex-start;
  }
}

/* ---------- Responsive styles ---------- */

@media (max-width: 1024px) {
  .interactive-search-configuration-default {
    padding-left: 40px;
    padding-right: 40px;
  }
  
  .frame-1410103818 {
    align-items: stretch;
  }

  .frame-1410103884,
  .frame-1410103885 {
    width: 100%;
  }

  .frame-1410103852,
  .frame-2147227608 {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .tag-container {
    justify-content: flex-start;
  }

  .interactive-search-configuration-default {
    padding-left: 16px;
    padding-right: 16px;
    padding-top: 16px;
    padding-bottom: 40px;
    gap: 32px;
    align-items: stretch;
  }

  .navbar {
    padding-left: 0;
    padding-right: 0;
  }

  .logo-text-full {
    margin: 0 auto;
  }

  .configureyoursearchadventure_span {
    font-size: 28px;
    line-height: 1.2;
  }

  .step1choosestoryworld_span,
  .step2choosedifficulty_span {
    font-size: 22px;
    line-height: 1.3;
  }

  .frame-1410103818 {
    gap: 20px;
    justify-content: flex-start;
  }

  .star-container {
    width: 25%;
  }

  .message-container {
    max-width: 75%;
  }

  .message-content {
    width: 90%;
  }

  .frame-1410103884,
  .frame-1410103885 {
    padding: 16px;
    outline-width: 1px;
  }

  .frame-1410103852,
  .frame-2147227608 {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card,
  .card_01,
  .card_02,
  .card_03,
  .card_04,
  .card_05 {
    width: 100%;
  }

  .image,
  .image_01,
  .image_02 {
    height: 200px;
  }

  .frame-10,
  .frame-10_01,
  .frame-10_02,
  .frame-10_03,
  .frame-10_04,
  .frame-10_05 {
    gap: 16px;
  }

  .frame-1410104246 {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .tag-container {
    justify-content: flex-start;
  }

  .configureyoursearchadventure_span {
    font-size: 24px;
  }

  .step1choosestoryworld_span,
  .step2choosedifficulty_span {
    font-size: 20px;
  }

  .generatesearchadventure_span {
    font-size: 16px;
  }

  .button,
  .button_01,
  .button_02,
  .button_03,
  .button_04,
  .button_05 {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>