<script lang="ts">
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import PrimaryInput from "./PrimaryInput.svelte";
  import { uploadAvatar } from "../lib/storage";
  import { onMount, onDestroy } from "svelte";
  import floppydisk from "../assets/BlueFloppyDisk.svg";

  // Props
  export let userId: string | undefined = undefined;
  export let initialFirstName: string = "";
  export let initialAgeGroup: string = "";
  export let initialRelationship: string = "parent";
  export let initialAvatarUrl: string | null = null;
  export let onSave: ((data: {
    firstName: string;
    ageGroup: string;
    relationship: string;
    avatarUrl: string | null;
  }) => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;

  // Form state
  let firstName = initialFirstName;
  let selectedAgeGroup = initialAgeGroup;
  let selectedRelationship = initialRelationship;
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = initialAvatarUrl;
  let uploadedAvatarUrl: string | null = initialAvatarUrl;
  let fileInput: HTMLInputElement;
  let uploading = false;
  let uploadError = "";
  let isDragOver = false;

  // Errors
  let errors = {
    firstName: "",
    ageGroup: "",
    relationship: "",
  };

  // Update form when initial values change
  $: firstName = initialFirstName;
  $: selectedAgeGroup = initialAgeGroup;
  $: selectedRelationship = initialRelationship;
  $: {
    if (initialAvatarUrl !== null && initialAvatarUrl !== undefined) {
      imagePreviewUrl = initialAvatarUrl;
      uploadedAvatarUrl = initialAvatarUrl;
    }
  }

  const handleImageUpload = () => {
    fileInput.click();
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const dropZone = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node;
    if (!dropZone.contains(relatedTarget)) {
      isDragOver = false;
    }
  };

  const handleDrop = async (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await processImageFile(file);
      } else {
        uploadError = "Please drop an image file (JPEG, PNG, WebP)";
      }
    } else {
      uploadError = "No files were dropped. Please try again.";
    }
  };

  const processImageFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      uploadError = "Please select a valid image file";
      return;
    }

    selectedImage = file;
    uploadError = "";

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreviewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    if (!userId) {
      uploadError = "User not authenticated. Please log in to upload images.";
      return;
    }

    uploading = true;
    try {
      const result = await uploadAvatar(file, userId);

      if (result.success && result.url) {
        uploadedAvatarUrl = result.url;
        console.log("Avatar uploaded successfully:", result.url);
      } else {
        uploadError = result.error || "Failed to upload avatar";
        console.error("Upload failed:", result.error);
      }
    } catch (error) {
      uploadError = "An error occurred while uploading";
      console.error("Upload error:", error);
    } finally {
      uploading = false;
    }
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      await processImageFile(file);
    }
  };

  const removeImage = () => {
    selectedImage = null;
    imagePreviewUrl = null;
    uploadedAvatarUrl = null;
    uploadError = "";
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    let isValid = true;
    errors = {
      firstName: "",
      ageGroup: "",
      relationship: "",
    };

    if (!firstName.trim()) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    if (!selectedAgeGroup) {
      errors.ageGroup = "Age group is required";
      isValid = false;
    }

    if (!selectedRelationship) {
      errors.relationship = "Relationship is required";
      isValid = false;
    }

    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    if (onSave) {
      onSave({
        firstName: firstName.trim(),
        ageGroup: selectedAgeGroup,
        relationship: selectedRelationship,
        avatarUrl: uploadedAvatarUrl,
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Prevent default drag behavior on the entire window
  const preventDefaultDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  onMount(() => {
    window.addEventListener("dragover", preventDefaultDrag);
    window.addEventListener("drop", preventDefaultDrag);
  });

  onDestroy(() => {
    window.removeEventListener("dragover", preventDefaultDrag);
    window.removeEventListener("drop", preventDefaultDrag);
  });
</script>

<div class="frame-10">
  <div class="personal-information">
    <span class="personalinformation_span">Personal Information</span>
  </div>

  <div class="frame-1410103935">
    <div class="frame-1410103851">
      <div class="form">
        <div class="upload-your-child-photo">
          <span class="uploadyourchildphoto_span">Upload Your Child Photo</span>
        </div>
        <div class="image" style="cursor: pointer;">
          {#if imagePreviewUrl}
            <div class="image-preview">
              <img src={imagePreviewUrl} alt="Child photo" class="frame-1410103999" />
              {#if uploading}
                <div class="upload-status">
                  <div class="spinner"></div>
                  <span>Uploading...</span>
                </div>
              {/if}
              <div class="frame-1410104000">
                <div class="x" on:click={removeImage} role="button" tabindex="0" on:keydown={(e) => e.key === "Enter" && removeImage()}>
                  <div class="vector"></div>
                </div>
              </div>
            </div>
          {:else}
            <div
              class="frame-1410103822"
              class:drag-over={isDragOver}
              on:click={handleImageUpload}
              on:keydown={(e) => e.key === "Enter" && handleImageUpload()}
              on:dragover={handleDragOver}
              on:dragleave={handleDragLeave}
              on:drop={handleDrop}
              role="button"
              tabindex="0"
            >
              <div class="uploadsimple">
                <div class="vector_01"></div>
              </div>
              <div class="frame-1410103823">
                <div class="click-to-upload-or-drag-and-drop">
                  <span class="clicktouploadordraganddrop_span">
                    {#if isDragOver}
                      Drop your image here
                    {:else}
                      Click to upload or drag and drop
                    {/if}
                  </span>
                </div>
                <div class="png-jpg-gif-up-to-5mb">
                  <span class="pngjpggifupto5mb_span">PNG, JPG, WebP Up to 5MB</span>
                </div>
              </div>
            </div>
          {/if}
          <!-- Hidden file input -->
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            bind:this={fileInput}
            on:change={handleFileSelect}
            style="display: none;"
          />
        </div>
        {#if uploadError}
          <div class="error-message">{uploadError}</div>
        {/if}
      </div>
    </div>

    <div class="frame-1410103850">
      <div class="form_01">
        <div class="childs-first-name">
          <span class="childsfirstname_span">Child's First Name*</span>
        </div>
        <div class="input-placeholder">
          <PrimaryInput
            type="firstName"
            placeholder="Enter your child's first name"
            disabled={false}
            bind:value={firstName}
            {errors}
          />
        </div>
        {#if errors.firstName}
          <div class="error-message">{errors.firstName}</div>
        {/if}
      </div>
    </div>

    <div class="form_02">
      <div class="age-group">
        <span class="agegroup_span">Age Group*</span>
      </div>
      <div class="input-placeholder_01">
        <AdvancedSelect
          options={[
            { value: "0-2", label: "👶 Ages 0-2 (tiny - Explorers)" },
            { value: "3-6", label: "👧 Ages 3-6 (Early Readers)" },
            { value: "7-10", label: "👦 Ages 7-10 (Developing Readers)" },
            { value: "11-12", label: "👦🏽 Ages 11-12 (Independent Readers)" },
          ]}
          bind:selectedOption={selectedAgeGroup}
          onChange={() => {}}
        />
      </div>
      {#if errors.ageGroup}
        <div class="error-message">{errors.ageGroup}</div>
      {/if}
    </div>

    {#if selectedAgeGroup === "11-12"}
      <div class="title">
        <div class="frame-1410104017">
          <div class="complex-sentences-12-15-words">
            <span class="complexsentences12-15words_span">Complex sentences (12-15 words)</span>
          </div>
          <div class="rich-vocabulary-and-themes">
            <span class="richvocabularyandthemes_span">Rich vocabulary and themes</span>
          </div>
          <div class="interactive-search-hard-difficulty">
            <span class="interactivesearchharddifficulty_span"> Interactive Search: Hard difficulty</span>
          </div>
          <div class="story-300-400-words-total">
            <span class="story300-400wordstotal_span">Story: 300-400 words total</span>
          </div>
        </div>
      </div>
    {/if}

    <div class="form_03">
      <div class="your-relationship">
        <span class="yourrelationship_span">Your relationship*</span>
      </div>
      <div class="input-placeholder_02">
        <AdvancedSelect
          options={[
            { value: "parent", label: "Parent" },
            { value: "aunt_uncle", label: "Aunt/Uncle" },
            { value: "grandparent", label: "Grandparent" },
            { value: "sibling", label: "Sibling" },
            { value: "cousin", label: "Cousin" },
            { value: "family_friend", label: "Family Friend" },
            { value: "guardian", label: "Guardian" },
          ]}
          bind:selectedOption={selectedRelationship}
          onChange={() => {}}
        />
      </div>
      {#if errors.relationship}
        <div class="error-message">{errors.relationship}</div>
      {/if}
    </div>
  </div>

  <div class="frame-1410103992">
    <div class="button" on:click={handleSave} role="button" tabindex="0" on:keydown={(e) => e.key === "Enter" && handleSave()}>
      <div class="floppydisk">
        <img src={floppydisk} alt="floppy disk" />
      </div>
      <div class="save-child">
        <span class="savechild_span">Save Child</span>
      </div>
    </div>
    <div class="frame-1410104245" on:click={handleCancel} role="button" tabindex="0" on:keydown={(e) => e.key === "Enter" && handleCancel()}>
      <div class="cancel">
        <span class="cancel_span">Cancel</span>
      </div>
      <div class="ellipse-1415"></div>
    </div>
  </div>
</div>

<style>
  .personalinformation_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28.80px;
    word-wrap: break-word;
  }

  .personal-information {
    align-self: stretch;
  }

  .uploadyourchildphoto_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .upload-your-child-photo {
    align-self: stretch;
  }

  .vector {
    width: 8.75px;
    height: 8.75px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
  }

  .vector::before,
  .vector::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 10px;
    height: 1.5px;
    background: black;
  }

  .vector::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .vector::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  .frame-1410103999 {
    width: 132px;
    height: 150px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    border-radius: 12px;
    object-fit: cover;
  }

  .childsfirstname_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .childs-first-name {
    align-self: stretch;
  }

  .mazda_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .agegroup_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .age-group {
    align-self: stretch;
  }

  .ages11-12independentreaders_span {
    color: #121212;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .vector_01 {
    width: 24px;
    height: 24px;
    left: 4px;
    top: 3px;
    position: absolute;
    background-image: url("../assets/upload-icon.svg");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }

  .complexsentences12-15words_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .complex-sentences-12-15-words {
    align-self: stretch;
  }

  .richvocabularyandthemes_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .rich-vocabulary-and-themes {
    align-self: stretch;
  }

  .interactivesearchharddifficulty_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .interactive-search-hard-difficulty {
    align-self: stretch;
  }

  .story300-400wordstotal_span {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .story-300-400-words-total {
    align-self: stretch;
  }

  .yourrelationship_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .your-relationship {
    align-self: stretch;
  }

  .parent_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .vector_02 {
    width: 13.75px;
    height: 7.50px;
    left: 3.12px;
    top: 6.88px;
    position: absolute;
    background: #141414;
  }

  .vector_03 {
    width: 18px;
    height: 18px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    position: absolute;
    background: #438BFF;
    border-radius: 2px;
  }

  /* Floppy disk icon - create a simple save icon */
  .vector_03::before {
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    width: 14px;
    height: 14px;
    border: 2px solid #438BFF;
    border-radius: 1px;
    background: white;
  }

  .vector_03::after {
    content: '';
    position: absolute;
    left: 5px;
    top: 4px;
    width: 2px;
    height: 4px;
    background: #438BFF;
  }

  .savechild_span {
    color: #438BFF;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .save-child {
    text-align: center;
  }

  .cancel_span {
    color: white;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .cancel {
    text-align: center;
  }

  .ellipse-1415 {
    width: 248px;
    height: 114px;
    left: 209px;
    top: 25px;
    position: absolute;
    background: radial-gradient(ellipse 42.11% 42.11% at 50.00% 52.94%, white 0%, rgba(255, 255, 255, 0) 100%);
    border-radius: 9999px;
  }

  .input-placeholder {
    align-self: stretch;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    /* outline: 1px #DCDCDC solid;
    outline-offset: -1px; */
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .frame-1410104017 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .x {
    width: 14px;
    height: 14px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }

  .x:hover .vector {
    background: #ff4444;
  }

  .caretdown {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .caretdown_01 {
    width: 20px;
    height: 20px;
    position: relative;
    overflow: hidden;
  }

  .floppydisk {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
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
    transition: background 0.2s ease;
  }

  .frame-1410104245:hover {
    background: #357ae8;
  }

  .form_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .title {
    align-self: stretch;
    padding: 8px;
    background: #EEF6FF;
    border-radius: 9px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410104000 {
    padding: 4px;
    right: 8px;
    top: 8px;
    position: absolute;
    background: white;
    border-radius: 12px;
    outline: 1px #EDEDED solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    z-index: 10;
    cursor: pointer;
  }

  .frame-1410104000:hover {
    background: #f5f5f5;
  }

  .input-placeholder_01 {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .input-placeholder_02 {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .button {
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
    transition: all 0.2s ease;
    border: none;
  }

  .button:hover {
    background: #d0f5f7;
    box-shadow: 0px 4px 0px #357ae8;
  }

  .button:active {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .frame-1410103850 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .image {
    align-self: stretch;
    height: 200px;
    position: relative;
    background: #F8FAFB;
    overflow: hidden;
    border-radius: 10px;
    outline: 2px #EDEDED solid;
    outline-offset: -2px;
  }

  .form_02 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .form_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103992 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103851 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-1410103935 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .frame-10 {
    width: 100%;
    height: 100%;
    padding-top: 24px;
    padding-bottom: 16px;
    padding-left: 12px;
    padding-right: 12px;
    background: white;
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .image-preview {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .upload-status {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    z-index: 10;
  }

  .spinner {
    width: 12px;
    height: 12px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .frame-1410103822 {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: inline-flex;
    transition: all 0.2s ease;
    border: 2px dashed transparent;
    border-radius: 8px;
    cursor: pointer;
  }

  .frame-1410103822:hover {
    background: #f0f8ff;
    border-color: #438bff;
  }

  .frame-1410103822.drag-over {
    background: #e6f3ff;
    border-color: #438bff;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(67, 139, 255, 0.2);
  }

  .uploadsimple {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .frame-1410103823 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .click-to-upload-or-drag-and-drop {
    align-self: stretch;
    text-align: center;
  }

  .clicktouploadordraganddrop_span {
    color: #141414;
    font-size: 16px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .png-jpg-gif-up-to-5mb {
    align-self: stretch;
    text-align: center;
  }

  .pngjpggifupto5mb_span {
    color: #666d80;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .error-message {
    color: #ef4444;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 400;
    line-height: 1.4;
    margin-top: 8px;
    padding: 8px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    word-wrap: break-word;
  }

  /* Fix for AdvancedSelect styling to match input-placeholder */
  .input-placeholder_01 :global(.container),
  .input-placeholder_02 :global(.container) {
    width: 100%;
    height: 100%;
  }

  .input-placeholder_01 :global(.dropdown),
  .input-placeholder_02 :global(.dropdown) {
    height: 100%;
    padding: 4px 10px;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
    border-radius: 0;
  }

  .input-placeholder_01 :global(.dropdown):focus,
  .input-placeholder_02 :global(.dropdown):focus {
    outline: none;
    box-shadow: none;
  }

  .input-placeholder_01 :global(.dropdown-list),
  .input-placeholder_02 :global(.dropdown-list) {
    z-index: 1000;
  }
</style>

