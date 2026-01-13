<script>
  export let text;
  export let linkText;
  export let link;
</script>

<a href={link} class="text-btn">
  <div class="text-group">
    <span class="text-span_01">{text}</span>
    &nbsp; <span class="text-span_02">{linkText}</span>
  </div>
</a>

<style>
    .text-span_01 {
    color: #727272;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .text-span_02 {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .text-group {
    text-align: center;
  }
  .text-btn {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    /* box-shadow: 0px 4px 4px rgba(141.8, 141.8, 141.8, 0.25) inset; */
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }
</style>
