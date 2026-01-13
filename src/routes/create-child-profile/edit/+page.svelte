<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";
  import BackBtn from "../../../components/BackBtn.svelte";
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import PersonInfo from "../../../components/PersonInfo.svelte";
  import PhotoGuideModal from "../../../components/PhotoGuideModal.svelte";
  import AdvancedSelect from "../../../components/AdvancedSelect.svelte";
  import { user, authLoading, isAuthenticated } from "../../../lib/stores/auth";
  import { getChildProfiles, updateChildProfile, type ChildProfile } from "../../../lib/database/childProfiles";
  import { addNotification } from "../../../lib/stores/notification";
  import { uploadAvatar } from "../../../lib/storage";

  // Get child ID from URL params
  let childId: string = "";
  let childName: string = "";
  let childProfile: ChildProfile | null = null;
  let selectedAgeGroup = "";
  let showPhotoGuideModal = false;

  // Form data - separate variables for editing
  let firstName = "";
  let ageGroup = "";
  let relationship = "";
  let avatarUrl = "";

  // Image upload related variables
  let fileInput: HTMLInputElement;
  let selectedImage: File | null = null;
  let imagePreviewUrl: string | null = null;
  let uploading = false;
  let uploadError = "";
  let uploadProgress = 0;

  // Options for AdvancedSelect components
  const ageGroupOptions = [
    { value: "0-2", label: "👶 Ages 0-2 (tiny - Explorers)" },
    { value: "3-5", label: "👧 Ages 3-5 (Imagination Builders)" },
    { value: "6-7", label: "🧒 Ages 6-7 (Early Adventurers)" },
    { value: "8-10", label: "👦 Ages 8-10 (Creative Storyteller)" },
    { value: "11-12", label: "👦🏽 Ages 11-12 (Young Authors)" }
  ];

  const relationshipOptions = [
    { value: "Parent", label: "Parent" },
    { value: "Guardian", label: "Guardian" },
    { value: "Grandparent", label: "Grandparent" },
    { value: "Aunt/Uncle", label: "Aunt/Uncle" },
    { value: "Other", label: "Other" }
  ];

  // Reactive statements for auth state (following main page pattern)
  $: currentUser = $user;
  $: loading = $authLoading;
  $: authenticated = $isAuthenticated;
  $: userId = currentUser?.id;
  
  // Additional safety check for SSR
  $: safeToRedirect = browser && !loading && currentUser !== undefined;

  // Check authentication on mount (client-side only)
  onMount(() => {
    // Only run on client side
    if (browser) {
      // Get parameters from URL
      const urlParams = $page.url.searchParams;
      childId = urlParams.get('id') || '';
      childName = urlParams.get('name') || '';

      // Add a small delay to ensure auth state is fully loaded
      setTimeout(() => {
        if (safeToRedirect && !authenticated) {
          goto('/login');
          return;
        }

        // Load child profile data
        if (childId && userId) {
          loadChildProfile(userId, parseInt(childId));
        } else if (safeToRedirect) {
          addNotification({
            type: 'error',
            message: 'Invalid child profile ID'
          });
          goto('/dashboard');
        }
      }, 100);
    }
  });

  // Reactive redirect when auth state changes (client-side only)
  $: if (safeToRedirect && !authenticated) {
    goto('/login');
  }

  const loadChildProfile = async (userId: string, profileId: number) => {
    try {
      const result = await getChildProfiles(userId);
      
      if (result.success && result.data) {
        // Find the specific child profile
        const profile = result.data.find((p: ChildProfile) => p.id === profileId);
        
        if (profile) {
          childProfile = profile;
          // Initialize form data with profile values
          firstName = profile.first_name;
          ageGroup = profile.age_group;
          relationship = profile.relationship;
          avatarUrl = profile.avatar_url;
          selectedAgeGroup = ageGroup;
        } else {
          addNotification({
            type: 'error',
            message: 'Child profile not found'
          });
          goto('/dashboard');
        }
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Failed to load child profile'
        });
        goto('/dashboard');
      }
    } catch (err) {
      console.error("Error loading child profile:", err);
      addNotification({
        type: 'error',
        message: 'An unexpected error occurred while loading the profile'
      });
      goto('/dashboard');
    }
  };

  const closePhotoGuideModal = () => {
    showPhotoGuideModal = false;
  };

  const handleAvatarUploaded = (newAvatarUrl: string) => {
    console.log("Avatar uploaded successfully:", newAvatarUrl);
    // Update the form avatar URL
    avatarUrl = newAvatarUrl;
  };

  const handleImageUpload = () => {
    fileInput.click();
  };

  const processImageFile = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      uploadError = "Please select a valid image file";
      addNotification({
        type: 'error',
        message: 'Please select a valid image file (PNG, JPG, or WebP)'
      });
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
      addNotification({
        type: 'error',
        message: 'Please log in to upload images'
      });
      return;
    }

    uploadProgress = 0;
    uploading = true;
    try {
      const result = await uploadAvatar(file, userId, (p: number) => {
        uploadProgress = Math.max(0, Math.min(100, Math.round(p)));
      });

      if (result.success && result.url) {
        avatarUrl = result.url;
        uploadProgress = 100;
        console.log("Avatar uploaded successfully:", result.url);
        addNotification({
          type: 'success',
          message: 'Image uploaded successfully!'
        });
      } else {
        uploadError = result.error || "Failed to upload avatar";
        console.error("Upload failed:", result.error);
        uploadProgress = 0;
        addNotification({
          type: 'error',
          message: result.error || 'Failed to upload image'
        });
      }
    } catch (error) {
      uploadError = "An error occurred while uploading";
      console.error("Upload error:", error);
      uploadProgress = 0;
      addNotification({
        type: 'error',
        message: 'An error occurred while uploading the image'
      });
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

  const handleUpdateChild = async () => {
    // Validation
    if (!firstName.trim()) {
      addNotification({
        type: 'error',
        message: 'Please enter the child\'s first name'
      });
      return;
    }

    if (!ageGroup) {
      addNotification({
        type: 'error',
        message: 'Please select an age group'
      });
      return;
    }

    if (!relationship) {
      addNotification({
        type: 'error',
        message: 'Please select your relationship'
      });
      return;
    }

    if (!childProfile?.id || !userId) {
      addNotification({
        type: 'error',
        message: 'Invalid profile data'
      });
      return;
    }

    // Show loading state
    uploading = true;

    try {
      // Update child profile in database
      const result = await updateChildProfile(
        childProfile.id,
        {
          first_name: firstName.trim(),
          age_group: ageGroup,
          relationship: relationship,
          avatar_url: avatarUrl
        },
        userId
      );

      if (result.success) {
        addNotification({
          type: 'success',
          message: `${firstName}'s profile has been updated successfully!`
        });
        
        // Navigate back to dashboard
        goto('/dashboard');
      } else {
        addNotification({
          type: 'error',
          message: result.error || 'Failed to update profile'
        });
      }
    } catch (error) {
      console.error('Error updating child profile:', error);
      addNotification({
        type: 'error',
        message: 'An unexpected error occurred while updating the profile'
      });
    } finally {
      uploading = false;
    }
  };

  const handleContinueToStoryCreation = () => {
    console.log("Continuing to story creation after edit");
    addNotification({
      type: 'success',
      message: 'Profile updated successfully! Redirecting to story creation...'
    });
    goto('/dashboard');
  };

  const handleBackClick = () => {
    if (browser && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to dashboard if no history
      goto('/dashboard');
    }
  };
</script>

{#if loading || !browser}
  <div class="loading-container">
    <div class="loading-spinner"></div>
    <p>Loading...</p>
  </div>
{:else if !authenticated || !userId}
  <div class="auth-error-container">
    <p>Please log in to access this page.</p>
  </div>
{:else}
  <div class="profile-creation-default">
    <div class="main-pane">
      <div class="navbar" style="justify-content: center;">
        <div class="logo-text-full">
          <div class="logo-img"></div>
        </div>
      </div>
      <div on:click={handleBackClick} on:keydown={(e) => e.key === "Enter" && handleBackClick()} role="button" tabindex="0" style="cursor: pointer;">
        <MobileBackBtn backText="Back" backRoute="/dashboard" />
      </div>
      <div class="back-btn-container">
        <div on:click={handleBackClick} on:keydown={(e) => e.key === "Enter" && handleBackClick()} role="button" tabindex="0" style="cursor: pointer;">
          <BackBtn />
        </div>
      </div>
      <div class="frame-5">
        <div class="frame-1">
          <div class="heading">
            <div class="create-child-profile">
              <span class="createchildprofile_span">Edit Child Profile</span>
            </div>
            <div class="tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience">
              <span class="tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span">
                Update {childName || 'your child'}'s information
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="frame-1410103829">
          <div class="frame-1410103997">
            <div class="step-1"><span class="step1_span">Edit Profile</span></div>
            <div><span class="f2_span">1/1</span></div>
          </div>
          <div class="bar">
            <div class="bar_01"></div>
          </div>
          <div class="setting-up-profile">
            <span class="settingupprofile_span">Updating Profile</span>
          </div>
        </div>
      </div>
      <div class="frame-1410103818">
        {#if childProfile}
          <div class="edit-form-container">
            <div class="frame-10">
              <div class="personal-information">
                <span class="personalinformation_span">Personal Information</span>
              </div>
              <div class="frame-1410103935">
                <div class="frame-1410103851">
                  <div class="form">
                    <div class="upload-a-photo-of-childs-name">
                      <span class="uploadaphotoofchildsname_span">
                        Upload a photo of {firstName || 'Child'}
                      </span>
                    </div>
                    <!-- Hidden file input -->
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      bind:this={fileInput}
                      on:change={handleFileSelect}
                      style="display: none;"
                    />
                    <div 
                      class="image" 
                      style="cursor: pointer;"
                      on:click={handleImageUpload}
                      on:keydown={(e) => e.key === "Enter" && handleImageUpload()}
                      role="button"
                      tabindex="0"
                    >
                      {#if uploading}
                        <div class="upload-progress">
                          <div class="spinner"></div>
                          <span class="upload-text">Uploading... {uploadProgress}%</span>
                        </div>
                      {:else if (imagePreviewUrl || avatarUrl) && avatarUrl !== 'https://placehold.co/40x40'}
                        <div class="image-preview">
                          <img 
                            src={imagePreviewUrl || avatarUrl} 
                            alt="{firstName}'s avatar" 
                            class="preview-image" 
                          />
                          <div class="image-overlay">
                            <button 
                              class="change-image-btn" 
                              type="button"
                              on:click|stopPropagation={handleImageUpload}
                            >
                              Change Image
                            </button>
                          </div>
                        </div>
                      {:else}
                        <div class="frame-1410103822">
                          <div class="uploadsimple">
                            <div class="vector"></div>
                          </div>
                          <div class="frame-1410103823">
                            <div class="click-to-upload-or-drag-and-drop">
                              <span class="clicktouploadordraganddrop_span">
                                Click to upload or drag and drop
                              </span>
                            </div>
                            <div class="png-jpg-gif-up-to-10mb">
                              <span class="pngjpggifupto10mb_span">PNG, JPG, WebP Up to 5MB</span>
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                    {#if uploadError}
                      <div class="upload-error">
                        <span class="error-text">{uploadError}</span>
                      </div>
                    {/if}
                  </div>
                  <div class="frame-1410104082">
                    <div class="make-sure-only-one-person-in-clearly-visible-see-details">
                      <span class="makesureonlyonepersoninclearlyvisibleseedetails_span_01">
                        make sure only one person in clearly visible.
                      </span>
                      <span
                        class="makesureonlyonepersoninclearlyvisibleseedetails_span_02"
                        on:click={() => showPhotoGuideModal = true}
                        on:keydown={(e) => e.key === "Enter" && (showPhotoGuideModal = true)}
                        role="button"
                        tabindex="0"
                        style="cursor: pointer;">
                        See Details
                      </span>
                    </div>
                  </div>
                </div>
                <div class="frame-1410103850">
                  <div class="form_01">
                    <div class="childs-first-name">
                      <span class="childsfirstname_span">Child's first name*</span>
                    </div>
                    <div class="input-field">
                      <input
                        type="text"
                        bind:value={firstName}
                        placeholder="Enter your child's first name"
                        class="text-input"
                      />
                    </div>
                  </div>
                </div>
                <div class="form_02">
                  <div class="age-group">
                    <span class="agegroup_span">Age Group*</span>
                  </div>
                  <AdvancedSelect
                    bind:selectedOption={ageGroup}
                    options={ageGroupOptions}
                    placeholder="Select Age Group"
                    id="age-group-select"
                  />
                </div>
                <div class="form_03">
                  <div class="your-relationship">
                    <span class="yourrelationship_span">Your relationship*</span>
                  </div>
                  <AdvancedSelect
                    bind:selectedOption={relationship}
                    options={relationshipOptions}
                    placeholder="Select your Relationship"
                    id="relationship-select"
                  />
                </div>
              </div>
              <div class="frame-1410103991">
                <div class="button-group">
                  <button
                    class="button_02"
                    class:button-disabled={uploading}
                    on:click={handleUpdateChild}
                    type="button"
                    disabled={uploading}
                  >
                    <span class="continuetostorycreation_span">
                      {uploading ? 'Saving...' : 'Save Changes'}
                    </span>
                  </button>
                  <button
                    class="button_cancel"
                    on:click={() => goto('/dashboard')}
                    type="button"
                    disabled={uploading}
                  >
                    <span class="cancel_span">Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading child profile...</p>
          </div>
        {/if}
      </div>
      <div class="frame-1410103821">
        <div class="contact-us-hellodrawtopiacom">
          <span class="contactushellodrawtopiacom_span">Contact us: hello@drawtopia.com</span>
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
  </div>
{/if}

{#if showPhotoGuideModal}
  <div
    class="modal-overlay"
    on:keydown={(e) => e.key === "Escape" && closePhotoGuideModal()}
    role="dialog"
    tabindex="-1"
  >
    <div class="modal-container">
      <PhotoGuideModal onClose={closePhotoGuideModal} />
    </div>
  </div>
{/if}

<style>
  .main-pane {
    width: 700px;
    gap: 24px;
    display: inline-flex;
    flex-direction: column;
  }

  @media (max-width: 800px) {
    .main-pane {
      width: 100%;
      max-width: 100%;
    }
  }

  .createchildprofile_span {
    color: #121212;
    font-size: 48px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 67.2px;
    word-wrap: break-word;
  }

  .create-child-profile {
    align-self: stretch;
  }

  .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 21.6px;
    word-wrap: break-word;
  }

  .tell-us-about-your-child-so-we-can-personalize-their-drawtopia-experience {
    align-self: stretch;
  }

  .step1_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .step-1 {
    width: 63px;
  }

  .f2_span {
    color: #727272;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .bar_01 {
    width: 100%;
    height: 8px;
    left: 0px;
    top: 0px;
    position: absolute;
    background: #438bff;
    border-radius: 12px;
  }

  .settingupprofile_span {
    color: #121212;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .setting-up-profile {
    align-self: stretch;
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

  .heading {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: flex;
  }

  .frame-1410103997 {
    align-self: stretch;
    justify-content: space-between;
    align-items: center;
    display: inline-flex;
  }

  .frame-1410103820 {
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
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
  
  .bar {
    align-self: stretch;
    height: 8px;
    position: relative;
    background: #eef6ff;
    overflow: hidden;
    border-radius: 12px;
  }

  .frame-1 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 32px;
    display: flex;
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
  }

  .frame-1410103829 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-5 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 48px;
    display: flex;
  }

  .progress-bar {
    align-self: stretch;
    padding: 16px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410103818 {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .profile-creation-default {
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

  /* Mobile responsive styles */
  @media (max-width: 800px) {
    .profile-creation-default {
      padding-left: 16px;
      padding-right: 16px;
      gap: 24px;
      padding-top: 16px;
      padding-bottom: 40px;
    }

    .main-pane {
      width: 100%;
      max-width: 100%;
    }

    .frame-1410103818 {
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }

    .createchildprofile_span {
      font-size: 32px;
      line-height: 44.8px;
      text-align: center;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 16px;
      line-height: 22.4px;
      text-align: center;
    }

    .navbar {
      padding-left: 16px;
      padding-right: 16px;
      height: 64px;
    }

    .logo-text-full {
      width: 160px;
      height: 32px;
    }

    .progress-bar {
      padding: 12px;
    }

    .step1_span,
    .f2_span,
    .settingupprofile_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-5 {
      gap: 24px;
    }

    .heading {
      gap: 12px;
    }

    .back-btn-container {
      display: none;
    }

    .edit-form-container {
      width: 100%;
    }

    .frame-10 {
      padding: 16px;
      gap: 16px;
    }

    .personalinformation_span {
      font-size: 20px;
      line-height: 28px;
    }

    .uploadaphotoofchildsname_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .childsfirstname_span,
    .agegroup_span,
    .yourrelationship_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .image {
      height: 120px;
    }

    .input-field {
      height: 48px;
      padding-left: 12px;
      padding-right: 12px;
    }

    .text-input {
      font-size: 14px;
      line-height: 19.6px;
    }

    .button_02,
    .button_cancel {
      padding-left: 20px;
      padding-right: 20px;
      padding-top: 14px;
      padding-bottom: 14px;
    }

    .continuetostorycreation_span,
    .cancel_span {
      font-size: 16px;
      line-height: 22.4px;
    }

    .frame-1410103935 {
      gap: 16px;
    }

    .frame-1410103851 {
      gap: 12px;
    }

    .frame-1410103850 {
      gap: 16px;
    }

    .frame-1410103991 {
      gap: 16px;
    }

    .frame-1410103821 {
      padding-top: 16px;
      gap: 12px;
    }

    .contactushellodrawtopiacom_span,
    .privacypolicy_span,
    .termsofservice_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .modal-container {
      min-width: 90vw;
      min-height: 300px;
      margin: 16px;
    }
  }

  /* Extra small mobile devices */
  @media (max-width: 480px) {
    .profile-creation-default {
      padding-left: 12px;
      padding-right: 12px;
      gap: 16px;
      padding-top: 12px;
      padding-bottom: 32px;
    }

    .createchildprofile_span {
      font-size: 28px;
      line-height: 39.2px;
    }

    .tellusaboutyourchildsowecanpersonalizetheirdrawtopiaexperience_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .navbar {
      padding-left: 12px;
      padding-right: 12px;
      height: 56px;
    }

    .logo-text-full {
      width: 140px;
      height: 28px;
    }

    .progress-bar {
      padding: 8px;
    }

    .frame-1410103818 {
      gap: 16px;
    }

    .frame-10 {
      padding: 12px;
      gap: 12px;
    }

    .personalinformation_span {
      font-size: 18px;
      line-height: 25.2px;
    }

    .image {
      height: 100px;
    }

    .input-field {
      height: 44px;
      padding-left: 10px;
      padding-right: 10px;
    }

    .button_02,
    .button_cancel {
      padding-left: 16px;
      padding-right: 16px;
      padding-top: 12px;
      padding-bottom: 12px;
    }

    .continuetostorycreation_span,
    .cancel_span {
      font-size: 14px;
      line-height: 19.6px;
    }

    .modal-container {
      min-width: 95vw;
      margin: 8px;
    }
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-container {
    position: absolute;
    min-width: 600px;
    min-height: 440px;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  .back-btn-container {
    width: 100%;
    display: inline-flex;
    justify-content: flex-start;
  }

  @media (max-width: 800px) {
    .back-btn-container {
      display: none;
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    gap: 16px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #438bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .auth-error-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    flex-direction: column;
    gap: 16px;
    color: #ef4444;
    font-family: Nunito;
    font-size: 18px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Edit form specific styles */
  .edit-form-container {
    width: 100%;
  }

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

  .yourrelationship_span {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .your-relationship {
    align-self: stretch;
  }

  .continuetostorycreation_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .vector {
    width: 18px;
    height: 18px;
    left: 3px;
    top: 2.25px;
    position: absolute;
    background: #141414;
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

  .pngjpggifupto10mb_span {
    color: #727272;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .png-jpg-gif-up-to-10mb {
    align-self: stretch;
    text-align: center;
  }

  .makesureonlyonepersoninclearlyvisibleseedetails_span_01 {
    color: #727272;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .makesureonlyonepersoninclearlyvisibleseedetails_span_02 {
    color: #438bff;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 600;
    line-height: 19.6px;
    word-wrap: break-word;
    text-decoration: underline;
  }

  .form {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
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

  .frame-1410103850 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
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

  .frame-1410104082 {
    align-self: stretch;
    justify-content: center;
    align-items: center;
    gap: 4px;
    display: inline-flex;
  }

  .make-sure-only-one-person-in-clearly-visible-see-details {
    text-align: center;
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

  .image {
    align-self: stretch;
    height: 200px;
    position: relative;
    background: #f8fafb;
    overflow: hidden;
    border-radius: 10px;
    outline: 2px #ededed solid;
    outline-offset: -2px;
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

  .frame-1410103823 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .uploadsimple {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .input-field {
    align-self: stretch;
    height: 50px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 4px;
    padding-bottom: 4px;
    background: white;
    overflow: hidden;
    border-radius: 12px;
    outline: 1px #dcdcdc solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: inline-flex;
  }

  .text-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #141414;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
  }

  .text-input::placeholder {
    color: #727272;
  }

  .button_02 {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #438bff;
    border-radius: 20px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
  }

  .button_02:hover {
    background: #3b7ce6;
  }

  .button_02:disabled,
  .button-disabled {
    background: #a0c4ff;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .button_02:disabled:hover,
  .button-disabled:hover {
    background: #a0c4ff;
  }

  .button-group {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .button_cancel {
    align-self: stretch;
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #DCDCDC solid;
    outline-offset: -1px;
    background: white;
    justify-content: center;
    align-items: center;
    gap: 10px;
    display: inline-flex;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
  }

  .button_cancel:hover {
    background: #F8FAFB;
  }

  .button_cancel:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button_cancel:disabled:hover {
    background: white;
  }

  .cancel_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.20px;
    word-wrap: break-word;
  }

  .image-preview {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 10px;
  }

  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;
    border-radius: 15px;
  }

  .image-preview:hover .image-overlay {
    opacity: 1;
  }

  .change-image-btn {
    padding: 8px 16px;
    background: #438bff;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .change-image-btn:hover {
    background: #3b7ce6;
  }

  .upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
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

  .upload-text {
    color: #438bff;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 600;
  }

  .upload-error {
    padding: 8px 12px;
    background: #ffebee;
    border-left: 4px solid #f44336;
    border-radius: 4px;
    margin-top: 8px;
  }

  .error-text {
    color: #c62828;
    font-size: 13px;
    font-family: Nunito;
    font-weight: 500;
  }
</style>
