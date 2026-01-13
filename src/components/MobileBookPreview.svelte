<script lang="ts">
  import ArrowLeft from "../assets/ArrowLeft.svg";
  import userCircle from "../assets/UserCircle.svg";
  import sparkle from "../assets/Sparkle.svg";
  import paintbrush from "../assets/PaintBrush.svg";
  import calendarPlus from "../assets/CalendarPlus.svg";
  import calendarDots from "../assets/CalendarDots.svg";
  import bookBookmark from "../assets/BookBookmark.svg";
  import bookOpenUser from "../assets/BookOpenUser.svg";
  import plusIcon from "../assets/Plus.svg";
  import pencilSimple from "../assets/PencilSimple.svg";
  import trash from "../assets/Trash.svg";
  import animal from "../assets/animal.svg";
  import monster from "../assets/monster.svg";

  import { createEventDispatcher, onMount } from "svelte";

  export let characterName: string = "";
  export let characterData: any = null;
  let books: any[] = characterData?.stories || [];

  onMount(() => {
    // console.log("characterData====================================>", characterData);
  });

  const dispatch = createEventDispatcher();

  // Get book title
  const getBookTitle = (book: any) => {
    return book?.story_title || book?.title || "Untitled Story";
  };

  // Get book image
  const getBookImage = (book: any) => {
    return book?.story_cover || book?.enhanced_images || "https://placehold.co/361x250";
  };

  // Get character avatar
  const getCharacterAvatar = () => {
    return characterData?.enhanced_images || characterData?.original_image_url || "https://placehold.co/80x80";
  };

  // Get story mode (Story Mode or Search Mode)
  const getStoryMode = (book: any) => {
    // Check if it's a search mode book
    if (book?.status === "generating" || book?.book_type === "search" || book?.mode === "search") {
      return "Search Mode";
    }
    return "Story Mode";
  };

  // Format date
  const formatDate = (created_at: any): string => {
    if (!books || books.length === 0) return "Never";
    const dates = books
      .map((book: any) => book.created_at)
      .filter(Boolean)
      .sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    return dates.length > 0 ? new Date(dates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never";
  };

  // Handle book click
  function handleBookClick(book: any) {
    dispatch("bookClick", book);
  }

  // Handle back button click
  function handleBack() {
    dispatch("back");
  }

  // Handle action buttons
  function handleUseInNewBook() {
    dispatch("useInNewBook", characterData);
  }

  function handleEditCharacter() {
    dispatch("editCharacter", characterData);
  }

  function handleDeleteCharacter() {
    dispatch("deleteCharacter", characterData);
  }


    function getCharacterTypeIcon(): string | null | undefined {
        if (characterData?.character_type === "person") {
            return userCircle;
        } else if (characterData?.character_type === "animal") {
            return animal;
        } else if (characterData?.character_type === "magical") {
            return monster;
        }
        return userCircle;
    }
</script>

<div class="sidebar">
  <!-- Back Button -->
  <div class="arrow">
    <div class="button" on:click={handleBack} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleBack()}>
      <div class="arrowleft">
        <img src={ArrowLeft} alt="arrowLeft" class="arrow-left-icon">
      </div>
      <div class="back"><span class="back_span">Back</span></div>
    </div>
  </div>

  <div class="rectangle-42"></div>

  <!-- Character Details Section -->
  <div class="frame-2147227593">
    <div class="frame-1410103944">
      <div><span class="characterdetails_span">Character Details</span></div>
    </div>

    <div class="card">
      <div class="frame-2147227584">
        <img class="frame-2147227588" src={getCharacterAvatar()} alt={characterName} />
      </div>

      <div class="heading">
        <div class="frame-2147227594">
          <div><span class="luna_span">{characterName || "Character"}</span></div>
          <div class="frame-2147227592">
            <div class="icons">
              <div class="usercircle">
                <img src={getCharacterTypeIcon()} alt="userCircle" class="user-circle-icon">
              </div>
              <div><span class="person_span">{characterData?.character_type.charAt(0).toUpperCase() + characterData?.character_type.slice(1)}</span></div>
            </div>
            <div class="rectangle-261"></div>
            <div class="icons_01">
              <div class="sparkle">
                <img src={sparkle} alt="sparkle" class="sparkle-icon">
              </div>
              <div><span class="canfly_span">{characterData?.ability || "Can Fly"}</span></div>
            </div>
            <div class="rectangle-262"></div>
            <div class="icons_02">
              <div class="paintbrush">
                <img src={paintbrush} alt="paintbrush" class="paintbrush-icon">
              </div>
              <div><span class="cartoon_span">{characterData?.style || "Cartoon"}</span></div>
            </div>
          </div>
        </div>

        <div class="rectangle-261_01"></div>

        <div class="frame-2147227581">
          <div class="icons_03">
            <div class="calendarplus">
              <img src={calendarPlus} alt="calendarPlus" class="calendarplus-icon">
            </div>
            <div><span class="createdoct152024_span">Created: {formatDate(characterData?.created_at)}</span></div>
          </div>
          <div class="icons_04">
            <div class="calendardots">
              <img src={calendarDots} alt="calendarDots" class="calendardots-icon">
            </div>
            <div><span class="lastusednov032024_span">Last Used: {formatDate(characterData?.last_used)}</span></div>
          </div>
          <div class="icons_05">
            <div class="bookbookmark">
              <img src={bookBookmark} alt="bookBookmark" class="bookbookmark-icon">
            </div>
            <div><span class="featuredin2books_span">Featured in {books.length} books</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Books Section -->
  <div class="frame-2147227595">
    <div class="frame-1410103944_01">
      <div><span class="booksfeaturingluna_span">Books featuring {characterName || "Character"}</span></div>
    </div>

    <div class="card_01">
      {#each books as book (book.id || book.story_id || book)}
        <div class="frame-2147227596" on:click={() => handleBookClick(book)} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleBookClick(book)}>
          <div class="frame-2147227584_01">
            <img class="frame-2147227588_01" src={getBookImage(book)} alt={getBookTitle(book)} />
          </div>
          <div class="heading_01">
            <div class="frame-2147227594_01">
              <div><span class="theadventureofluna_span">{getBookTitle(book)}</span></div>
              <div class="frame-2147227592_01">
                <div class="icons_06">
                  <div class="bookopenuser">
                    <img src={bookOpenUser} alt="bookOpenUser" class="bookopenuser-icon">
                  </div>
                  <div><span class="storymode_span">{getStoryMode(book)}</span></div>
                </div>
              </div>
            </div>
            <div class="rectangle-261_02"></div>
          </div>
        </div>
      {/each}
      
      {#if books.length === 0}
        <div class="no-books-message">No books found featuring this character</div>
      {/if}
    </div>
  </div>

  <!-- Action Buttons -->
  <div class="frame-1410103860">
    <div class="frame-2147227580">
      <div class="button_01" on:click={handleUseInNewBook} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleUseInNewBook()}>
        <div class="plus">
          <img src={plusIcon} alt="plus" class="plus-icon">
        </div>
        <div class="use-in-new-book"><span class="useinnewbook_span">Use in New Book</span></div>
        <div class="ellipse-1415"></div>
      </div>
      <div class="button_02" on:click={handleEditCharacter} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleEditCharacter()}>
        <div class="pencilsimple">
          <img src={pencilSimple} alt="pencilSimple" class="pencilsimple-icon">
        </div>
        <div class="edit-character"><span class="editcharacter_span">Edit Character</span></div>
      </div>
    </div>
    <div class="button_03" on:click={handleDeleteCharacter} role="button" tabindex="0" on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleDeleteCharacter()}>
      <div class="trash">
        <img src={trash} alt="trash" class="trash-icon">
      </div>
      <div class="delete-character"><span class="deletecharacter_span">Delete Character</span></div>
    </div>
  </div>
