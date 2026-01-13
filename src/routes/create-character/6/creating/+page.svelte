<script>
  import ProgressBar from "../../../../components/ProgressBar.svelte";
  import arrowLeft from "../../../../assets/ArrowLeft.svg";
  import shieldStar from '../../../../assets/ShieldStar.svg';
  import question from '../../../../assets/Question.svg';
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
      <div class="logo-img"></div>
    </div>
  </div>
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span"
          >Choose your Character Style Selection</span
        >
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Choose the artistic style that will bring your character to life. Each style offers a unique way to tell your story.</span
        >
      </div>
      <div class="tag">
        <div class="shieldstar">
          <img src={shieldStar} alt="star" />
        </div>
        <div>
          <span class="ffreepagepreview_span">2 Free Page Preview</span>
        </div>
      </div>
    </div>
    <ProgressBar currentStep={6} />
    <div class="frame-13">
      <div class="frame-1410103853">
          <div class="frame-8">
              <div class="image">
                  <div class="frame-1410104051">
                      <div class="spinner">
                          <div class="spinner-circle"></div>
                      </div>
                      <div class="your-preview-will-be-ready-in-about-1-minute"><span class="yourpreviewwillbereadyinabout1minute_span">Your preview will be ready in about 1 minute</span></div>
                  </div>
              </div>
              <div class="frame-1410104037">
                <img src={question} alt="question" />
                  <div><span class="didyouknowtheaveragechildrensbookhas32pages_span">Did you know? The average children's book has 32 pages!</span></div>
              </div>
          </div>
          <div class="frame-1410103854">
              <div class="frame-1410103855">
                  <div class="bar"></div>
                  <div class="bar_01"></div>
              </div>
              <div class="text-25-enhancing-your-characters-drawing"><span class="f5enhancingyourcharactersdrawing_span">25% Enhancing your character's drawing...</span></div>
          </div>
      </div>
      <div class="frame-13_01">
          <div class="button">
              <div class="cancel"><span class="cancel_span">Cancel</span></div>
          </div>
      </div>
  </div>
  </div>
  <div class="frame-1410103821">
    <div class="contact-us-hellodrawtopiacom">
      <span class="contactushellodrawtopiacom_span"
        >Contact us: hello@drawtopia.com</span
      >
    </div>
    <div class="rectangle-34"></div>
    <div class="frame-1410103820">
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
</div>

<style>
  .createyourcharacter_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-your-character {
    align-self: stretch;
    text-align: center;
  }

  .uploadyourdrawingordrawyourowncharacterrighthere_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .upload-your-drawing-or-draw-your-own-character-right-here {
    align-self: stretch;
    text-align: center;
  }

  .ffreepagepreview_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    word-wrap: break-word;
  }

  .contactushellodrawtopiacom_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .contact-us-hellodrawtopiacom {
    text-align: center;
  }

  .rectangle-34 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .privacypolicy_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .privacy-policy {
    text-align: center;
  }

  .termsofservice_span {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .terms-of-service {
    text-align: center;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .shieldstar {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    top: -2px;
  }

  .frame-1410103821 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    justify-content: center;
  }

  .tag {
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 12px;
    background: #eef6ff;
    border-radius: 99px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 4px;
    display: inline-flex;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    gap: 24px;
    display: flex;
  }

  .character-creation-default {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 80px;
    padding-left: 100px;
    padding-right: 100px;
    background: white;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 48px;
    display: inline-flex;
  }
  .logo-text-full {
    width: 203.32px;
    height: 38px;
    min-height: 38px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }

 
  .image {
      align-self: stretch;
      height: 280px;
      position: relative;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
  }
  
  .spinner-circle {
      width: 32px;
      height: 32px;
      border: 3px solid #EEF6FF;
      border-top: 3px solid #438BFF;
      border-radius: 50%;
      animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
  }
  
  .yourpreviewwillbereadyinabout1minute_span {
      color: black;
      font-size: 18px;
      font-family: Nunito;
      font-weight: 400;
      line-height: 21.60px;
      word-wrap: break-word;
  }
  
  .your-preview-will-be-ready-in-about-1-minute {
      align-self: stretch;
      text-align: center;
  }
  
  .didyouknowtheaveragechildrensbookhas32pages_span {
      color: black;
      font-size: 16px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 22.40px;
      word-wrap: break-word;
  }
  
  .bar {
      align-self: stretch;
      height: 8px;
      position: relative;
      background: #EEF6FF;
      border-radius: 12px;
  }
  
  .bar_01 {
      width: 125px;
      height: 8px;
      left: 0px;
      top: 0px;
      position: absolute;
      background: #438BFF;
      border-radius: 12px;
  }
  
  .f5enhancingyourcharactersdrawing_span {
      color: #438BFF;
      font-size: 18px;
      font-family: Nunito;
      font-weight: 600;
      line-height: 21.60px;
      word-wrap: break-word;
  }
  
  .text-25-enhancing-your-characters-drawing {
      align-self: stretch;
      text-align: center;
  }
  
  .cancel_span {
      color: black;
      font-size: 18px;
      font-family: Quicksand;
      font-weight: 600;
      line-height: 25.20px;
      word-wrap: break-word;
  }
  
  .cancel {
      text-align: center;
  }
  
  .button {
      width: 200px;
      padding-left: 24px;
      padding-right: 24px;
      padding-top: 16px;
      padding-bottom: 16px;
      box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
      border-radius: 20px;
      outline: 1px #DCDCDC solid;
      outline-offset: -1px;
      justify-content: center;
      align-items: center;
      gap: 10px;
      display: inline-flex;
  }
  
  .spinner {
      width: 40px;
      height: 40px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
  }
  
  .frame-1410103855 {
      align-self: stretch;
      position: relative;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 8px;
      display: flex;
  }
  
  .frame-13_01 {
      align-self: stretch;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 24px;
      display: flex;
  }
  
  .frame-1410104051 {
      width: 248px;
      left: 137px;
      top: 187px;
      position: absolute;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      display: inline-flex;
  }
  
  .frame-1410104037 {
      align-self: stretch;
      padding: 12px;
      background: #F5F2FF;
      border-radius: 10px;
      outline: 1px #964DFF solid;
      outline-offset: -1px;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      display: inline-flex;
  }
  
  .frame-1410103854 {
      width: 500px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 8px;
      display: flex;
  }
  
  .image {
      align-self: stretch;
      height: 482px;
      position: relative;
      background: #EEF6FF;
      overflow: hidden;
      border-radius: 10px;
  }
  
  .frame-8 {
      width: 542px;
      padding: 10px;
      background: white;
      border-radius: 20px;
      outline: 1px #DCDCDC solid;
      outline-offset: -1px;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 12px;
      display: flex;
  }
  
  .frame-1410103853 {
      align-self: stretch;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 12px;
      display: flex;
  }
  
  .frame-13 {
      width: 100%;
      height: 100%;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      gap: 24px;
      display: inline-flex;
  }
</style>
