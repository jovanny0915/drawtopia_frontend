<script lang="ts">
  import vectorBook from "../assets/vectorBook.svg";
  import PersonSimple from "../assets/PersonSimple.svg";
  import animal from "../assets/animal.svg";
  import monster from "../assets/monster.svg";
  import Star from "../assets/Star.svg";
  import eye from "../assets/BlueEye.svg";

  import { createEventDispatcher } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  export let item: any;
  $: booksCount = item.stories.length || 0; // Number of books using this character

  const dispatch = createEventDispatcher();

  // Get character name
  const getCharacterName = () => {
    return item.character_name || "Unnamed Character";
  };

  // Get character type icon
  const getCharacterTypeIcon = () => {
    if (item.character_type === "person") {
      return PersonSimple;
    } else if (item.character_type === "animal") {
      return animal;
    } else if (item.character_type === "magical") {
      return monster;
    }
    return PersonSimple; // default
  };

  // Get character type text
  const getCharacterTypeText = () => {
    if (item.character_type === "person") {
      return "Person";
    } else if (item.character_type === "animal") {
      return "Animal";
    } else if (item.character_type === "magical") {
      return "Magical Creature";
    }
    return "Person"; // default
  };

  // Get special ability text
  const getSpecialAbility = () => {
    return item.special_ability || "No special ability";
  };

  // Get image source
  const getImageSrc = () => {
    // Handle both array and string formats for enhanced_images
    if (typeof item.enhanced_images === 'string' && item.enhanced_images) {
      return item.enhanced_images;
    } else if (item.original_image_url) {
      return item.original_image_url;
    }
    return "https://placehold.co/329x310";
  };

  // Format books count text
  const getBooksCountText = () => {
    if (booksCount === 0) {
      return "Not used in any books";
    } else if (booksCount === 1) {
      return "Used in 1 Book";
    } else {
      return `Used in ${booksCount} Books`;
    }
  };

  // Handle "Use in New Book" button click
  function handleUseInNewBook() {
    if (browser) {
      // Get the character image URL (handle both array and string formats)
      let imageUrl = '';
      if (Array.isArray(item.enhanced_images) && item.enhanced_images.length > 0) {
        imageUrl = item.enhanced_images[0];
      } else if (typeof item.enhanced_images === 'string' && item.enhanced_images) {
        imageUrl = item.enhanced_images;
      } else if (item.original_image_url) {
        imageUrl = item.original_image_url;
      }
      
      // Store character ID in sessionStorage (important for update operation)
      if (item.id) {
        sessionStorage.setItem('characterId', item.id.toString());
      }
      
      // Store character data in sessionStorage for pre-filling the form
      sessionStorage.setItem('prefill_character_image', imageUrl);
      sessionStorage.setItem('prefill_character_name', item.character_name || '');
      sessionStorage.setItem('prefill_character_type', item.character_type || 'person');
      sessionStorage.setItem('prefill_special_ability', item.special_ability || '');
      sessionStorage.setItem('prefill_character_style', item.character_style || '3d');
      
      // Store child profile ID if available
      if (item.child_profile_id) {
        sessionStorage.setItem('prefill_child_profile_id', item.child_profile_id.toString());
      }
      
      // Set a flag to indicate we're pre-filling the form
      sessionStorage.setItem('prefill_character_mode', 'true');
    }
    
    // Navigate to create character page
    goto('/create-character/1');
  }

  // Handle "View Books" button click
  function handleViewBooks() {
    // TODO: Implement navigation to view books using this character
    console.log("View books:", item);
  }

  // Handle "Preview" button click
  function handlePreview() {
    dispatch("preview", item);
  }
</script>

<div class="card">
  <div class="frame-2147227584">
    <div class="frame-2147227588" style="background-image: url('{getImageSrc()}')">
      <div class="frame-2147227590">
        <div class="book">
          <img src={vectorBook} alt="book" class="vector" />
        </div>
        <div><span class="usedin2books_span">{getBooksCountText()}</span></div>
      </div>
    </div>
  </div>
  <div class="frame-10">
    <div class="frame-2147227582">
      <div class="heading">
        <div class="luna"><span class="luna_span">{getCharacterName()}</span></div>
        <div class="frame-2147227591">
          <div class="icons">
            <div class="usercircle">
              <img src={getCharacterTypeIcon()} alt={getCharacterTypeText()} class="vector_01" />
            </div>
            <div><span class="person_span">{getCharacterTypeText()}</span></div>
          </div>
          <div class="rectangle-261"></div>
          <div class="icons_01">
            <div class="sparkle">
              <img src={Star} alt="special ability" class="vector_02" />
            </div>
            <div><span class="canfly_span">{getSpecialAbility()}</span></div>
          </div>
        </div>
      </div>
      <div class="rectangle-261_01"></div>
    </div>
    <div class="frame-2147227589">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="frame-1410104245" on:click={handleUseInNewBook} role="button" tabindex="0">
        <div class="ellipse-1415"></div>
        <div class="use-in-new-book"><span class="useinnewbook_span">Use in New Book</span></div>
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="button" on:click={handlePreview} role="button" tabindex="0">
        <div class="eye">
          <img src={eye} alt="preview" class="vector_03" />
        </div>
        <div class="view-books"><span class="viewbooks_span">Preview</span></div>
      </div>
    </div>
  </div>
</div>

<style>
  .vector {
    width: 13.75px;
    height: 16.25px;
    object-fit: contain;
  }

  .usedin2books_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .luna_span {
    color: #141414;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.60px;
    word-wrap: break-word;
  }

  .luna {
    align-self: stretch;
  }

  .vector_01 {
    width: 16.25px;
    height: 16.25px;
    object-fit: contain;
  }

  .person_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .rectangle-261 {
    width: 1px;
    align-self: stretch;
    background: #EDEDED;
  }

  .vector_02 {
    width: 18.13px;
    height: 18.13px;
    object-fit: contain;
  }

  .canfly_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .rectangle-261_01 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 32px;
    top: 25px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .useinnewbook_span {
    color: white;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .use-in-new-book {
    text-align: center;
  }

  .vector_03 {
    width: 18.75px;
    height: 12.50px;
    object-fit: contain;
  }

  .viewbooks_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .view-books {
    text-align: center;
  }

  .book {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .usercircle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sparkle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104245 {
    align-self: stretch;
    height: 54px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-1410104245:hover {
    opacity: 0.9;
  }

  .frame-1410104245:active {
    opacity: 0.8;
  }

  .eye {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-2147227590 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 10px;
    padding-right: 12px;
    right: 8px;
    top: 8px;
    position: absolute;
    background: white;
    border-radius: 5px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .icons {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .icons_01 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button {
    align-self: stretch;
    height: 49px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .button:hover {
    transform: translateY(-1px);
    box-shadow: 0px 5px 0px #438BFF;
  }

  .button:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .frame-2147227588 {
    flex: 1 1 0;
    height: 310px;
    position: relative;
    background: #F6F6F6;
    overflow: hidden;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
  }

  .frame-2147227591 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-2147227589 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-2147227584 {
    align-self: stretch;
    padding: 8px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .heading {
    align-self: stretch;
    padding-left: 8px;
    padding-right: 8px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-2147227582 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-10 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: flex;
  }

  .card {
    width: 100%;
    height: 100%;
    padding-bottom: 10px;
    background: white;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }
</style>

