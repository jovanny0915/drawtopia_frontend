<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import QRCode from 'qrcode';
  import x from "../assets/X.svg";
  import download from "../assets/DownloadSimple.svg";
  import caretright from "../assets/CaretDown.svg";
  import video from "../assets/Video.svg";
  import trash from "../assets/Trash.svg";

  const dispatch = createEventDispatcher();

  // Props
  export let storyId: string = "";
  export let storyTitle: string = "Story";

  let isDownloadingPDF = false;
  let isDeletingStory = false;
  let qrCodeDataUrl: string = "";
  let isLoadingQR = true;
  let pdfUrl: string = "";

  // Generate QR code when component mounts
  onMount(async () => {
    if (storyId) {
      await fetchPDFUrlAndGenerateQR();
    }
  });

  // Fetch PDF URL and generate QR code
  async function fetchPDFUrlAndGenerateQR() {
    try {
      isLoadingQR = true;
      console.log(`[StoryInfoModal] Fetching PDF URL for story ID: ${storyId}`);
      
      // Call backend API to get or generate PDF URL
      const apiUrl = `https://drawtopia-backend.vercel.app/api/books/${storyId}/generate-pdf`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF URL: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.pdf_url) {
        pdfUrl = result.pdf_url;
        console.log(`[StoryInfoModal] PDF URL received: ${pdfUrl}`);
        
        // Generate QR code from PDF URL
        qrCodeDataUrl = await QRCode.toDataURL(pdfUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        console.log('[StoryInfoModal] QR code generated successfully');
      } else {
        throw new Error('PDF URL not available');
      }
    } catch (error) {
      console.error('[StoryInfoModal] Error generating QR code:', error);
      // Generate a fallback QR code with a placeholder message
      try {
        qrCodeDataUrl = await QRCode.toDataURL('Story PDF not available', {
          width: 200,
          margin: 1,
        });
      } catch (qrError) {
        console.error('[StoryInfoModal] Failed to generate fallback QR code:', qrError);
      }
    } finally {
      isLoadingQR = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }

  function handleOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Handle download PDF button click
  const handleDownloadPDF = async (event?: MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Prevent multiple simultaneous downloads
    if (isDownloadingPDF) {
      console.log('[StoryInfoModal] PDF download already in progress...');
      return;
    }
    
    if (!storyId) {
      console.error("[StoryInfoModal] Story ID not provided");
      alert("Unable to download story. Story ID is missing.");
      return;
    }
    
    isDownloadingPDF = true;
    
    try {
      // Use cached PDF URL if available, otherwise fetch it
      let downloadPdfUrl = pdfUrl;
      
      if (!downloadPdfUrl) {
        console.log(`[StoryInfoModal] Requesting PDF generation for story ID: ${storyId}`);
        
        // Call backend API to generate PDF
        const apiUrl = `https://drawtopia-backend.vercel.app/api/books/${storyId}/generate-pdf`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`[StoryInfoModal] Response status: ${response.status}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[StoryInfoModal] Server returned error: ${errorText}`);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('[StoryInfoModal] Server response:', result);
        
        if (!result.success) {
          throw new Error(result.message || 'PDF generation failed');
        }
        
        if (!result.pdf_url) {
          throw new Error('PDF URL not returned from server');
        }
        
        downloadPdfUrl = result.pdf_url;
      }
      
      console.log(`[StoryInfoModal] PDF URL: ${downloadPdfUrl}`);
      
      // Try to download the PDF
      try {
        // Method 1: Direct download via anchor tag
        const link = document.createElement('a');
        link.href = downloadPdfUrl;
        link.download = `${storyTitle.replace(/[^a-z0-9]/gi, '_')}_${storyId}.pdf`;
        link.target = '_blank'; // Open in new tab as fallback
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        console.log('[StoryInfoModal] PDF download initiated successfully');
      } catch (downloadError) {
        console.warn('[StoryInfoModal] Direct download failed, trying alternative method:', downloadError);
        
        // Method 2: Fetch and download as blob (fallback)
        try {
          const pdfResponse = await fetch(downloadPdfUrl);
          if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
          }
          
          const blob = await pdfResponse.blob();
          const blobUrl = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${storyTitle.replace(/[^a-z0-9]/gi, '_')}_${storyId}.pdf`;
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
          }, 100);
          
          console.log('[StoryInfoModal] PDF downloaded via blob method');
        } catch (blobError) {
          console.error('[StoryInfoModal] Blob download also failed:', blobError);
          // Last resort: open in new window
          window.open(downloadPdfUrl, '_blank');
        }
      }
      
    } catch (error) {
      console.error('[StoryInfoModal] Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isDownloadingPDF = false;
    }
  };

  // Handle delete story button click
  const handleDeleteStory = async (event?: MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Prevent multiple simultaneous deletions
    if (isDeletingStory) {
      console.log('[StoryInfoModal] Story deletion already in progress...');
      return;
    }
    
    if (!storyId) {
      console.error("[StoryInfoModal] Story ID not provided");
      alert("Unable to delete story. Story ID is missing.");
      return;
    }
    
    // Confirmation dialog
    const confirmDelete = confirm(
      `Are you sure you want to delete "${storyTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmDelete) {
      return; // User cancelled
    }
    
    isDeletingStory = true;
    
    try {
      console.log(`[StoryInfoModal] Requesting deletion for story ID: ${storyId}`);
      
      // Call backend API to delete story
      const apiUrl = `https://drawtopia-backend.vercel.app/api/books/${storyId}`;
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`[StoryInfoModal] Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[StoryInfoModal] Server returned error: ${errorText}`);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[StoryInfoModal] Server response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Story deletion failed');
      }
      
      // Success! Show confirmation and dispatch event
      alert(`Story "${storyTitle}" has been deleted successfully.`);
      
      // Dispatch delete event so parent can handle navigation
      dispatch('delete', { storyId });
      
      // Close the modal
      handleClose();
      
    } catch (error) {
      console.error('[StoryInfoModal] Error deleting story:', error);
      alert(`Failed to delete story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      isDeletingStory = false;
    }
  };
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" on:click={handleOverlayClick}>
  <div class="modal-box">
    <div class="information-helper-text">
      <div class="frame-1410103845">
        <div class="frame-1410103839">
          <div class="logo-text-full">
            <div class="logo-img"></div>
          </div>
          <img 
            class="x" 
            src={x} 
            alt="x" 
            on:click={handleClose}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClose()}
            role="button"
            tabindex="0"
          />
        </div>
        <div class="stroke"></div>
      </div>
      <div class="frame-1410103944">
        <div><span class="storyinformation_span">Story Information</span></div>
      </div>
      <div class="qr-code-container">
        {#if isLoadingQR}
          <div class="qr-loading">
            <div class="spinner"></div>
            <span class="loading-text">Generating QR Code...</span>
          </div>
        {:else if qrCodeDataUrl}
          <img class="image-7" src={qrCodeDataUrl} alt="Story QR Code" />
          <span class="qr-label">Scan to access story PDF</span>
        {:else}
          <div class="qr-error">
            <span>QR Code unavailable</span>
          </div>
        {/if}
      </div>
      <div class="checklist-container">
        <div 
          class="checklist"
          class:downloading={isDownloadingPDF}
          role="button"
          tabindex="0"
          on:click={handleDownloadPDF}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDownloadPDF()}
        >
          <div class="frame-1410104186">
            <div class="check">
              <img src={download} alt="download" />
            </div>
            <div class="download-story">
              <span class="downloadstory_span">
                {isDownloadingPDF ? 'Downloading...' : 'Download Story'}
              </span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
        <div class="checklist_01">
          <div class="frame-1410104186_01">
            <div class="check_01">
              <img src={video} alt="video" />
            </div>
            <div class="preview-record-video">
              <span class="previewrecordvideo_span">Preview Record Video</span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
        <div 
          class="checklist_02"
          class:deleting={isDeletingStory}
          role="button"
          tabindex="0"
          on:click={handleDeleteStory}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && handleDeleteStory()}
        >
          <div class="frame-1410104187">
            <div class="check_02">
              <img src={trash} alt="trash" />
            </div>
            <div class="delete-story">
              <span class="deletestory_span">
                {isDeletingStory ? 'Deleting...' : 'Delete Story'}
              </span>
            </div>
          </div>
          <div class="caretright">
            <img src={caretright} alt="caretright" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-box {
    position: relative;
    width: 100%;
    max-width: 640px;
  }

  .stroke {
    align-self: stretch;
    height: 1px;
    background: #dcdcdc;
  }

  .storyinformation_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .qr-code-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 174px;
  }

  .image-7 {
    width: 170px;
    height: 170px;
    border-radius: 8px;
    border: 1px solid #ededed;
    padding: 4px;
    background: white;
  }

  .qr-label {
    color: #666;
    font-size: 12px;
    font-family: Nunito;
    font-weight: 400;
    text-align: center;
  }

  .qr-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .loading-text {
    color: #666;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
  }

  .qr-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 170px;
    height: 170px;
    border: 1px dashed #dcdcdc;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .qr-error span {
    color: #999;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
  }

  .downloadstory_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .download-story {
    text-align: center;
  }

  .previewrecordvideo_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .preview-record-video {
    text-align: center;
  }

  .deletestory_span {
    color: #121212;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .delete-story {
    text-align: center;
  }

  .frame-1410103944 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .logo-text-full {
    width: 216px;
    height: 40.37px;
    position: relative;
  }

  .x {
    width: 24px;
    height: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .x:hover {
    transform: scale(1.1);
    opacity: 0.7;
  }

  .x:active {
    transform: scale(0.95);
    opacity: 0.5;
  }

  .caretright {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
    transform: rotate(-90deg);
  }

  .frame-1410103839 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .check {
    padding: 7px;
    background: #438bff;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .check_01 {
    padding: 7px;
    background: #438bff;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .check_02 {
    padding: 7px;
    background: #df1c41;
    overflow: hidden;
    border-radius: 99999px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410103845 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
    display: flex;
  }

  .frame-1410104186 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104186_01 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410104187 {
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .checklist {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .checklist:hover {
    background: #f5f9ff;
    outline: 1px #438bff solid;
    transform: translateX(4px);
  }

  .checklist:active {
    background: #eef6ff;
    transform: translateX(2px);
  }

  .checklist.downloading {
    opacity: 0.6;
    pointer-events: none;
  }

  .checklist_01 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .checklist_01:hover {
    background: #f5f9ff;
    outline: 1px #438bff solid;
    transform: translateX(4px);
  }

  .checklist_01:active {
    background: #eef6ff;
    transform: translateX(2px);
  }

  .checklist_02 {
    align-self: stretch;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 12px;
    padding-right: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .checklist_02:hover {
    background: #fff5f7;
    outline: 1px #df1c41 solid;
    transform: translateX(4px);
  }

  .checklist_02:active {
    background: #ffe5ea;
    transform: translateX(2px);
  }

  .checklist_02.deleting {
    opacity: 0.6;
    pointer-events: none;
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
    padding: 16px;
    position: relative;
    background: #fdfdfd;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 24px;
    max-height: 90vh;
    overflow: auto;
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
