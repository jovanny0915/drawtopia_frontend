<script lang="ts">
  export let selectedAgeGroup = "";
  import img02 from '../assets/0-2.png';
  import img35 from '../assets/3-5.png';
  import img671 from '../assets/6-7-1.png';
  import img672 from '../assets/6-7-2.png';
  import img8101 from '../assets/8-10-1.png';
  import img8102 from '../assets/8-10-2.png';
  import img11121 from '../assets/11-12-1.png';
  import img11122 from '../assets/11-12-2.png';
  

  // Map age groups to their corresponding images
  const getPreviewImage = (ageGroup: string) => {
    const imageMap: { [key: string]: [string, string] } = {
      "0-2": [img02, "x"],
      "3-5": [img35, "x"],
      "6-7": [img671, img672],
      "8-10": [img8101, img8102],
      "11-12": [img11121, img11122],
    };

    return imageMap[ageGroup] || [img02, "x"]; // Default to 02 image
  };

  // Get story text based on age group
  const getStoryText = (ageGroup: string) => {
    const storyMap: { [key: string]: string } = {
      "0-2": "Once upon a time, [Character Name] discovered a colorful toy…",
      "3-5": "One sunny day, [Character Name] found a magical hat…",
      "6-7": "In a magical forest, [Character Name] met a friendly dragon…",
      "8-10": "During a school adventure, [Character Name] solved a mystery…",
      "11-12": "On an epic quest, [Character Name] discovered ancient secrets…",
    };

    return (
      storyMap[ageGroup] ||
      "One sunny day, [Character Name] found a magical hat…"
    );
  };
</script>

<div class="frame-11">
  <div class="frame-1410104018">
    <div class="story-preview">
      <span class="storypreview_span">Story Preview</span>
    </div>
    <div class="see-how-your-story-will-look">
      <span class="seehowyourstorywilllook_span"
        >See how your story will look</span
      >
    </div>
  </div>
  <div class="frame-8">
    {#if getPreviewImage(selectedAgeGroup)[1] !== "x"}
      <div class="image" style="display: flex; flex-direction: row;">
        <img
          class="double-image"
          src={getPreviewImage(selectedAgeGroup)[0]}
          alt="Story Preview"
        />
        <img
          class="double-image"
          src={getPreviewImage(selectedAgeGroup)[1]}
          alt="Story Preview"
        />
      </div>
    {:else}
      <div class="image">
        <img
          class="image-2"
          src={getPreviewImage(selectedAgeGroup)[0]}
          alt="Story Preview"
        />
      </div>
    {/if}

    <div class="frame-1410104019">
      <div class="one-sunny-day-character-name-found-a-magical-hat">
        <span class="onesunnydaycharacternamefoundamagicalhat_span"
          >{getStoryText(selectedAgeGroup)}</span
        >
      </div>
    </div>
  </div>
  <div class="frame-1410104025">
    <div class="frame-1410104020">
      <div class="ellipse-10"></div>
      <div class="ellipse-11"></div>
      <div class="ellipse-12"></div>
    </div>
    <div>
      <span class="taptoflipthroughpages_span">Tap to flip through pages</span>
    </div>
  </div>
</div>

<style>
  .storypreview_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .story-preview {
    align-self: stretch;
  }

  .seehowyourstorywilllook_span {
    color: #666d80;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .see-how-your-story-will-look {
    align-self: stretch;
  }

  .image-2 {
    width: 100%;
    height: 100%;
    left: -10px;
    top: 0px;
    position: absolute;
  }

  .onesunnydaycharacternamefoundamagicalhat_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .one-sunny-day-character-name-found-a-magical-hat {
    flex: 1 1 0;
  }

  .ellipse-10 {
    width: 8px;
    height: 8px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .ellipse-11 {
    width: 8px;
    height: 8px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .ellipse-12 {
    width: 8px;
    height: 8px;
    background: #d9d9d9;
    border-radius: 9999px;
  }

  .taptoflipthroughpages_span {
    color: #666d80;
    font-size: 24px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .frame-1410104018 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410104019 {
    align-self: stretch;
    padding: 12px;
    background: #fbfbfb;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .image {
    align-self: stretch;
    height: 593px;
    position: relative;
    background: #ededed;
    overflow: hidden;
    border-radius: 12px;
  }

  .frame-1410104020 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-8 {
    align-self: stretch;
    padding: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104025 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-11 {
    width: 50%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .double-image {
    width: 50%;
    height: 100%;
    padding: 5px;
    border-radius: 15px;
    object-fit: cover;
  }
  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .frame-11 {
      min-width: 100%;
    }

    .storypreview_span {
      font-size: 24px;
      line-height: 28px;
    }

    .seehowyourstorywilllook_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-1410104020 {
      flex-direction: column;
      gap: 16px;
    }

    .frame-1410104019 {
      width: 100%;
      height: auto;
      min-height: 200px;
    }



    .frame-1410104018 {
      padding: 16px;
      gap: 12px;
    }
  }

  /* Extra small mobile devices */
  @media (max-width: 480px) {
    .storypreview_span {
      font-size: 24px;
      line-height: 28px;
    }

    .seehowyourstorywilllook_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-1410104018 {
      padding: 12px;
      gap: 8px;
    }

    .frame-1410104019 {
      min-height: 180px;
    }


  }
</style>