</div>

<style>
  .arrow-left-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .sparkle-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .paintbrush-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .calendarplus-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .calendardots-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .bookbookmark-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .bookopenuser-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* Text spans */
  .back_span {
    color: black;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .characterdetails_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .luna_span {
    color: #141414;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .person_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .canfly_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .cartoon_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .createdoct152024_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .lastusednov032024_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .featuredin2books_span {
    color: #727272;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .booksfeaturingluna_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 24px;
    word-wrap: break-word;
  }

  .theadventureofluna_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .storymode_span {
    color: #141414;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .useinnewbook_span {
    color: white;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .editcharacter_span {
    color: #438BFF;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .deletecharacter_span {
    color: #DF1C41;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  /* Layout elements */
  .back {
    text-align: center;
  }

  .use-in-new-book {
    text-align: center;
  }

  .edit-character {
    text-align: center;
  }

  .delete-character {
    text-align: center;
  }

  /* Dividers */
  .rectangle-42 {
    align-self: stretch;
    height: 1px;
    border: 1px #DFE1E7 dotted;
  }

  .rectangle-261 {
    width: 1px;
    height: 22px;
    background: #EDEDED;
  }

  .rectangle-262 {
    width: 1px;
    height: 22px;
    background: #EDEDED;
  }

  .rectangle-261_01 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  .rectangle-261_02 {
    align-self: stretch;
    height: 1px;
    background: #EDEDED;
  }

  /* Images */
  .frame-2147227588 {
    width: 80px;
    height: 80px;
    position: relative;
    background: #F6F6F6;
    border-radius: 12px;
    object-fit: cover;
  }

  .frame-2147227588_01 {
    flex: 1 1 0;
    height: 250px;
    position: relative;
    background: #F6F6F6;
    border-radius: 12px;
    object-fit: cover;
    width: 100%;
  }

  /* Special effects */
  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 57px;
    top: 12px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  /* Icon containers */
  .arrowleft {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .usercircle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .user-circle-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .sparkle {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .paintbrush {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .calendarplus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .calendardots {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .bookbookmark {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .bookopenuser {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .plus {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .plus-icon {
    width: 100%;  
    height: 100%;
    object-fit: contain;
  }

  .pencilsimple {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .pencilsimple-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(45%) sepia(93%) saturate(1352%) hue-rotate(195deg) brightness(101%) contrast(101%);
  }

  .trash {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  /* Buttons */
  .button {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 12px;
    padding-bottom: 12px;
    box-shadow: 0px 0px 0px 2px #EEF6FF;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button:hover {
    background: #f8fafb;
  }

  .button_01 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_01:hover {
    background: #3a7ae4;
  }

  .button_02 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_02:hover {
    background: #d1f9ff;
  }

  .button_03 {
    align-self: stretch;
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
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button_03:hover {
    background: #ffe4ea;
  }

  /* Icon groups */
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

  /* Frame containers */
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

  .frame-2147227584 {
    padding: 8px;
    border-radius: 20px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
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
    overflow: hidden;
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

  .trash-icon {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) saturate(100%) invert(28%) sepia(100%) saturate(2320%) hue-rotate(345deg) brightness(92%) contrast(101%);
  }

  .frame-2147227592_01 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-2147227580 {
    align-self: stretch;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
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
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-2147227596 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .frame-2147227596:hover {
    opacity: 0.8;
  }

  .frame-2147227596:active {
    opacity: 0.7;
  }

  /* Layout sections */
  .arrow {
    align-self: stretch;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 6px;
    padding-bottom: 6px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .heading_01 {
    width: 100%;
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
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
    padding: 16px;
  }

  .card_01 {
    align-self: stretch;
    background: white;
    border-radius: 20px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
    padding: 16px;
  }

  .frame-2147227593 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-2147227595 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .sidebar {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
    padding: 16px;
    background: #fafbfc;
  }

  .no-books-message {
    align-self: stretch;
    padding: 24px;
    text-align: center;
    color: #727272;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
  }
</style>

