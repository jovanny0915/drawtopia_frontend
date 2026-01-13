<script lang="ts">
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    import arrow_left from "../../../assets/ArrowLeft.svg";
    import people_svg from "../../../assets/people.svg";
    import logo from "../../../assets/logo.png";
    import createSend from "../../../assets/create-send.png"; // Two children with laptop and gift
    import sendLink from "../../../assets/send-link.png"; // Woman and boy with laptop
    import shieldstart from "../../../assets/ShieldStar.svg";
    import star from "../../../assets/star.png";

    type GiftMode = "create" | "link" | null;
    let selectedMode: GiftMode = null;

    const selectMode = (mode: Exclude<GiftMode, null>) => {
        selectedMode = mode;
    };

    const handleContinue = () => {
        if (!selectedMode) return;
        if (browser) {
            sessionStorage.setItem("gift_mode", selectedMode);
        }
        if (selectedMode === "create") {
            goto("/create-character/1"); // TODO: Update when create flow is ready
        } else {
            goto("/gift/sendlink/1");
        }
    };

    const handleBack = () => {
        goto("/dashboard");
    };
</script>

<div class="gift-mode-page">
    <div class="navbar">
        <div class="logo-text-full">
            <div
                class="logo-img"
                style={`background-image: url(${logo});`}
            ></div>
        </div>
    </div>
    <div class="content">
        <div class="divider">
            <div class="content-header">
                <h1 class="title">How would you like to give this gift?</h1>
                <div class="header">
                    <p class="subtitle">
                        A thoughtful gift deserves a personal touch
                    </p>
                </div>
    
                <div class="tip">
                    <img src={shieldstart} alt="shieldstart" class="shieldstart" />
                    <span class="tip-text">2 Free Page Preview</span>
                </div>
            </div>
    
            <div class="tip-question">
                <img src={star} alt="star" class="tip-question-star" />
                <div style="display:flex; flex-direciton:row;">
                    <svg class="tip-shape" style="transform: translate(10px, 0px); z-index: 0;" viewBox="0 0 21.5 82" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <polygon points="0,50 21.5,30 21.5,50" class="tip-shape-fill" />
                    </svg>
                    <div class="tip-question-container">
                        <div class="tip-question-text">
                            <span> How do you hisyam want to give your gift? </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="cards">
            <div class="cards-container">
                <div
                    class={`card ${selectedMode === "create" ? "selected" : ""}`}
                    role="button"
                    tabindex="0"
                    on:click={() => selectMode("create")}
                    on:keydown={(e) =>
                        e.key === "Enter" && selectMode("create")}
                >
                    <div
                        class="card-media"
                        style={`background-image: url(${createSend});`}
                    ></div>
                    <div class="card-body">
                        <div class="card-title">Create & Send</div>
                        <div class="card-desc">
                            You create the book using the recipient’s details
                            and send it when complete.
                        </div>
                        <div class="best-for">
                            <div class="best-for-title">Best For</div>
                            <ul>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Grandparents
                                </li>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Teachers
                                </li>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Surprise gifts
                                </li>
                            </ul>
                        </div>
                        <button
                            class="secondary"
                            on:click|stopPropagation={() => {
                                selectMode("create");
                                handleContinue();
                            }}>I’ll Create It</button
                        >
                    </div>
                </div>

                <div
                    class={`card ${selectedMode === "link" ? "selected" : ""}`}
                    role="button"
                    tabindex="0"
                    on:click={() => selectMode("link")}
                    on:keydown={(e) => e.key === "Enter" && selectMode("link")}
                >
                    <div
                        class="card-media"
                        style={`background-image: url(${sendLink});`}
                    ></div>
                    <div class="card-body">
                        <div class="card-title">Send Creation Link</div>
                        <div class="card-desc">
                            Parent creates the book with their child using the
                            creation link you send them.
                        </div>
                        <div class="best-for">
                            <div class="best-for-title">Best For</div>
                            <ul>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Sending to parents
                                </li>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Group gifts
                                </li>
                                <li class="best-for-list-item">
                                    <img src={people_svg} alt="peoplesvg" class="peoplesvg" />
                                    Birthday invites
                                </li>
                            </ul>
                        </div>
                        <button
                            class="secondary"
                            on:click|stopPropagation={() => {
                                selectMode("link");
                                handleContinue();
                            }}>Send Link</button
                        >
                    </div>
                </div>
            </div>
        </div>

        <div class="actions">
            <button class="ghost" on:click={handleBack}>
                <img src={arrow_left} alt="back" class="arrow" />
                Back To Step
            </button>
            <button
                class="primary large"
                disabled={!selectedMode}
                on:click={handleContinue}
            >
                Continue to Send Gift
            </button>
        </div>
    </div>
</div>

