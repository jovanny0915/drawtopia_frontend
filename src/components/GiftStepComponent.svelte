<script lang="ts">
  export let currentStep: number = 1;
  export let totalSteps: number = 3;
  export let stepTitle: string = "Setting Up Gift";
  export let stepLabel: string = "Step 1";
  
  $: progressPercent = (currentStep / totalSteps) * 100;
</script>

<div class="progress-bar">
  <div class="frame-1410103829">
    <div class="frame-1410103997">
      <div class="step-1"><span class="step1_span">{stepLabel}</span></div>
      <div><span class="f3_span">{currentStep}/{totalSteps}</span></div>
    </div>
    <div class="bar">
      <div class="bar_01" style="width: {progressPercent}%"></div>
    </div>
    <div class="setting-up-gift">
      <span class="settingupgift_span">{stepTitle}</span>
    </div>
  </div>
</div>

<style>
  .step1_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .step-1 {
    width: 63px;
  }

  .f3_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .bar_01 {
    height: 8px;
    background: #438bff;
    border-radius: 12px;
    transition: width 0.3s ease;
  }

  .settingupgift_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .setting-up-gift {
    align-self: stretch;
  }

  .frame-1410103997 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    overflow: hidden;
    border-radius: 12px;
  }

  .frame-1410103829 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .progress-bar {
    margin: auto;
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
    width : 100%;
  }
</style>
