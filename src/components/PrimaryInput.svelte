<script>
  export let type;
  export let value = "";
  export let placeholder;
  export let errors;
  export let disabled;
</script>

<input
  {type}
  bind:value
  {placeholder}
  class="primary-input"
  class:error={errors && errors[type]}
  {disabled}
/>

<style>
  .primary-input {
    width: 100%;
    height: 50px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1.5px solid #e0e0e0;
    font-size: 16px;
    font-weight: 400;
    color: #333;
    background-color: #ffffff;
    outline: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .primary-input::placeholder {
    color: #999;
    font-weight: 400;
  }

  .primary-input:hover:not(:disabled):not(.error) {
    border-color: #438bff;
    box-shadow: 0 2px 8px rgba(67, 139, 255, 0.1);
    transform: translateY(-1px);
  }

  .primary-input:focus:not(:disabled) {
    border-color: #438bff;
    box-shadow: 0 0 0 3px rgba(67, 139, 255, 0.1), 0 2px 8px rgba(67, 139, 255, 0.15);
    transform: translateY(-1px);
  }

  .primary-input.error {
    border-color: #ef4444;
    background-color: #fef2f2;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .primary-input.error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15), 0 2px 8px rgba(239, 68, 68, 0.1);
  }

  .primary-input:disabled {
    background-color: #f5f5f5;
    border-color: #e0e0e0;
    color: #999;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .primary-input:disabled::placeholder {
    color: #bbb;
  }
</style>
