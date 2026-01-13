<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import PersonSimple from "../assets/PersonSimple.svg";
  import animal from "../assets/animal.svg";
  import monster from "../assets/monster.svg";
  import Star from "../assets/Star.svg";
  import Palette from "../assets/Palette.svg";
  import CalendarBlank from "../assets/CalendarBlank.svg";
  import Calendar from "../assets/Calendar.svg";
  import BookOpenText from "../assets/BookOpenText.svg";
  import BookOpen from "../assets/BookOpen.svg";
  import Plus from "../assets/Plus.svg";
  import PencilSimple from "../assets/PencilSimple.svg";
  import Trash from "../assets/Trash.svg";
  import X from "../assets/X.svg";
  import logo from "../assets/logo.png";

  export let character: any;

  // Reactive books array that updates when character changes
  $: books = character?.stories || [];

  const dispatch = createEventDispatcher();

  // Get character name
  const getCharacterName = () => {
    return character?.character_name || "Unnamed Character";
  };

  // Get character type icon
  const getCharacterTypeIcon = () => {
    if (character?.character_type === "person") {
      return PersonSimple;
    } else if (character?.character_type === "animal") {
      return animal;
    } else if (character?.character_type === "magical") {
      return monster;
    }
    return PersonSimple;
  };

  // Get character type text
  const getCharacterTypeText = () => {
    if (character?.character_type === "person") {
      return "Person";
    } else if (character?.character_type === "animal") {
      return "Animal";
    } else if (character?.character_type === "magical") {
      return "Magical Creature";
    }
    return "Person";
  };

  // Get special ability text
  const getSpecialAbility = () => {
    return character?.special_ability || "No special ability";
  };

  // Get character style text
  const getCharacterStyle = () => {
    if (character?.character_style === "cartoon") {
      return "Cartoon";
    } else if (character?.character_style === "anime") {
      return "Anime";
    } else if (character?.character_style === "3d") {
      return "3D";
    }
    return "Cartoon";
  };

  // Get image source
  const getImageSrc = () => {
    return character?.enhanced_images || character?.original_image_url || "https://placehold.co/125x127";
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Unknown";
    }
  };

  // Get created date
  const getCreatedDate = () => {
    return formatDate(character?.created_at);
  };

  // Get last used date (most recent book creation date)
  const getLastUsedDate = () => {
    if (books.length === 0) return "Never";
    const dates = books
      .map((book: any) => book.created_at)
      .filter(Boolean)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    return dates.length > 0 ? formatDate(dates[0]) : "Never";
  };

  // Get books count
  const getBooksCount = () => {
    return books.length;
  };

  // Get story mode text
  const getStoryMode = (book: any) => {
    // Determine if it's story_adventure or interactive_search based on available data
    // For now, we'll default to "Story Mode" since the stories table doesn't store format type
    // TODO: Add format_type field to stories table to distinguish between story_adventure and interactive_search
    return "Story Mode";
  };

  // Handle close
  function handleClose() {
    dispatch("close");
  }

  // Handle use in new book
  function handleUseInNewBook() {
    dispatch("useInNewBook", character);
  }

  // Handle edit character
  function handleEditCharacter() {
    dispatch("editCharacter", character);
  }

  // Handle delete character
  function handleDeleteCharacter() {
    dispatch("deleteCharacter", character);
  }

  // Handle book click
  function handleBookClick(book: any) {
    dispatch("bookClick", book);
  }
</script>

