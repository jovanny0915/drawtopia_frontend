<script lang="ts">
  import OutlineBtn from "./OutlineBtn.svelte";
  import PrimaryBtn from "./PrimaryBtn.svelte";
  import AdvancedSelect from "./AdvancedSelect.svelte";
  import PrimaryInput from "./PrimaryInput.svelte";
  import { uploadAvatar } from "../lib/storage";
  import { insertChildProfiles } from "../lib/database/childProfiles";
  import type { ChildProfile } from "../lib/database/childProfiles";
  import { onMount, onDestroy } from "svelte";
  import plusIcon from "../assets/Gray-Plus.svg";
  import blueplusIcon from "../assets/blue-plus.svg";
  import spinner from "../assets/Spinner.svg";

  export let showPhotoGuideModal = false;
  export let selectedAgeGroup = "";
  export let selectedRelationship = "";
  export let onAvatarUploaded: ((url: string) => void) | undefined = undefined;
  export let userId: string | undefined = undefined;
  export let onAddChild: ((childData: any) => void) | undefined = undefined;
  export let children: Array<any> = [];
  export let onContinueToStoryCreation: (() => void) | undefined = undefined;

  let errors = {
    firstName: "",
    ageGroup: "",
    relationship: "",
  };

  // Form data
  let firstName = "";
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;
  let uploadedAvatarUrl: string | null = null;
  let fileInput: HTMLInputElement;
  let uploading = false;
  let uploadError = "";
  let uploadProgress = 0;
  let showSuccessMessage = false;
  let savingProfiles = false;
  let saveError = "";
  let isDragOver = false;

  const openPhotoGuideModal = () => {
    showPhotoGuideModal = true;
  };

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

    // Only set isDragOver to false if we're leaving the drop zone itself
    // Check if the related target is outside the drop zone
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
      const file = files[0]; // Take only the first file if multiple are dropped

      // Check if it's an image file
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

    uploadProgress = 0;
    uploading = true;
    try {
      const result = await uploadAvatar(file, userId, (p: number) => {
        uploadProgress = Math.max(0, Math.min(100, Math.round(p)));
      });

      if (result.success && result.url) {
        uploadedAvatarUrl = result.url;
        if (onAvatarUploaded) {
          onAvatarUploaded(result.url);
        }
        uploadProgress = 100;
        console.log("Avatar uploaded successfully:", result.url);
      } else {
        uploadError = result.error || "Failed to upload avatar";
        console.error("Upload failed:", result.error);
        uploadProgress = 0;
      }
    } catch (error) {
      uploadError = "An error occurred while uploading";
      console.error("Upload error:", error);
      uploadProgress = 0;
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
    uploadProgress = 0;
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

  const collectChildData = () => {
    return {
      id: Date.now(), // Simple ID generation, you might want to use UUID
      name: firstName.trim(),
      ageGroup: selectedAgeGroup,
      relationship: selectedRelationship,
      avatarUrl: uploadedAvatarUrl || "https://placehold.co/40x40",
      createdAt: new Date().toISOString(),
    };
  };

  const resetForm = () => {
    firstName = "";
    selectedAgeGroup = "";
    selectedRelationship = "";
    removeImage();
    errors = {
      firstName: "",
      ageGroup: "",
      relationship: "",
    };
    showSuccessMessage = false;
  };

  const handleAddChild = () => {
    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      return;
    }

    const childData = collectChildData();

    if (onAddChild) {
      onAddChild(childData);

      // Show success message temporarily
      showSuccessMessage = true;
      setTimeout(() => {
        showSuccessMessage = false;
      }, 3000);

      resetForm();
      console.log("Child added successfully:", childData);
    }
  };

  const handleContinueToStoryCreation = async () => {
    if (!userId) {
      saveError = "User not authenticated. Please log in to continue.";
      return;
    }

    if (children.length === 0) {
      saveError = "Please add at least one child profile before continuing.";
      return;
    }

    savingProfiles = true;
    saveError = "";

    try {
      // Convert children data to database format
      const childProfiles: ChildProfile[] = children.map((child) => ({
        first_name: child.name,
        age_group: child.ageGroup,
        relationship: child.relationship,
        parent_id: userId,
        avatar_url: child.avatarUrl,
      }));

      console.log("Saving child profiles:", childProfiles);

      // Save to database
      const result = await insertChildProfiles(childProfiles);

      if (result.success) {
        console.log("Child profiles saved successfully:", result.data);
        // sessionStorage.setItem(
        //   "selectedChildProfileId",
        //   result.data[0].id.toString(),
        // );
        // sessionStorage.setItem(
        //   "selectedChildProfileName",
        //   result.data[0].first_name,
        // );

        // Call the parent callback to proceed to story creation
        if (onContinueToStoryCreation) {
          onContinueToStoryCreation();
        }
      } else {
        saveError = result.error || "Failed to save child profiles";
        console.error("Failed to save child profiles:", result.error);
      }
    } catch (error) {
      saveError = "An unexpected error occurred while saving profiles";
      console.error("Error saving child profiles:", error);
    } finally {
      savingProfiles = false;
    }
  };

  // Prevent default drag behavior on the entire window
  const preventDefaultDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  onMount(() => {
    // Prevent default drag and drop behavior on the entire window
    window.addEventListener("dragover", preventDefaultDrag);
    window.addEventListener("drop", preventDefaultDrag);
  });

  onDestroy(() => {
    // Clean up event listeners
    window.removeEventListener("dragover", preventDefaultDrag);
    window.removeEventListener("drop", preventDefaultDrag);
  });
