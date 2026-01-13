<script lang="ts">
  export let options: Array<{value: string, label: string, disabled?: boolean}>;
  export let selectedOption: string;
  export let onChange: (event: Event) => void;
  export let placeholder: string = "Select your account";
  export let id: string = "accountType";
</script>

<select
  {id}
  required
  class="selectyouraccount_span select-wrapper"
  on:change={(e) => {
    const target = e.target as HTMLSelectElement;
    selectedOption = target.value;
    onChange(e);
  }}
  value={selectedOption}
>
  <option value="" disabled selected hidden>{placeholder}</option>
  {#each options as option}
    <option value={option.value} disabled={option.disabled}>{option.label}</option>
  {/each}
</select>

<style>
  .select-wrapper {
    padding: 12px 14px;
    border: 1px solid #dcdcdc;
    border-radius: 12px;
    background-color: white;
    font-size: 16px;
    color: #141414;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("../assets/CaretDown.svg");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .select-wrapper:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
    border-color: #438bff;
  }
  .selectyouraccount_span {
    color: #666d80;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
    width: 100%;
  }

  option:disabled {
    color: #999;
    background-color: #f5f5f5;
  }
</style>
