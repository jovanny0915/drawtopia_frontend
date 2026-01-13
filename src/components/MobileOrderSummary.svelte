<script>
  import caretdown from "../assets/CaretDown.svg";
</script>
<div class="card">
  <div class="frame-1410103972">
      <div class="order-summary-2-items"><span class="ordersummary2items_span">Order Summary (2 Items)</span></div>
      <img src={caretdown} alt=""/>
  </div>
  <div class="stroke"></div>
  <div class="frame-1410103968">
      <div><span class="ordertotal_span">Order Total</span></div>
      <div><span class="f800_span">$28.00</span></div>
  </div>
</div>

<style>
.ordersummary2items_span {
  color: black;
  font-size: 20px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 28px;
  word-wrap: break-word;
}

.order-summary-2-items {
  flex: 1 1 0;
}



.stroke {
  align-self: stretch;
  height: 1px;
  background: #DCDCDC;
}

.ordertotal_span {
  color: #121212;
  font-size: 20px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 28px;
  word-wrap: break-word;
}

.f800_span {
  color: black;
  font-size: 20px;
  font-family: Quicksand;
  font-weight: 600;
  line-height: 28px;
  word-wrap: break-word;
}

.frame-1410103968 {
  align-self: stretch;
  justify-content: space-between;
  align-items: flex-start;
  display: inline-flex;
}



.frame-1410103972 {
  align-self: stretch;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  display: inline-flex;
}

.card {
  width: 100%;
  height: 100%;
  padding: 12px;
  background: white;
  border-radius: 12px;
  outline: 1px #DCDCDC solid;
  outline-offset: -1px;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 12px;
  display: inline-flex;
}
</style>