</script>

<div class="frame-10">
  <div class="personal-information">
    <span class="personalinformation_span">Personal Information</span>
  </div>

  {#if showSuccessMessage}
    <div class="success-message">
      ✅ Child added successfully! The form has been reset for the next child.
    </div>
  {/if}
  <div class="frame-1410103935">
    <div class="frame-1410103851">
      <div class="form">
        <div class="upload-a-photo-of-childs-name">
          <span class="uploadaphotoofchildsname_span"
            >Upload Your Child Photo</span
          >
        </div>
        <div class="image" style="cursor: pointer;">
          {#if imagePreviewUrl}
            <div class="image-preview">
              {#if uploadedAvatarUrl}
                <img src={imagePreviewUrl} alt="Selected" class="preview-image" />
              {/if}
              {#if uploading}
                <div style="width: 500px;">
                  <div class="frame-1410103823">
                      <div class="frame-1410104033">
                          <!-- <div class="spinner"> -->
                            <img src={spinner} alt="spinner" class="spinner">
                          <!-- </div> -->
                          <div class="uploading"><span class="uploading_span">Uploading...</span></div>
                      </div>
                      <div class="frame-1410103823_01">
                          <div class="bar">
                              <div class="bar_01" style="width: {uploadProgress}%"></div>
                          </div>
                          <div class="text-50"><span class="f0_span">{uploadProgress}%</span></div>
                      </div>
                  </div>
                </div>
              {:else if uploadedAvatarUrl}
                <div class="upload-success">
                  <span>✓ Uploaded successfully!</span>
                </div>
              {/if}
              <div class="image-overlay">
                <button
                  class="remove-image-btn"
                  on:click={removeImage}
                  type="button"
                  disabled={uploading}
                >
                  <span>✕</span>
                </button>
                <button
                  class="change-image-btn"
                  on:click={handleImageUpload}
                  type="button"
                  disabled={uploading}
                >
                  Change Image
                </button>
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
              <div style="display: flex; flex-direction:column; gap: 16px;">
                <div class="uploadsimple" style="margin: auto;">
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
                    <span class="pngjpggifupto5mb_span"
                      >PNG, JPG, WebP Up to 5MB</span
                    >
                  </div>
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
          <div class="error-message">
            {uploadError}
          </div>
        {/if}
      </div>
      <div class="frame-1410104082">
        <div class="make-sure-only-one-person-in-clearly-visible-see-details">
          <span class="makesureonlyonepersoninclearlyvisibleseedetails_span_01"
            >make sure only one person in clearly visible.
          </span>&nbsp;<span
            class="makesureonlyonepersoninclearlyvisibleseedetails_span_02"
            on:click={openPhotoGuideModal}
            on:keydown={(e) => e.key === "Enter" && openPhotoGuideModal()}
            role="button"
            tabindex="0"
            style="cursor: pointer;">See Details</span
          >
        </div>
      </div>
    </div>
    <div class="frame-1410103850">
      <div class="form_01">
        <div class="childs-first-name">
          <span class="childsfirstname_span">Child’s First Name*</span>
        </div>
        <PrimaryInput
          type="firstName"
          placeholder="Enter your child's first name (e.g., Léa)"
          disabled={false}
          bind:value={firstName}
          {errors}
        />
        {#if errors.firstName}
          <div class="error-message">{errors.firstName}</div>
        {/if}
      </div>
    </div>
    <div class="form_02">
      <div class="age-group">
        <span class="agegroup_span">Age Group*</span>
      </div>
      <AdvancedSelect
        options={[
          { value: "0-2", label: "👶 Ages 0-2 (Reserved)" },
          { value: "3-6", label: "👧 Ages 3-6 (Early Readers)" },
          { value: "7-10", label: "👦 Ages 7-10 (Developing Readers)" },
          { value: "11-12", label: "👦🏽 Ages 11-12 (Independent Readers)" },
        ]}
        bind:selectedOption={selectedAgeGroup}
        placeholder="Select Age Group"
        onChange={() => {}}
      />
      {#if errors.ageGroup}
        <div class="error-message">{errors.ageGroup}</div>
      {/if}
    </div>
    {#if selectedAgeGroup === "3-6"}
      <div class="title">
        <ul class="age-group-list">
          <li class="list-item">
            <span class="list-item-text">Simple sentences (5-8 words)</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Large text and images</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Interactive Search: Easy difficulty</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Story: 100-150 words total</span>
          </li>
        </ul>
      </div>
    {/if}
    {#if selectedAgeGroup === "7-10"}
      <div class="title">
        <ul class="age-group-list">
          <li class="list-item">
            <span class="list-item-text">Medium sentences (8-12 words)</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Balanced text and images</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Interactive Search: Medium difficulty</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Story: 200-300 words total</span>
          </li>
        </ul>
      </div>
    {/if}
    {#if selectedAgeGroup === "11-12"}
      <div class="title">
        <ul class="age-group-list">
          <li class="list-item">
            <span class="list-item-text">Complex sentences (12-15 words)</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Rich vocabulary and themes</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Interactive Search: Hard difficulty</span>
          </li>
          <li class="list-item">
            <span class="list-item-text">Story: 300-400 words total</span>
          </li>
        </ul>
      </div>
    {/if}
    <div class="form_03">
      <div class="select-your-relationship">
        <span class="selectyourrelationship_span"
          >Select Your Relationship*</span
        >
      </div>
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
        placeholder="Select your Relationship"
        onChange={() => {}}
      />
      {#if errors.relationship}
        <div class="error-message">{errors.relationship}</div>
      {/if}
      <!-- </div> -->
    </div>
  </div>

  {#if saveError}
    <div class="save-error-message">
      ❌ {saveError}
    </div>
  {/if}

  <div class="frame-1410103991">
    {#if children.length > 0}
      {@const allFieldsFilled = firstName.trim() && selectedAgeGroup && selectedRelationship}
      <button
        class="button"
        class:disabled={!allFieldsFilled}
        on:click={handleAddChild}
        disabled={!allFieldsFilled}
        type="button"
      >
        <div class="plus">
          {#if !allFieldsFilled}
            <img src={plusIcon} alt="Plus Icon">
          {:else}
            <img src={blueplusIcon} alt="Blue Plus Icon">
          {/if}
        </div>
        <div class="add-another-child">
          <span class="addanotherchild_span">Add Another Child</span>
        </div>
      </button>
    {/if}
    <div class="continue-btn-wrapper">
      <PrimaryBtn
        text={children.length === 0
          ? "Create Child"
          : "Continue to Story Creation"}
        isLoading={savingProfiles}
        spinner_name="Saving profiles..."
        onClick={children.length === 0
          ? handleAddChild
          : handleContinueToStoryCreation}
      />
    </div>
  </div>
</div>

<style>
  .personalinformation_span {
    color: black;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 33.6px;
    word-wrap: break-word;
  }

  .personal-information {
    align-self: stretch;
  }

  .uploadaphotoofchildsname_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .upload-a-photo-of-childs-name {
    align-self: stretch;
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

  .clicktouploadordraganddrop_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .click-to-upload-or-drag-and-drop {
    align-self: stretch;
    text-align: center;
  }

  .makesureonlyonepersoninclearlyvisibleseedetails_span_01 {
    color: black;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .makesureonlyonepersoninclearlyvisibleseedetails_span_02 {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    text-decoration: underline;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .make-sure-only-one-person-in-clearly-visible-see-details {
    flex: 1 1 0;
    text-align: center;
  }

  .childsfirstname_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .childs-first-name {
    align-self: stretch;
  }

  .agegroup_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .age-group {
    align-self: stretch;
  }

  .selectyourrelationship_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .select-your-relationship {
    align-self: stretch;
  }
  .image {
    align-self: stretch;
    height: 250px;
    position: relative;
    background: #f8fafb;
    overflow: hidden;
    border-radius: 10px;
    outline: 2px #ededed dashed;
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
    width: 100%;
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103991 {
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
    align-self: stretch;
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
    gap: 24px;
    display: flex;
    width: 100%;
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

  .frame-1410103822.drag-over .uploadsimple {
    transform: scale(1.1);
  }

  .frame-1410103822.drag-over .clicktouploadordraganddrop_span {
    color: #438bff;
    font-weight: 600;
  }
  .frame-1410103850 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }
  .form_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }
  .uploadsimple {
    width: 36px;
    height: 36px;
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

  .frame-1410104082 {
    align-self: stretch;
    padding-top: 8px;
    padding-bottom: 8px;
    background: #eef6ff;
    justify-content: center;
    align-items: center;
    gap: 10px;
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

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 8px;
  }

  .image-preview:hover .image-overlay {
    opacity: 1;
  }

  .remove-image-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: #333;
    transition: background 0.2s ease;
  }

  .remove-image-btn:hover {
    background: #ff4444;
    color: white;
  }

  .change-image-btn {
    background: #438bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.2s ease;
  }

  .change-image-btn:hover {
    background: #357ae8;
  }

  .change-image-btn:disabled,
  .remove-image-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  }

  .upload-success {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(34, 197, 94, 0.9);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    animation: fadeInOut 3s ease-in-out;
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

  @keyframes fadeInOut {
    0%,
    100% {
      opacity: 0;
    }
    10%,
    90% {
      opacity: 1;
    }
  }

  .error-message {
    color: #ef4444;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 1.4;
    margin-top: 8px;
    padding: 8px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    word-wrap: break-word;
  }

  .png-jpg-gif-up-to-5mb {
    align-self: stretch;
    text-align: center;
  }

  .pngjpggifupto5mb_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .success-message {
    background: #d1fae5;
    border: 1px solid #10b981;
    color: #065f46;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Nunito;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .save-error-message {
    background: #fef2f2;
    border: 1px solid #ef4444;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: Nunito;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease-out;
  }

  .continue-btn-wrapper {
    width: 100%;
  }

  .continue-btn-wrapper.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .button {
    width: 100%;
    height: 100%;
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
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button:hover:not(:disabled) {
    background: #d0f5f7;
    box-shadow: 0px 4px 0px #357ae8;
  }

  .button:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0px 2px 0px #438BFF;
  }

  .button:disabled {
    background: #DFE1E7;
    box-shadow: none;
    opacity: 0.5;
    cursor: not-allowed;
  }

  .vector {
    width: 18px;
    height: 18px;
    left: 3px;
    top: 3px;
    position: absolute;
    background: #438BFF;
  }

  .vector::before {
    content: '';
    position: absolute;
    width: 2px;
    height: 18px;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    background: #438BFF;
  }

  .vector::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 2px;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    background: #438BFF;
  }

  .button:disabled .vector,
  .button:disabled .vector::before,
  .button:disabled .vector::after {
    background: #818898;
  }

  .addanotherchild_span {
    color: #438BFF;
    font-size: 18px;
    font-family: DM Sans;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .button:disabled .addanotherchild_span {
    color: #818898;
  }

  .add-another-child {
    text-align: center;
  }

  .plus {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .title {
    width: 100%;
    height: 100%;
    padding: 8px;
    background: #EEF6FF;
    border-radius: 9px;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
  }

  .age-group-list {
    list-style: none;
    padding-left: 5px;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .list-item {
    position: relative;
    padding-left: 20px;
    margin-bottom: 4px;
  }

  .list-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background-color: #438BFF;
    border-radius: 50%;
  }

  .list-item-text {
    color: #438BFF;
    font-size: 14px;
    font-family: DM Sans;
    font-weight: 500;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  /* Mobile responsive styles */
  @media (max-width: 768px) {
    .frame-1410103991 {
      gap: 16px;
      margin-top: 16px;
    }

    .personalinformation_span {
      font-size: 24px;
      line-height: 28px;
    }

    .form {
      gap: 16px;
    }
    .frame-10 {
      width: 100%;
    }
  }

  /* Extra small mobile devices */
  @media (max-width: 480px) {
    .frame-1410103991 {
      gap: 12px;
      margin-top: 12px;
    }

    .personalinformation_span {
      font-size: 24px;
      line-height: 33.6px;
    }

    .form {
      gap: 12px;
    }
  }

  /* Upload progress styles (added) */
  .vector {
    width: 20.25px;
    height: 20.25px;
    left: 1.88px;
    top: 1.88px;
    position: absolute;
    background: #438BFF;
  }

  .uploading_span {
    color: #438BFF;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .uploading {
    text-align: center;
  }

  .bar_01 {
    height: 6px;
    background: #438BFF;
    border-radius: 12px;
  }

  .f0_span {
    color: #438BFF;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 19.60px;
    word-wrap: break-word;
  }

  .text-50 {
    text-align: center;
  }

  .spinner {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .bar {
    align-self: stretch;
    background: #EEF6FF;
    overflow: hidden;
    border-radius: 12px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 10px;
    display: flex;
  }

  .frame-1410104033 {
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .frame-1410103823_01 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: flex;
  }

  .frame-1410103823 {
    width: 100%;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
  }
</style>
