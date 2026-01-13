<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import vectorBook from "../assets/vectorBook.svg";
  import vectorSearch from "../assets/vectorSearch.svg";
  import greenCheck from "../assets/GreenCheck.svg";
  import warning from "../assets/RedWarning.svg";
  import spinner from "../assets/Spinner.svg";
  import archieve from "../assets/Archive.svg";
  import whiteEye from "../assets/WhiteEye.svg";
  import arrowclockwise from "../assets/WhiteArrowsClockwise.svg";
  import simplepencil from "../assets/WhitePencilSimple.svg";
  import simpledownload from "../assets/BlackDownloadSimple.svg";
  import simplesharenetwork from "../assets/BlackShareNetwork.svg";
  import { goto } from "$app/navigation";

  export let item: any;
  
  const dispatch = createEventDispatcher();
  
  // Loading state for PDF download
  let isDownloadingPDF = false;

  // Determine the card type/tag based on story_type (fallback to status)
  const getCardType = () => {
    const storyType = (item?.story_type || "").toLowerCase();
    if (storyType === "search") return "search";
    if (storyType === "story") return "story";

    // Legacy fallback: mimic previous status-based behavior
    if (item?.status === "generating") return "search";
    return "story";
  };

  const cardType = getCardType();

  // Get status icon and text
  const getStatusInfo = () => {
    if (item?.status === "completed") {
      return { icon: greenCheck, text: "Completed" };
    }
    if (item?.status === "failed") {
      return { icon: warning, text: "Failed" };
    }
    if (item?.status === "generating") {
      return { icon: spinner, text: "Generating 45%" };
    }
    return { icon: archieve, text: "Draft" };
  };

  const statusInfo = getStatusInfo();

  // Get status badge class
  const getStatusBadgeClass = () => {
    if (item?.status === "completed") return "status-completed";
    if (item?.status === "failed") return "status-failed";
    if (item?.status === "generating") return "status-generating";
    return "status-draft";
  };

  const statusBadgeClass = getStatusBadgeClass();

  // Get action button info
  const getActionButton = () => {
    if (item?.status === "completed") {
      return { icon: whiteEye, text: "View Book" };
    }
    if (item?.status === "failed") {
      return { icon: arrowclockwise, text: "Re-generate Book" };
    }
    if (item?.status === "generating") {
      return { icon: whiteEye, text: "View Book" };
    }
    return { icon: simplepencil, text: "Edit Book" };
  };

  const actionButton = getActionButton();

  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "Unknown";
    try {
      const d = typeof date === "string" ? new Date(date) : date;
      // Check if date is valid
      if (isNaN(d.getTime())) return "Unknown";
      return d.toLocaleDateString("en-GB");
    } catch {
      return "Unknown";
    }
  };

  // Get image source
  const getImageSrc = () => {
    return item?.story_cover || item?.original_image_url || vectorBook;
  };

  // Get title
  const getTitle = () => {
    return item?.title || item?.story_title || "Untitled Story";
  };

  // Get created by
  const getCreatedBy = () => {
    return item?.user_name || item?.child_profiles?.first_name || "Unknown";
  };

  // Get created date
  const getCreatedDate = () => {
    // Prefer created_at (raw date) over createdDate (pre-formatted string)
    return formatDate(item?.created_at || item?.createdDate);
  };

  // Handle view book button click
  const handleViewBook = () => {
    if (item?.status === "completed" || item?.status === "generating") {
      dispatch("viewBook", item);
    }
    if (item?.story_type === "search") {
      goto(`/intersearch/1?storyId=${item?.uid}`);
    }
    if (item?.story_type === "story") {
      // Pass the story ID to the preview page
      console.log('[BookCard] Viewing book with ID:', item);
      goto(`/preview/default?storyId=${item?.uid}`);
    }
  };

  // Handle download PDF button click
  const handleDownloadPDF = async (event?: MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Prevent multiple simultaneous downloads
    if (isDownloadingPDF) {
      console.log('[BookCard] PDF download already in progress...');
      return;
    }
    
    // Get book ID - try uid first (as per user's changes), then id
    // Convert to string to ensure consistency
    let bookId: string = "";
    if (item?.uid) {
      bookId = String(item.uid);
    } else if (item?.id) {
      bookId = String(item.id);
    }
    
    console.log('[BookCard] Download button clicked');
    console.log('[BookCard] Item keys:', Object.keys(item || {}));
    console.log('[BookCard] Item.uid:', item?.uid);
    console.log('[BookCard] Item.id:', item?.id);
    console.log('[BookCard] Extracted bookId:', bookId);
    
    if (!bookId || bookId === "undefined" || bookId === "null") {
      console.error("[BookCard] Book ID not found in item:", item);
      alert("Unable to find book ID. Please check the console for details.");
      return;
    }
    
    isDownloadingPDF = true;
    console.log(`[BookCard] Starting PDF generation for book ID: ${bookId}`);
    console.log(`[BookCard] Item data:`, { 
      uid: item?.uid, 
      id: item?.id, 
      title: item?.title || item?.story_title,
      status: item?.status 
    });
    
    try {
      // Determine backend URL
      let backendUrl = 'https://drawtopia-backend.vercel.app';
      
      // Check if VITE_API_BASE_URL is set
      if (import.meta.env.VITE_API_BASE_URL) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        // Remove /api suffix if present
        backendUrl = apiBaseUrl.replace('/api', '').replace(/\/$/, '');
      }
      
      const endpoint = `${backendUrl}/api/books/${encodeURIComponent(bookId)}/generate-pdf`;
      console.log(`[BookCard] Calling backend endpoint: ${endpoint}`);
      
      // Call backend endpoint to generate PDF
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`[BookCard] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
          console.error(`[BookCard] Error response:`, errorData);
        } catch (parseError) {
          const errorText = await response.text().catch(() => '');
          console.error(`[BookCard] Error response (text):`, errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log(`[BookCard] PDF generation result:`, result);
      
      if (!result.success) {
        throw new Error(result.message || 'PDF generation failed');
      }
      
      if (!result.pdf_url) {
        throw new Error('PDF URL not returned from server');
      }

      // Download the PDF file
      const pdfUrl = result.pdf_url;
      console.log(`[BookCard] PDF URL received: ${pdfUrl}`);
      
      // Try to download the PDF
      try {
        // Method 1: Direct download via anchor tag
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${(item.title || item.story_title || 'book').replace(/[^a-z0-9]/gi, '_')}_${bookId}.pdf`;
        link.target = '_blank'; // Open in new tab as fallback
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        console.log('[BookCard] PDF download initiated successfully');
      } catch (downloadError) {
        console.warn('[BookCard] Direct download failed, trying alternative method:', downloadError);
        
        // Method 2: Fetch and download as blob (fallback)
        try {
          const pdfResponse = await fetch(pdfUrl);
          if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
          }
          
          const blob = await pdfResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${(item.title || item.story_title || 'book').replace(/[^a-z0-9]/gi, '_')}_${bookId}.pdf`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 100);
          
          console.log('[BookCard] PDF downloaded via blob method');
        } catch (blobError) {
          console.error('[BookCard] Blob download also failed:', blobError);
          // Last resort: open in new tab
          window.open(pdfUrl, '_blank');
          console.log('[BookCard] PDF opened in new tab as fallback');
        }
      }
    } catch (error) {
      console.error('[BookCard] Error downloading PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to download PDF:\n${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      isDownloadingPDF = false;
    }
  };
</script>

<div class="cardd">
  <div class="image" style="background-image: url({getImageSrc()})">
    <div class="frame-1410103869">
      <div class="book">
        <img
          src={cardType === "search" ? vectorSearch : vectorBook}
          alt={cardType === "search" ? "Search icon" : "Story icon"}
        />
      </div>
      <div class="sub-menu">
        <div class="story">
          <span class="story_span">{cardType === "search" ? "Search" : "Story"}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="emmas-magical-forest-adventure">
    <span class="emmasmagicalforestadventure_span">{getTitle()}</span>
  </div>
  <div class="frame-1410104158">
    <div class="frame-1410104124">
      <div><span class="createddate_span">Created Date:</span></div>
      <div><span class="f1302024_span">{getCreatedDate()}</span></div>
    </div>
    <div class="frame-1410104125">
      <div><span class="createby_span">Create By</span></div>
      <div class="frame-1410103850">
        <img class="ellipse" src="https://placehold.co/20x20" alt="Avatar" />
        <div class="form">
          <div><span class="mazda_span">{getCreatedBy()}</span></div>
        </div>
      </div>
    </div>
    <div class="frame-1410104126">
      <div><span class="status_span">Status</span></div>
      <div class="frame-1410103870 {statusBadgeClass}">
        <div class="archive">
          <img src={statusInfo.icon} alt={statusInfo.text} class="status-icon" />
        </div>
        <div class="sub-menu_01">
          <div class="draft">
            <span class="draft_span">{statusInfo.text}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="rectangle-263"></div>
  <div class="frame-1410104166">
    <div 
      class="frame-1410104245"
      on:click={handleViewBook}
      on:keydown={(e) => (e.key === "Enter" || e.key === " ") && handleViewBook()}
      role="button"
      tabindex="0"
    >
      <div class="ellipse-1415"></div>
      <div class="pencilsimple">
        <img src={actionButton.icon} alt={actionButton.text} class="action-icon" />
      </div>
      <div class="edit-book">
        <span class="editbook_span">{actionButton.text}</span>
      </div>
    </div>
    <div 
      class="button"
      class:downloading={isDownloadingPDF}
      on:click|stopPropagation={handleDownloadPDF}
      on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleDownloadPDF();
        }
      }}
      role="button"
      tabindex="0"
      title={isDownloadingPDF ? "Generating PDF..." : "Download PDF"}
      style={isDownloadingPDF ? "opacity: 0.6; cursor: wait;" : ""}
    >
      <div class="downloadsimple">
        {#if isDownloadingPDF}
          <div class="loading-spinner-small"></div>
        {:else}
          <img src={simpledownload} alt="download" class="icon-img" />
        {/if}
      </div>
    </div>
    <div 
      class="button_01"
      on:click={() => dispatch('share', item)}
      on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && dispatch('share', item)}
      role="button"
      tabindex="0"
    >
      <div class="sharenetwork">
        <img src={simplesharenetwork} alt="share" class="icon-img" />
      </div>
    </div>
  </div>
</div>

<style>
  .vector {
    width: 11px;
    height: 13px;
    left: 2.5px;
    top: 1.5px;
    position: absolute;
    background: #438bff;
  }

  .story_span {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .story {
    text-align: center;
  }

  .emmasmagicalforestadventure_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .emmas-magical-forest-adventure {
    align-self: stretch;
  }

  .createddate_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .f1302024_span {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .createby_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ellipse {
    width: 20px;
    height: 20px;
    background: #727272;
    border-radius: 9999px;
    object-fit: cover;
  }

  .mazda_span {
    color: #141414;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .status_span {
    color: #727272;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .status-icon {
    width: 14.5px;
    height: 10.5px;
    object-fit: contain;
  }

  .draft_span {
    color: #ffbe4c;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .draft {
    text-align: center;
  }

  .rectangle-263 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: -18px;
    top: 15px;
    position: absolute;
    background: radial-gradient(
      ellipse 42.11% 42.11% at 50% 52.94%,
      white 0%,
      rgba(255, 255, 255, 0) 100%
    );
    border-radius: 9999px;
  }

  .action-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .editbook_span {
    color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .edit-book {
    text-align: center;
  }

  .icon-img {
    width: 13.5px;
    height: 13.5px;
    object-fit: contain;
  }

  .sharenetwork .icon-img {
    width: 13.5px;
    height: 15.75px;
  }

  .sub-menu {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104124 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .form {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: inline-flex;
  }

  .sub-menu_01 {
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .book {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .archive {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pencilsimple {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .downloadsimple {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sharenetwork {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410103850 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103869 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: white;
    border-radius: 12px;
    outline: 1px #438bff solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  .frame-1410103870 {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 14px;
    padding-right: 16px;
    background: #fff6e0;
    border-radius: 12px;
    outline: 1px #ffbe4c solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: flex;
  }

  /* Status-specific styling */
  .frame-1410103870.status-completed {
    background: #e8f5e9;
    outline: 1px #4caf50 solid;
  }

  .frame-1410103870.status-completed .draft_span {
    color: #4caf50;
  }

  .frame-1410103870.status-failed {
    background: #ffebee;
    outline: 1px #f44336 solid;
  }

  .frame-1410103870.status-failed .draft_span {
    color: #f44336;
  }

  .frame-1410103870.status-generating {
    background: #e3f2fd;
    outline: 1px #2196f3 solid;
  }

  .frame-1410103870.status-generating .draft_span {
    color: #2196f3;
  }

  .frame-1410103870.status-draft {
    background: #fff6e0;
    outline: 1px #ffbe4c solid;
  }

  .frame-1410103870.status-draft .draft_span {
    color: #ffbe4c;
  }

  .frame-1410104245 {
    flex: 1 1 0;
    padding-left: 20px;
    padding-right: 20px;
    padding-top: 12px;
    padding-bottom: 12px;
    position: relative;
    background: #438bff;
    overflow: hidden;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: flex;
    cursor: pointer;
  }

  .button {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
  }

  .button_01 {
    width: 44px;
    height: 44px;
    padding: 10px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: flex;
    cursor: pointer;
    transition: background-color 0.2s ease, outline-color 0.2s ease, transform 0.1s ease;
  }

  .button_01:hover {
    background-color: #f5f5f5;
    outline-color: #438bff;
  }

  .button_01:active {
    transform: scale(0.95);
  }

  .frame-1410104125 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .image {
    align-self: stretch;
    height: 400px;
    padding: 8px;
    background: #fbfbfb;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #d3d3d3 solid;
    outline-offset: -1px;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104126 {
    align-self: stretch;
    height: 38px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }

  .frame-1410104166 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 6px;
    display: inline-flex;
  }

  .frame-1410104158 {
    align-self: stretch;
    padding-left: 4px;
    padding-right: 4px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .cardd {
    width: 100%;
    height: 100%;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: inline-flex;
  }

  .button.downloading {
    pointer-events: none;
  }

  .loading-spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #438bff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
