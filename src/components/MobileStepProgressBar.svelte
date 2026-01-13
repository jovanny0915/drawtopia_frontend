<script>
  export let currentStep = 1;
  
  const stepTitles = [
    "",
    "Character Upload",
    "Character Enhancement", 
    "Format Selection",
    "Story World",
    "Adventure Type",
    "Generate Story",
  ];
  
  $: progressWidth = (currentStep / 6) * 100;
</script>

<div class="progress-bar">
  <div class="frame-1410103829">
      <div class="frame-1410103997">
          <div class="step-2"><span class="step2_span">Step {currentStep}</span></div>
          <div><span class="f7_span">{currentStep}/6</span></div>
      </div>
      <div class="bar">
          <div class="bar_01" style="width: {progressWidth}%"></div>
      </div>
      <div class="character-details"><span class="characterdetails_span">{stepTitles[currentStep]}</span></div>
  </div>
</div>

<style>
.step2_span {
  color: #727272;
  font-size: 16px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.step-2 {
  width: 63px;
}

.f7_span {
  color: #727272;
  font-size: 16px;
  font-family: Nunito;
  font-weight: 400;
  line-height: 22.40px;
  word-wrap: break-word;
}

.bar_01 {
  width: 108px;
  height: 8px;
  left: 0px;
  top: 0px;
  position: absolute;
  background: #438BFF;
  border-radius: 12px;
}

.characterdetails_span {
  color: #121212;
  font-size: 16px;
  font-family: Quicksand;
  font-weight: 500;
  line-height: 22.40px;
  word-wrap: break-word;
}

.character-details {
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
  background: #EEF6FF;
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
  display: none;
}
@media (max-width: 800px) {
  .progress-bar {
  width: 100%;
  height: 100%;
  padding: 12px;
  border-radius: 12px;
  outline: 1px #EDEDED solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 8px;
  display: inline-flex;
}
}
</style>