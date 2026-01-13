<script>
  import WarningOctagon from "../assets/WarningOctagon.svg";
  import checkCircle from "../assets/CheckCircle.svg";
  import xCircle from "../assets/XCircle.svg";
  import { createEventDispatcher } from 'svelte';
  import x from "../assets/X.svg";

  const dispatch = createEventDispatcher();

  function closeModal() {
    dispatch('close');
  }

  function handleGrantPermissions() {
    dispatch('grant');
  }
</script>

<div class="information-helper-text">
  <div class="frame-1410103845">
    <div class="frame-1410103839">
      <div class="logo-text-full">
        <div class="logo-img"></div>
      </div>
      <button type="button" class="x-button" on:click={closeModal} aria-label="Close modal">
        <img class="x" src={x} alt="x" />
      </button>
    </div>
    <div class="stroke"></div>
  </div>
  <div class="frame-1410103944">
    <img class="warningoctagon" src={WarningOctagon} alt="warningoctagon" />
    <div class="frame-1410104192">
      <div>
        <span class="weneedyourhelptocapturethemagic_span"
          >We Need Your Help to Capture the Magic!</span
        >
      </div>
      <div
        class="to-record-your-full-reaction-we-need-access-to-your-camera-microphone-and-media-library"
      >
        <span
          class="torecordyourfullreactionweneedaccesstoyourcameramicrophoneandmedialibrary_span"
          >To record your full reaction, we need access to your camera,
          microphone, and media library.</span
        >
      </div>
    </div>
  </div>
  <div class="checklist-container">
    <div class="checklist">
      <img src={checkCircle} alt="camera" />
      <div class="frame-1410104193">
        <div class="camera"><span class="camera_span">Camera</span></div>
        <div class="lets-see-those-smiles-and-surprised-faces">
          <span class="letsseethosesmilesandsurprisedfaces_span"
            >Let’s see those smiles and surprised faces!</span
          >
        </div>
      </div>
    </div>
    <div class="checklist_01">
      <img src={xCircle} alt="microphone" />
      <div class="frame-1410104193_01">
        <div class="microphone">
          <span class="microphone_span">Microphone</span>
        </div>
        <div class="we-need-this-to-hear-your-laughter-gasps-and-wows">
          <span class="weneedthistohearyourlaughtergaspsandwows_span"
            >We need this to hear your laughter, gasps, and WOWs!</span
          >
        </div>
      </div>
    </div>
    <div class="checklist_02">
      <img src={checkCircle} alt="media-library" />
      <div class="frame-1410104193_02">
        <div class="media-library">
          <span class="medialibrary_span">Media Library</span>
        </div>
        <div class="lets-see-those-smiles-and-surprised-faces_01">
          <span class="letsseethosesmilesandsurprisedfaces_01_span"
            >Let’s see those smiles and surprised faces!</span
          >
        </div>
      </div>
    </div>
  </div>
  <div class="button" role="button" tabindex="0" on:click={handleGrantPermissions} on:keydown={(e) => e.key === 'Enter' && handleGrantPermissions()}>
    <div class="grant-all-premission">
      <span class="grantallpremission_span">Grant All Premission</span>
    </div>
  </div>
</div>

<style>
  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .weneedyourhelptocapturethemagic_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .torecordyourfullreactionweneedaccesstoyourcameramicrophoneandmedialibrary_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .to-record-your-full-reaction-we-need-access-to-your-camera-microphone-and-media-library {
    align-self: stretch;
    text-align: center;
  }

  .camera_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .camera {
    text-align: center;
  }

  .letsseethosesmilesandsurprisedfaces_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .lets-see-those-smiles-and-surprised-faces {
    text-align: center;
  }

  .microphone_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .microphone {
    text-align: center;
  }

  .weneedthistohearyourlaughtergaspsandwows_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .we-need-this-to-hear-your-laughter-gasps-and-wows {
    text-align: center;
  }

  .medialibrary_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .media-library {
    text-align: center;
  }

  .letsseethosesmilesandsurprisedfaces_01_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .lets-see-those-smiles-and-surprised-faces_01 {
    text-align: center;
  }

  .grantallpremission_span {
    color: #438bff;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .grant-all-premission {
    text-align: center;
  }

  .frame-1410104192 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410104193 {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104193_01 {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104193_02 {
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .button {
    align-self: stretch;
    height: 57px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .x-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .x {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .warningoctagon {
    width: 64px;
    height: 64px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103944 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .checklist {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    background: #effefa;
    border-radius: 12px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .checklist_01 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    background: #fff0f3;
    border-radius: 12px;
    outline: 1px #df1c41 solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .checklist_02 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    background: #effefa;
    border-radius: 12px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .checklist-container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    height: 100%;
    padding: 16px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #fdfdfd;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: inline-flex;
  }
  .logo-img {
    background-image: url("../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
</style>
