<script>
  import caretdown from "../assets/CaretDown.svg";
  
  export let userName = "Alex Smith";
  export let userPlan = "Premium Plan";
  export let avatarUrl = "https://placehold.co/40x40";
</script>

<div class="navbar">
  <div class="logo-text-full">
    <div class="logo-img"></div>
  </div>

  <slot name="profile">
    <div class="profile-close">
      <div class="frame-1410103913">
        <img
          class="ellipse-7"
          src={avatarUrl}
          alt="user avatar"
        />
        <div class="heading">
          <div class="alex-smith">
            <span class="alexsmith_span">{userName}</span>
          </div>
          <div class="premium-plan">
            <span class="premiumplan_span">{userPlan}</span>
          </div>
        </div>
      </div>
      <img class="" src={caretdown} alt="vector" />
    </div>
  </slot>
</div>

<style>
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

  .ellipse-7 {
    width: 40px;
    height: 40px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .alexsmith_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .alex-smith {
    align-self: stretch;
  }

  .premiumplan_span {
    color: #727272;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .premium-plan {
    align-self: stretch;
  }

  .heading {
    width: 119px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    position: relative;
  }

  .frame-1410103913 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .profile-close {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: #fcfcfc;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .navbar {
    width: 100%;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .heading {
      display: none;
    }

    .navbar {
      padding-left: 16px;
      padding-right: 16px;
      outline: none;
    }

    .profile-close {
      padding-left: 8px;
      padding-right: 8px;
    }

    .ellipse-7 {
      width: 32px;
      height: 32px;
    }

    .logo-text-full {
      width: 160px;
      height: 32px;
    }
  }
</style>