<div class="information-helper-text">
  <div class="frame-1410103849">
    <div class="frame-1410103838">
      <div class="logo-text-full">
        <img src={logo} alt="Drawtopia" class="logo-img" />
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="x" on:click={handleClose} role="button" tabindex="0">
        <img src={X} alt="Close" class="vector" />
      </div>
    </div>
    <div class="stroke"></div>
  </div>

  <div class="frame-2147227593">
    <div class="frame-1410103944">
      <div><span class="characterdetails_span">Character Details</span></div>
    </div>
    <div class="card">
      <div class="frame-2147227584">
        <img class="frame-2147227588" src={getImageSrc()} alt={getCharacterName()} />
      </div>
      <div class="heading">
        <div class="frame-2147227594">
          <div><span class="luna_span">{getCharacterName()}</span></div>
          <div class="frame-2147227592">
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
            <div class="rectangle-262"></div>
            <div class="icons_02">
              <div class="paintbrush">
                <img src={Palette} alt="style" class="vector_03" />
              </div>
              <div><span class="cartoon_span">{getCharacterStyle()}</span></div>
            </div>
          </div>
        </div>
        <div class="rectangle-261_01"></div>
        <div class="frame-2147227581">
          <div class="icons_03">
            <div class="calendarplus">
              <img src={CalendarBlank} alt="calendar" class="vector_04" />
            </div>
            <div><span class="createdoct152024_span">Created: {getCreatedDate()}</span></div>
          </div>
          <div class="icons_04">
            <div class="calendardots">
              <img src={Calendar} alt="calendar" class="vector_05" />
            </div>
            <div><span class="lastusednov032024_span">Last Used: {getLastUsedDate()}</span></div>
          </div>
          <div class="icons_05">
            <div class="bookbookmark">
              <img src={BookOpenText} alt="book" class="vector_06" />
            </div>
            <div><span class="featuredin2books_span">Featured in {getBooksCount()} {getBooksCount() === 1 ? 'book' : 'books'}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="rectangle-261_02"></div>

  <div class="frame-2147227595">
    <div class="frame-1410103944_01">
      <div><span class="booksfeaturingluna_span">Books featuring {getCharacterName()}</span></div>
    </div>
    <div class="card_01">
      {#each books as book (book.id)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="frame-2147227596" on:click={() => handleBookClick(book)} role="button" tabindex="0">
          <div class="frame-2147227584_01">
            <img class="frame-2147227588_01" src={book.story_cover || book.original_image_url || "https://placehold.co/224x223"} alt={book.story_title || "Book"} />
          </div>
          <div class="heading_01">
            <div class="frame-2147227594_01">
              <div><span class="theadventureofluna_span">{book.story_title || "Untitled Story"}</span></div>
              <div class="frame-2147227592_01">
                <div class="icons_06">
                  <div class="bookopenuser">
                    <img src={BookOpen} alt="book" class="vector_07" />
                  </div>
                  <div><span class="storymode_span">{getStoryMode(book)}</span></div>
                </div>
              </div>
            </div>
            <div class="rectangle-261_03"></div>
          </div>
        </div>
      {/each}
      {#if books.length === 0}
        <div class="no-books-message">No books found featuring this character</div>
      {/if}
    </div>
  </div>

  <div class="frame-1410103860">
    <div class="frame-2147227580">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="button" on:click={handleUseInNewBook} role="button" tabindex="0">
        <div class="plus">
          <img src={Plus} alt="plus" class="vector_09" />
        </div>
        <div class="use-in-new-book"><span class="useinnewbook_span">Use in New Book</span></div>
        <div class="ellipse-1415"></div>
      </div>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div class="button_01" on:click={handleEditCharacter} role="button" tabindex="0">
        <div class="pencilsimple">
          <img src={PencilSimple} alt="edit" class="vector_10" />
        </div>
        <div class="edit-character"><span class="editcharacter_span">Edit Character</span></div>
      </div>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="button_02" on:click={handleDeleteCharacter} role="button" tabindex="0">
      <div class="trash">
        <img src={Trash} alt="delete" class="vector_11" />
      </div>
      <div class="delete-character"><span class="deletecharacter_span">Delete Character</span></div>
    </div>
  </div>
</div>

<style>
  .logo-img {
    width: 216px;
    height: 40.37px;
    object-fit: contain;
  }

  .vector {
    width: 15px;
    height: 15px;
    object-fit: contain;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #DCDCDC;
  }

  .characterdetails_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .frame-2147227588 {
    width: 125px;
    height: 127px;
    position: relative;
    background: #F6F6F6;
    border-radius: 12px;
    object-fit: cover;
  }

  .luna_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
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
    height: 22px;
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

  .rectangle-262 {
    width: 1px;
    height: 22px;
    background: #EDEDED;
  }

  .vector_03 {
    width: 17.50px;
    height: 15.62px;
    object-fit: contain;
  }

  .cartoon_span {
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

  .vector_04 {
    width: 15px;
    height: 16.25px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .createdoct152024_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .vector_05 {
    width: 15px;
    height: 16.25px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .lastusednov032024_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .vector_06 {
    width: 13.75px;
    height: 16.25px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(43%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(89%);
  }

  .featuredin2books_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .rectangle-261_02 {
    align-self: stretch;
    height: 1px;
    border-top: 1px solid #EDEDED;
  }

  .booksfeaturingluna_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .frame-2147227588_01 {
    flex: 1 1 0;
    height: 223px;
    position: relative;
    background: #F6F6F6;
    border-radius: 12px;
    object-fit: cover;
    width: 100%;
  }

  .theadventureofluna_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .vector_07 {
    width: 17.50px;
    height: 16.88px;
    object-fit: contain;
  }

  .storymode_span {
    color: #141414;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .rectangle-261_03 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .vector_09 {
    width: 15px;
    height: 15px;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .useinnewbook_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .use-in-new-book {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -13px;
    top: 15px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .vector_10 {
    width: 15.62px;
    height: 15.63px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(47%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(101%) contrast(101%);
  }

  .editcharacter_span {
    color: #438BFF;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .edit-character {
    text-align: center;
  }

  .vector_11 {
    width: 18px;
    height: 19.50px;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(20%) sepia(89%) saturate(7151%) hue-rotate(339deg) brightness(95%) contrast(89%);
  }

  .deletecharacter_span {
    color: #DF1C41;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .delete-character {
    text-align: center;
  }

  .frame-1410103944 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103944_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .x {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-2147227584 {
    align-self: stretch;
    padding: 8px;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
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

  .paintbrush {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .calendarplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .calendardots {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .bookbookmark {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-2147227584_01 {
    align-self: stretch;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .bookopenuser {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .plus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pencilsimple {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .trash {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410103838 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .icons {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .icons_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .icons_02 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .icons_03 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .icons_04 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .icons_05 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .icons_06 {
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    position: relative;
    background: #438BFF;
    overflow: hidden;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .button:hover {
    opacity: 0.9;
  }

  .button_01 {
    width: 231px;
    height: 52px;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #E7FEFF;
    box-shadow: 0px 4px 0px #438BFF;
    border-radius: 12px;
    outline: 2px rgba(231, 254, 255, 0.20) solid;
    outline-offset: -2px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .button_01:hover {
    transform: translateY(-1px);
    box-shadow: 0px 5px 0px #438BFF;
  }

  .button_01:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .button_02 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #FFF0F3;
    border-radius: 20px;
    outline: 1px #FFF0F3 solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .button_02:hover {
    background: #FFE5EA;
  }

  .frame-1410103849 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-2147227592 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-2147227581 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 6px;
    display: flex;
  }

  .frame-2147227592_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-2147227580 {
    justify-content: flex-end;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-2147227594 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-2147227594_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103860 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .heading {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .heading_01 {
    width: 224px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .card {
    align-self: stretch;
    background: white;
    border-radius: 20px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .frame-2147227596 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-2147227596:hover {
    opacity: 0.8;
  }

  .frame-2147227593 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .card_01 {
    align-self: stretch;
    background: white;
    border-radius: 20px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
    flex-wrap: wrap;
  }

  .frame-2147227595 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .information-helper-text {
    width: 100%;
    height: 100%;
    padding-top: 16px;
    padding-bottom: 24px;
    padding-left: 16px;
    padding-right: 16px;
    left: 0px;
    top: 0px;
    position: relative;
    background: white;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
    overflow-y: auto;
  }

  .no-books-message {
    padding: 24px;
    text-align: center;
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
  }
</style>

