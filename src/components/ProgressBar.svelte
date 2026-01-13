<script lang="ts">
  export let currentStep = 1;

  const steps = [
    { number: 1, label: "Character Upload" },
    { number: 2, label: "Enhancement Level" },
    { number: 3, label: "Format Selection" },
    { number: 4, label: "Story World" },
    { number: 5, label: "Story Generate" },
  ];

  const getBarClass = (stepNumber: number) => {
    return stepNumber <= currentStep ? "bar-active" : "bar-inactive";
  };

  const getStepClass = (stepNumber: number) => {
    return stepNumber === currentStep ? "step-current" : "step-normal";
  };

  const getLabelClass = (stepNumber: number) => {
    return stepNumber === currentStep ? "label-current" : "label-normal";
  };
</script>

<div class="progress-bar">
  <div class="progress-bar_01">
    {#each steps as step, index}
      <div class="progress-bar_0{index + 2}">
        {#if index === 0}
          <div class="step-{step.number}">
            <span class={getStepClass(step.number)}>Step {step.number}</span>
          </div>
          <div class={getBarClass(step.number)}></div>
          <div class="frame-1410103829">
            <div class="step-label">
              <span class={getLabelClass(step.number)}>{step.label}</span>
            </div>
          </div>
        {:else}
          <div class="frame-1410103829_0{index}">
            <div class="step-{step.number}">
              <span class={getStepClass(step.number)}>Step {step.number}</span>
            </div>
          </div>
          <div class={getBarClass(step.number)}></div>
          <div class="step-label">
            <span class={getLabelClass(step.number)}>{step.label}</span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .progress-bar {
    width: 100%;
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

  .progress-bar_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .progress-bar_02,
  .progress-bar_03,
  .progress-bar_04,
  .progress-bar_05,
  .progress-bar_06,
  .progress-bar_07,
  .progress-bar_08 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .step-1,
  .step-2,
  .step-3,
  .step-4,
  .step-5,
  .step-6,
  .step-7 {
    width: 63px;
  }

  .step-current {
    color: #438bff;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .step-normal {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .bar-active {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #438bff;
    border-radius: 12px;
  }

  .bar-inactive {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    border-radius: 12px;
  }

  .label-current {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .label-normal {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .step-label {
    align-self: stretch;
  }

  .frame-1410103829 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103829_01,
  .frame-1410103829_02,
  .frame-1410103829_03,
  .frame-1410103829_04,
  .frame-1410103829_05,
  .frame-1410103829_06 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }
  @media (max-width: 800px) {
    .progress-bar {
      display: none;
    }
  }
</style>