<style>
    .gift-mode-page {
        margin: auto;
        min-height: 100%;
        width: 1240px;
        padding-top: 24px;
        padding-bottom: 80px;
        padding-left: 100px;
        padding-right: 100px;
        background: white;
        display: flex;
        flex-direction: column;
        gap: 48px;
        justify-content: space-between;
    }

    .content {
        height: 1075px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        justify-content: space-between;
    }

    .content-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        justify-content: space-between;
    }

    .divider {
        width: 1240px;
        border-bottom: 1px #D9D9D9 solid;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding-bottom: 18px;
    }

    .navbar {
        align-self: stretch;
        height: 79px;
        padding-top: 12px;
        padding-bottom: 12px;
        padding-left: 24px;
        padding-right: 12px;
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
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        width: 100%;
        height: 100%;
    }

    .header {
        text-align: center;
        max-width: 820px;
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
        color: #666d80;
        margin-top: 8px;
    }

    .cards {
    }

    .cards-container {
        display: flex;
        gap: 16px;
        width: 100%;
        max-width: 980px;
    }

    .card {
        width: 402px;
        height: 671px;
        background: #ffffff;
        border-radius: 12px;
        outline: 1px #dcdcdc solid;
        outline-offset: -1px;
        overflow: hidden;
        cursor: pointer;
        transition:
            box-shadow 0.2s ease,
            transform 0.1s ease;
        display: flex;
        flex-direction: column;
    }
    .card:hover {
        box-shadow: 0 4px 12px rgba(67, 139, 255, 0.15);
    }
    .card.selected {
        outline: 2px #6912c5 solid;
        box-shadow: 0 2px 10px #871fff33;
    }

    .card-media {
        width: 402px;
        height: 350px;
        background-size: cover;
        background-position: center;
    }
    .card-body {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
    }
    .card-title {
        font-family: Quicksand;
        font-weight: 600;
        font-size: 24px;
        color: #121212;
        padding-bottom: 8px;
        border-bottom: 1px #EDEDED solid;
    }
    .card-desc {
        font-family: Nunito;
        font-size: 16px;
        color: #666d80;
    }
    .best-for-title {
        font-family: Quicksand;
        font-size: 14px;
        color: #444;
        margin-bottom: 6px;
    }
    .best-for ul {
        margin: 0;
        color: #141414;
        font-family: Nunito;
        font-size: 14px;
        list-style-type: none;
    }

    .best-for-list-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .best-for-list-item img {
        width: 16px;
        height: 16px;
    }

    .primary,
    .secondary,
    .ghost {
        border: none;
        border-radius: 12px;
        padding: 12px 24px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: Quicksand;
        font-size: 18px;
        font-weight: 600;
    }
    .primary {
        background: #438bff;
        color: white;
    }
    .primary:hover {
        background: #3a7ae4;
    }
    .secondary {
        background: #f8fafb;
        color: #121212;
        outline: 1px #dcdcdc solid;
    }
    .secondary:hover {
        background: #f0f4f8;
    }
    .ghost {
        background: white;
        outline: 1px #dcdcdc solid;
        color: #121212;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .ghost:hover {
        background: #f8fafb;
    }
    .primary.large {
        padding: 16px 24px;
    }
    .primary.large:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .actions {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .arrow {
        width: 20px;
        height: 20px;
    }


    @media (max-width: 800px) {
        .gift-mode-page {
            padding-left: 16px;
            padding-right: 16px;
            padding-top: 16px;
            padding-bottom: 16px;
            gap: 24px;
        }
        .cards {
            grid-template-columns: 1fr;
        }
        .card-media {
            height: 180px;
        }
        .title {
            font-size: 32px;
            line-height: 44px;
        }
        .actions {
            flex-direction: column-reverse;
            gap: 12px;
            align-items: stretch;
        }
        .primary.large,
        .ghost {
            width: 100%;
            justify-content: center;
        }
    }

    .tip {
        border: 1px solid #438bff;
        color: #438bff;
        background-color: #eef6ff;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 16px 8px 8px;
        border-radius: 179px;
        font-size: 14px;
    }
    .shieldstart {
        width: 24px;
        height: 24px;
    }

    .tip-question {
        display: flex;
        text-align: center;
        margin: auto;
        width: 531px;
        height: 88px;
        gap: 12px;
    }
    .tip-question-container {
        width: 431px;
        height: 82px;
        z-index: 2;
    }
    .tip-question-text {
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
        z-index: 100;
        font-family: Quicksand;
    }

    .tip-question-star {
        width: 88px;
        height: 88px;
    }

    .tip-shape {
        width: 21.5px;
        height: 88px;
        flex: 0 0 21.5px;
    }
    .tip-shape-fill {
        fill: #d9eaff;
        stroke: none;
        opacity: 1;
    }
    .tip-shape-stroke {
        stroke: #438bff;
        stroke-width: 3;
        stroke-linejoin: round;
    }
</style>
