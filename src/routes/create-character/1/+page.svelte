<script lang="ts">
  import StarEmoticon from "../../../components/StarEmoticon.svelte";
  import ProgressBar from "../../../components/ProgressBar.svelte";
  import uploadSimple from "../../../assets/upload-icon.svg";
  import darkColors from "../../../assets/day.svg";
  import pen from "../../../assets/pen.svg";
  import picture from "../../../assets/picture.svg";
  import camera from "../../../assets/Camera-black.svg";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import shieldStar from "../../../assets/ShieldStar.svg";
  import animal from "../../../assets/animal.svg";
  import magical from "../../../assets/monster.svg";
  import personFrame from "../../../assets/PersonFrame.svg";
  import D3 from "../../../assets/3d_style.webp";
  import Cartoon from "../../../assets/cartoon_style.webp";
  import Anime from "../../../assets/anime_style.webp";
  import greecheck from "../../../assets/SealCheck.svg";
  import warningIcon from "../../../assets/WhiteWarning.svg";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
  
  const goToDashboard = () => {
    goto('/dashboard');
  };
  import MobileBackBtn from "../../../components/MobileBackBtn.svelte";
  import { uploadCharacterImage } from "../../../lib/storage";
  import { user } from "../../../lib/stores/auth";
  import { storyCreation } from "../../../lib/stores/storyCreation";
  import { onMount } from "svelte";
  import PrimaryInput from "../../../components/PrimaryInput.svelte";
  import AdvancedSelect from "../../../components/AdvancedSelect.svelte";
  import { getChildProfiles } from "../../../lib/database/childProfiles";
  import ChildrenSelect from "../../../components/ChildrenSelect.svelte";
  import { createCharacter, updateCharacter, getCharacterById } from "../../../lib/database/characters";
  import { supabase } from "../../../lib/supabase";
  import { getUserProfile, decrementUserUploadCount } from "../../../lib/auth";

  const FREE_TIER_DAILY_CHARACTER_LIMIT = 10;

  let fileInput: HTMLInputElement;
  let isDragOver = false;
  let uploading = false;
  let uploadProgress = 0;
  let uploadError = "";
  let uploadedImageUrl = "";
  let selectedFile: File | null = null;
  let selectedChildProfileName = "";
  let showUploadNotification = false;
  let showErrorNotification = false;
  let errorNotificationMessage = "";

  let isFreePlan = true;
  let uploadCnt = 10;
  let loadingLimitCheck = false;
  let isEditingExistingCharacter = false;
  $: dailyLimitReached = isFreePlan && !isEditingExistingCharacter && uploadCnt <= 0;

  type CharacterGender = "male" | "female" | "non_binary";

  const isCharacterGender = (value: string | null): value is CharacterGender =>
    value === "male" || value === "female" || value === "non_binary";

  let selectedChildProfileId = "";
  let childProfiles: Array<{
    value: string;
    label: string;
    avatarUrl?: string;
    age?: string;
  }> = [];
  let loadingChildProfiles = false;
  let childProfilesError = "";
  let lastLoadedChildProfilesForUserId: string | null = null;
  let characterName = "";
  let selectedCharacterGender: CharacterGender | "" = "";
  let selectedCharacterType = "person";
  let selectedSpecialAbility = "";
  let customSpecialAbility = "";
  let selectedCharacterStyle = "3d";

  const specialAbilityOptions = [
    { value: "healing-powers", label: "Healing Powers" },
    { value: "flying", label: "Flying" },
    { value: "super-strength", label: "Super Strength" },
    { value: "invisibility", label: "Invisibility" },
    { value: "animal-communication", label: "Animal Communication" },
    { value: "time-control", label: "Time Control" },
    { value: "shape-shifting", label: "Shape-Shifting" },
  ];

  $: if ($storyCreation.selectedChildProfileName) {
    selectedChildProfileName = $storyCreation.selectedChildProfileName;
  }

  async function loadChildProfilesForUser(userId: string) {
    loadingChildProfiles = true;
    childProfilesError = "";
    try {
      const result = await getChildProfiles(userId);
      if (result.success && result.data) {
        childProfiles = result.data.map((profile: any) => ({
          value: profile.id.toString(),
          label: profile.first_name,
          avatarUrl: profile.avatar_url,
          age: profile.age_group,
        }));
        lastLoadedChildProfilesForUserId = userId;
        const childProfileId = browser ? sessionStorage.getItem("selectedChildProfileId") : null;
        if (childProfileId && childProfiles.length > 0) {
          const selectedChild = childProfiles.find((c) => c.value === childProfileId);
          if (selectedChild) {
            selectedChildProfileId = childProfileId;
            selectedChildProfileName = selectedChild.label;
            if (browser) {
              persistSelectedChild(childProfileId, selectedChild.label, selectedChild.age);
            }
          }
        }
      } else {
        childProfiles = [];
        childProfilesError = result.error || "Failed to load children";
      }
    } catch (err) {
      console.error("Error loading child profiles:", err);
      childProfiles = [];
      childProfilesError = "Failed to load children";
    } finally {
      loadingChildProfiles = false;
    }
  }

  $: if (browser && $user?.id && !loadingChildProfiles && lastLoadedChildProfilesForUserId !== $user.id) {
    loadChildProfilesForUser($user.id);
  }

  async function loadFreeTierLimit(userId: string) {
    loadingLimitCheck = true;
    try {
      const profileResult = await getUserProfile(userId);
      if (profileResult.success && profileResult.profile) {
        const profile = Array.isArray(profileResult.profile) ? profileResult.profile[0] : profileResult.profile;
        const status = (profile?.subscription_status || "free").toLowerCase();
        isFreePlan = status === "free";
        const cnt = profile?.upload_cnt;
        uploadCnt = typeof cnt === "number" ? cnt : 10;
      } else {
        isFreePlan = true;
        uploadCnt = 10;
      }
    } catch (err) {
      console.error("Error loading free tier limit:", err);
      isFreePlan = true;
      uploadCnt = 10;
    } finally {
      loadingLimitCheck = false;
    }
  }

  onMount(async () => {
    if (browser) {
      const childProfileId = sessionStorage.getItem("selectedChildProfileId");

      isEditingExistingCharacter = !!(sessionStorage.getItem("characterId"));

      const existingCharacterGender = sessionStorage.getItem("characterGender");
      if (isCharacterGender(existingCharacterGender)) {
        selectedCharacterGender = existingCharacterGender;
      }

      if ($user?.id) {
        await loadChildProfilesForUser($user.id);
        await loadFreeTierLimit($user.id);
        if (childProfileId && childProfiles.length > 0 && !selectedChildProfileId) {
          const selectedChild = childProfiles.find((c) => c.value === childProfileId);
          if (selectedChild) {
            selectedChildProfileId = childProfileId;
            selectedChildProfileName = selectedChild.label;
            if (browser) {
              persistSelectedChild(childProfileId, selectedChild.label, selectedChild.age);
            }
          }
        }
      }

      const prefillMode = sessionStorage.getItem('prefill_character_mode');
      if (prefillMode === 'true') {
        const prefillImage = sessionStorage.getItem('prefill_character_image');
        if (prefillImage) {
          uploadedImageUrl = prefillImage;
          storyCreation.setOriginalImageUrl(prefillImage);
        }

        const prefillName = sessionStorage.getItem('prefill_character_name');
        if (prefillName) {
          characterName = prefillName;
        }

        const prefillGender = sessionStorage.getItem('prefill_character_gender');
        if (isCharacterGender(prefillGender)) {
          selectedCharacterGender = prefillGender;
        }

        const prefillType = sessionStorage.getItem('prefill_character_type');
        if (prefillType) {
          selectedCharacterType = prefillType;
        }

        const prefillAbility = sessionStorage.getItem('prefill_special_ability');
        if (prefillAbility) {
          const matchingOption = specialAbilityOptions.find(
            opt => opt.value === prefillAbility || 
                   opt.label.toLowerCase() === prefillAbility.toLowerCase()
          );
          
          if (matchingOption) {
            selectedSpecialAbility = matchingOption.value;
          } else {
            customSpecialAbility = prefillAbility;
          }
          
          console.log('Prefilled special ability:', { 
            prefillAbility, 
            matchingOption: matchingOption?.label, 
            isCustom: !matchingOption 
          });
        }

        const prefillStyle = sessionStorage.getItem('prefill_character_style');
        if (prefillStyle) {
          selectedCharacterStyle = prefillStyle;
        }

        const prefillChildProfileId = sessionStorage.getItem('prefill_child_profile_id');
        if (prefillChildProfileId && childProfiles.length > 0) {
          const selectedChild = childProfiles.find(
            (c) => c.value === prefillChildProfileId
          );
          if (selectedChild) {
            selectedChildProfileId = prefillChildProfileId;
            selectedChildProfileName = selectedChild.label;
            persistSelectedChild(prefillChildProfileId, selectedChild.label, selectedChild.age);
          }
        }

        sessionStorage.removeItem('prefill_character_mode');
        sessionStorage.removeItem('prefill_character_image');
        sessionStorage.removeItem('prefill_character_name');
        sessionStorage.removeItem('prefill_character_gender');
        sessionStorage.removeItem('prefill_character_type');
        sessionStorage.removeItem('prefill_special_ability');
        sessionStorage.removeItem('prefill_character_style');
        sessionStorage.removeItem('prefill_child_profile_id');
      }
    }
  });

  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
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

    if (dailyLimitReached) {
      showError("The free tier can upload 10 characters a day.");
      return;
    }

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processImageFile(file);
    } else {
      showErrorNotification = true;
      errorNotificationMessage = "Something went wrong while uploading. Please try again.";
      setTimeout(() => {
        showErrorNotification = false;
      }, 5000);
    }
  };

  const showError = (message: string) => {
    showErrorNotification = true;
    errorNotificationMessage = message;
    uploadError = "";
    showUploadNotification = false;
    
    setTimeout(() => {
      showErrorNotification = false;
    }, 5000);
  };

  const processImageFile = async (file: File) => {
    showErrorNotification = false;
    showUploadNotification = false;
    uploadError = "";

    if (dailyLimitReached) {
      showError("The free tier can upload 10 characters a day.");
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!file || !allowedTypes.includes(file.type)) {
      showError("Unsupported file type. Please upload a PNG, JPG, GIF, or WebP file.");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("File is too large. Please upload an image under 10MB");
      return;
    }

    selectedFile = file;
    uploading = true;
    uploadProgress = 0;

    try {
      const result = await uploadCharacterImage(file, $user?.id, (progress) => {
        uploadProgress = progress;
      });

      if (result.success && result.url) {
        uploadedImageUrl = result.url;

        storyCreation.setOriginalImageUrl(result.url);

        if (browser) {
          sessionStorage.setItem("characterImageUrl", result.url);
        }

        if ($user?.id) {
          const decResult = await decrementUserUploadCount($user.id);
          if (decResult.success) {
            uploadCnt = Math.max(0, uploadCnt - 1);
          }
        }

        showUploadNotification = true;
        showErrorNotification = false;
      } else {
        showError("Something went wrong while uploading. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Something went wrong while uploading. Please try again.");
    } finally {
      uploading = false;
    }
  };

  const handleEnhanceWithAI = () => {
  };

  const handleUploadClick = () => {
    if (dailyLimitReached) {
      showError("The free tier can upload 10 characters a day.");
      return;
    }
    if (!uploading) {
      fileInput?.click();
    }
  };

  const selectCharacterType = (type: string) => {
    selectedCharacterType = type;
  };

  const selectCharacterGender = (gender: CharacterGender) => {
    selectedCharacterGender = gender;
  };

  const selectCharacterStyle = (style: string) => {
    selectedCharacterStyle = style;
  };

  const persistSelectedChild = (childId: string, childName: string, childAge?: string) => {
    storyCreation.setSelectedChild(childId, childName);
    sessionStorage.setItem('selectedChildProfileId', childId);
    sessionStorage.setItem('selectedChildProfileName', childName);
    sessionStorage.setItem('selectedChildName', childName);
    if (childAge) {
      sessionStorage.setItem('selectedChildAge', childAge);
    } else {
      sessionStorage.removeItem('selectedChildAge');
    }
  };

  const handleChildProfileChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedChildProfileId = target.value;
    const selectedChild = childProfiles.find((c) => c.value === target.value);
    if (selectedChild) {
      selectedChildProfileName = selectedChild.label;
      if (browser) {
        persistSelectedChild(target.value, selectedChild.label, selectedChild.age);
      }
    }
  };

  $: isFormValid =
    !!uploadedImageUrl &&
    !!selectedChildProfileId &&
    !!characterName.trim() &&
    !!selectedCharacterGender &&
    (!!selectedSpecialAbility || !!customSpecialAbility.trim()) &&
    !!selectedCharacterStyle;

  const handleBackToStep = () => {
    if (browser) {
      sessionStorage.removeItem("selectedChildProfileId");
      sessionStorage.removeItem("selectedChildProfileName");
      sessionStorage.removeItem("selectedChildAge");
    }
    
    goto("/dashboard");
  };

  const handleContinue = async () => {
    if (dailyLimitReached) {
      showError("The free tier can upload 10 characters a day.");
      return;
    }

    if (!uploadedImageUrl) {
      uploadError = "Please upload a character image";
      return;
    }

    if (!characterName.trim()) {
      uploadError = "Please enter a character name";
      return;
    }

    if (!selectedCharacterGender) {
      uploadError = "Please select a character gender";
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('No authenticated user found');
        uploadError = "Please log in to continue";
        return;
      }

      const specialAbilityValue = customSpecialAbility || selectedSpecialAbility;

      storyCreation.setCharacterDetails({
        characterName,
        characterGender: selectedCharacterGender,
        characterType: selectedCharacterType as any,
        specialAbility: specialAbilityValue,
      });

      storyCreation.setCharacterStyle(
        selectedCharacterStyle as "3d" | "cartoon" | "anime",
      );

      if (browser) {
        sessionStorage.setItem('characterName', characterName);
        sessionStorage.setItem('characterGender', selectedCharacterGender);
        sessionStorage.setItem('selectedCharacterType', selectedCharacterType);
        sessionStorage.setItem('specialAbility', specialAbilityValue);
        sessionStorage.setItem('selectedStyle', selectedCharacterStyle);
      }

      const existingCharacterId = browser ? sessionStorage.getItem('characterId') : null;
      let characterId = existingCharacterId ? parseInt(existingCharacterId) : null;

      const characterData = {
        user_id: currentUser.id,
        child_profile_id: selectedChildProfileId ? parseInt(selectedChildProfileId) : null,
        character_name: characterName,
        character_type: selectedCharacterType as 'person' | 'animal' | 'magical_creature',
        special_ability: specialAbilityValue || undefined,
        character_style: selectedCharacterStyle as '3d' | 'cartoon' | 'anime',
        original_image_url: uploadedImageUrl,
        enhanced_images: ''
      };

      if (characterId) {
        const existingCharacter = await getCharacterById(characterId);
        
        if (existingCharacter.success && existingCharacter.data) {
          console.log('Updating existing character:', characterId, characterData);
          const result = await updateCharacter(characterId, characterData);
          
          if (result.success) {
            console.log('Character updated successfully:', result.data);
          } else {
            console.error('Failed to update character:', result.error);
          }
        } else {
          console.log('Character ID not found in database, creating new character:', characterData);
          const result = await createCharacter(characterData);
          
          if (result.success) {
            console.log('Character created successfully:', result.data);
            if (result.data?.id && browser) {
              sessionStorage.setItem('characterId', result.data.id.toString());
            }
          } else {
            console.error('Failed to create character:', result.error);
          }
        }
      } else {
        console.log('Creating new character:', characterData);
        const result = await createCharacter(characterData);
        
        if (result.success) {
          console.log('Character created successfully:', result.data);
          if (result.data?.id && browser) {
            sessionStorage.setItem('characterId', result.data.id.toString());
          }
        } else {
          console.error('Failed to create character:', result.error);
        }
      }

      goto("/create-character/2");
    } catch (error) {
      console.error('Error in handleContinue:', error);
    }
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full" role="button" tabindex="0" on:click={goToDashboard} on:keydown={(e) => e.key === 'Enter' && goToDashboard()}>
      <div class="logo-img"></div>
    </div>
  </div>
  <div on:click={handleBackToStep} on:keydown={(e) => e.key === "Enter" && handleBackToStep()} role="button" tabindex="0">
    <MobileBackBtn backRoute="" />
  </div>
  <div class="frame-1410103818">
    <div class="heading">
      <div class="create-your-character">
        <span class="createyourcharacter_span">Create Your Character</span>
      </div>
      <div class="upload-your-drawing-or-draw-your-own-character-right-here">
        <span class="uploadyourdrawingordrawyourowncharacterrighthere_span"
          >Upload your drawing or draw your own character right here!</span
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
    <MobileStepProgressBar currentStep={1} />
    <ProgressBar currentStep={1} />
    <div class="frame-1410104027">
      <div class="star-container">
        <StarEmoticon />
      </div>
      <div class="message-container">
        <div class="polygon-1"></div>
        <div class="message-content">
          <div
            class="lets-bring-your-character-to-life-upload-a-drawing-or-photo"
          >
            <span class="letsbringyourcharactertolifeuploadadrawingorphoto_span"
              >Let's bring your character to life! Upload a drawing or photo and
              Tell me about your amazing character!</span
            >
          </div>
        </div>
      </div>
    </div>
    <div class="frame-1410104031">
      <div class="left-column-container">
        <div class="frame-10">
          <div class="frame-1410103935">
            {#if showErrorNotification}
              <div class="frame-1410104035-error">
                <div class="frame-1410104036-error">
                  <div class="warning">
                    <img src={warningIcon} alt="warning" class="warning-icon">
                  </div>
                </div>
                <div class="error-message-container">
                  <span class="errormessage_span">{errorNotificationMessage}</span>
                </div>
              </div>
            {/if}
            <div class="upload-character">
              <span class="uploadcharacter_span">Upload Character</span>
              <button
                type="button"
                class="enhance-with-ai-btn"
                disabled={!uploadedImageUrl}
                on:click={handleEnhanceWithAI}
                title={uploadedImageUrl ? "Enhance photo with AI" : "Upload a photo first to enable"}
              >
              ✨ AI Enhance
              </button>
            </div>
            {#if isFreePlan && !loadingLimitCheck}
              <div class="free-tier-limit-message">
                <span class="free-tier-limit-text">The free tier can upload 10 characters a day.</span>
                <span class="free-tier-limit-count">{uploadCnt}/{FREE_TIER_DAILY_CHARACTER_LIMIT} characters today</span>
              </div>
            {/if}
            {#if showUploadNotification && uploadedImageUrl && !uploading}
              <div class="frame-1410104035">
                <div class="frame-1410104036">
                  <div class="sealcheck">
                    <img src={greecheck} alt="greecheck" class="greencheck">
                  </div>
                </div>
                <div class="your-character-looks-amazing">
                  <span class="yourcharacterlooksamazing_span"
                    >Your character looks amazing!</span
                  >
                </div>
              </div>
            {/if}
            <div class="frame-1410103851">
              <div class="form">
                <div
                  class="image {isDragOver ? 'drag-over' : ''} {uploading
                    ? 'uploading'
                    : ''} {dailyLimitReached ? 'daily-limit-reached' : ''}"
                  on:click={handleUploadClick}
                  on:dragover={handleDragOver}
                  on:dragleave={handleDragLeave}
                  on:drop={handleDrop}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === "Enter" && handleUploadClick()}
                >
                  <input
                    bind:this={fileInput}
                    type="file"
                    accept="image/*"
                    style="display: none;"
                    on:change={handleFileSelect}
                  />

                  {#if uploading}
                    <div class="upload-progress">
                      <div class="spinner"></div>
                      <div class="progress-text">
                        <span class="uploading-text">Uploading...</span>
                        <span class="progress-percentage"
                          >{uploadProgress}%</span
                        >
                      </div>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          style="width: {uploadProgress}%"
                        ></div>
                      </div>
                    </div>
                  {:else if uploadedImageUrl}
                    <div class="upload-success">
                      <img
                        src={uploadedImageUrl}
                        alt="Uploaded character"
                        class="uploaded-image"
                      />
                      <div class="success-text">
                        <span class="success-message">✓ Upload successful!</span
                        >
                      </div>
                    </div>
                  {:else}
                    <div class="frame-1410103822">
                      <div class="uploadsimple">
                        <img src={uploadSimple} alt="uploadSimple" />
                      </div>
                      <div class="frame-1410103823">
                        <div class="click-to-choose-file-or-drag-and-drop">
                          <span class="clicktochoosefileordraganddrop_span_01"
                            >Click to Choose File
                          </span>
                          <span class="clicktochoosefileordraganddrop_span_02"
                            >or drag and drop
                          </span>
                        </div>
                        <div class="png-jpg-gifwebp-up-to-10mb">
                          <span class="pngjpggifwebpupto10mb_span"
                            >PNG, JPG, GIF,Webp Up to 10MB</span
                          >
                        </div>
                      </div>
                    </div>
                  {/if}

                  {#if uploadError}
                    <div class="upload-error">
                      <span class="error-message">{uploadError}</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            <button class="button">
              <div class="camera">
                <img src={camera} alt="camera" />
              </div>
              <div class="use-camera">
                <span class="usecamera_span">Use Camera</span>
              </div>
            </button>
          </div>
        </div>
        <div class="frame-1410104032">
          <div class="heading_01">
            <div class="helper-tips">
              <span class="helpertips_span">Helper Tips</span>
            </div>
            <div class="checklist-container">
              <div class="checklist">
                <div class="frame">
                  <img src={darkColors} alt="darkColors" />
                </div>
                <div
                  class="use-dark-colors-so-we-can-see-your-character-clearly"
                >
                  <span class="usedarkcolorssowecanseeyourcharacterclearly_span"
                    >Use dark colors so we can see your character clearly</span
                  >
                </div>
              </div>
              <div class="divider"></div>
              <div class="checklist_01">
                <div class="frame_01">
                  <img src={pen} alt="pen" />
                </div>
                <div class="draw-your-whole-character-from-head-to-feet">
                  <span class="drawyourwholecharacterfromheadtofeet_span"
                    >Draw your whole character from head to feet</span
                  >
                </div>
              </div>
              <div class="divider_01"></div>
              <div class="checklist_02">
                <div class="frame_02">
                  <img src={picture} alt="pictured" />
                </div>
                <div class="make-your-character-nice-and-big-on-the-paper">
                  <span class="makeyourcharacterniceandbigonthepaper_span"
                    >Make your character nice and big on the paper</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="frame-1410104032-right">
        <div class="right-column-container">
          <div class="list-of-children">
            <span class="listofchildren_span">List of Children</span>
          </div>
          {#if loadingChildProfiles}
            <div class="child-profiles-loading">
              <span class="child-profiles-loading-text">Loading children...</span>
            </div>
          {:else if childProfilesError}
            <div class="child-profiles-error">
              <span class="child-profiles-error-text">{childProfilesError}</span>
            </div>
          {:else if childProfiles.length === 0}
            <div class="child-profiles-empty">
              <span class="child-profiles-empty-text">No Child Profiles</span>
              <a href="/create-child-profile" class="child-profiles-add-link">Add new child</a>
            </div>
          {:else}
            <ChildrenSelect
              options={childProfiles}
              selectedOption={selectedChildProfileId}
              onChange={handleChildProfileChange}
              placeholder="Select Your Children"
              id="childProfileSelect"
            />
          {/if}
        </div>

        <div class="heading_01">
          <div class="information-character">
            <span class="informationcharacter_span">Information Character</span>
          </div>
          <div class="heading_02">
            <div class="form">
              <div class="whats-your-characters-name">
                <span class="whatsyourcharactersname_span"
                  >What's your character's name?</span
                >
              </div>
              <div class="frame-1410104040" style="width: 100%;">
                <PrimaryInput
                  type="text"
                  bind:value={characterName}
                  placeholder="Enter your Character Name"
                  errors={{}}
                  disabled={false}
                />
                <div class="text-0200-characters">
                  <span class="f200characters_span"
                    >{characterName.length}/200 Characters</span
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="heading_02">
            <div class="form_01" style="width: 100%;">
              <div class="whats-your-characters-gender">
                <span class="whatsyourcharactersgender_span"
                  >What's your character's gender?</span
                >
              </div>
              <div class="gender-radio-group" role="radiogroup" aria-label="Character gender">
                <label class="gender-radio-option {selectedCharacterGender === 'male' ? 'selected' : ''}">
                  <input
                    type="radio"
                    name="characterGender"
                    value="male"
                    bind:group={selectedCharacterGender}
                    on:change={() => selectCharacterGender("male")}
                  />
                  <span class="gender-radio-control"></span>
                  <span class="gender-radio-label">Male</span>
                </label>
                <label class="gender-radio-option {selectedCharacterGender === 'female' ? 'selected' : ''}">
                  <input
                    type="radio"
                    name="characterGender"
                    value="female"
                    bind:group={selectedCharacterGender}
                    on:change={() => selectCharacterGender("female")}
                  />
                  <span class="gender-radio-control"></span>
                  <span class="gender-radio-label">Female</span>
                </label>
                <label class="gender-radio-option {selectedCharacterGender === 'non_binary' ? 'selected' : ''}">
                  <input
                    type="radio"
                    name="characterGender"
                    value="non_binary"
                    bind:group={selectedCharacterGender}
                    on:change={() => selectCharacterGender("non_binary")}
                  />
                  <span class="gender-radio-control"></span>
                  <span class="gender-radio-label">Non-binary</span>
                </label>
              </div>
            </div>
          </div>
          <div class="heading_02">
            <div class="form_01" style="width: 100%;">
              <div class="what-type-of-character-is-this">
                <span class="whattypeofcharacteristhis_span"
                  >What type of character is this?</span
                >
              </div>
              <div class="frame-1410103942">
                <button
                  class="character-option {selectedCharacterType === 'person'
                    ? 'selected'
                    : 'unselected'}"
                  on:click={() => selectCharacterType("person")}
                >
                  <div class="frame-1410103940">
                    <div class="person-icon-frame">
                      <img src={personFrame} alt="personFrame" />
                    </div>
                    <div class="frame-1410103939">
                      <div><span class="person_span">Person</span></div>
                      <div>
                        <span class="ahumancharacter_span"
                          >A human character</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="frame-1410104043">
                    <div class="ellipse-14"></div>
                    {#if selectedCharacterType === "person"}
                      <div class="ellipse-13"></div>
                    {/if}
                  </div>
                </button>

                <button
                  class="character-option {selectedCharacterType === 'animal'
                    ? 'selected'
                    : 'unselected'}"
                  on:click={() => selectCharacterType("animal")}
                >
                  <div class="frame-1410103940">
                    <img
                      src={animal}
                      alt="animal"
                      style="width: 40px; height: 40px;"
                    />
                    <div class="frame-1410103939">
                      <div><span class="person_span">Animal</span></div>
                      <div>
                        <span class="ahumancharacter_span"
                          >Pet or wild animal</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="frame-1410104043">
                    <div class="ellipse-14"></div>
                    {#if selectedCharacterType === "animal"}
                      <div class="ellipse-13"></div>
                    {/if}
                  </div>
                </button>

                <button
                  class="character-option {selectedCharacterType === 'magical'
                    ? 'selected'
                    : 'unselected'}"
                  on:click={() => selectCharacterType("magical")}
                >
                  <div class="frame-1410103940">
                    <img
                      src={magical}
                      alt="magical"
                      style="width: 40px; height: 40px;"
                    />
                    <div class="frame-1410103939">
                      <div>
                        <span class="person_span">Magical Features</span>
                      </div>
                      <div>
                        <span class="ahumancharacter_span"
                          >Fairy, dragon, etc.</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="frame-1410104043">
                    <div class="ellipse-14"></div>
                    {#if selectedCharacterType === "magical"}
                      <div class="ellipse-13"></div>
                    {/if}
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="heading_02">
            <div class="frame-1410104039" style="width: 100%;">
              <div class="what-special-ability-does-your-character-have">
                <span class="whatspecialabilitydoesyourcharacterhave_span"
                  >What special ability does your character have?</span
                >
              </div>
              <AdvancedSelect
                options={specialAbilityOptions}
                selectedOption={selectedSpecialAbility}
                onChange={(e) => {
                  selectedSpecialAbility = (e.target as HTMLInputElement).value;
                }}
                placeholder="Select special Ability"
                id="specialAbilitySelect"
              />
            </div>
            <div class="form_03" style="width: 100%;">
              <div class="or-describe-your-own-special-power">
                <span class="ordescribeyourownspecialpower_span"
                  >Or describe your own special power:</span
                >
              </div>
              <div class="frame-1410104041">
                <textarea
                  bind:value={customSpecialAbility}
                  placeholder="Example: A friendly space alien with six arms and big eyes."
                  class="input-placeholder_02 exampleafriendlyspacealienwithsixarmsandbigeyes_span"
                  maxlength="200"
                ></textarea>
                <div class="text-0200-characters_01">
                  <span class="f200characters_01_span"
                    >{customSpecialAbility.length}/200 Characters</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="heading_02">
            <div class="select-character-style">
              <span class="selectcharacterstyle_span"
                >Select Character Style</span
              >
            </div>
            <div class="style-selection-container">
              <div
                class="style-card {selectedCharacterStyle === '3d'
                  ? 'selected'
                  : ''}"
                on:click={() => selectCharacterStyle("3d")}
                role="button"
                tabindex="0"
                on:keydown={(e) =>
                  e.key === "Enter" && selectCharacterStyle("3d")}
              >
                <img src={D3} alt="3D Realistic" class="style-image" />
                <div class="style-info">
                  <div class="style-title">3D Realistic</div>
                  <div class="style-subtitle">
                    Like your favorite animated movies.
                  </div>
                </div>
              </div>
              <div
                class="style-card {selectedCharacterStyle === 'cartoon'
                  ? 'selected'
                  : ''}"
                on:click={() => selectCharacterStyle("cartoon")}
                role="button"
                tabindex="0"
                on:keydown={(e) =>
                  e.key === "Enter" && selectCharacterStyle("cartoon")}
              >
                <img src={Cartoon} alt="Cartoon style" class="style-image" />
                <div class="style-info">
                  <div class="style-title">Cartoon style</div>
                  <div class="style-subtitle">Classic storybook style.</div>
                </div>
              </div>
              <div
                class="style-card {selectedCharacterStyle === 'anime'
                  ? 'selected'
                  : ''}"
                on:click={() => selectCharacterStyle("anime")}
                role="button"
                tabindex="0"
                on:keydown={(e) =>
                  e.key === "Enter" && selectCharacterStyle("anime")}
              >
                <img src={Anime} alt="Anime style" class="style-image" />
                <div class="style-info">
                  <div class="style-title">Anime style</div>
                  <div class="style-subtitle">Japanese Anime Style.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: space-between; width: 100%;">
      <button class="button_01" on:click={handleBackToStep}>
        <div class="arrowleft">
          <img src={arrowLeft} alt="arrowLeft" />
        </div>
        <div class="back-to-step">
          <span class="backtostep_span">Back To Step</span>
        </div>
      </button>
      <button
        class="button-fill"
        on:click={handleContinue}
        disabled={uploading || !isFormValid || dailyLimitReached}
      >
        <div class="continue-to-enhancement-preview">
          <span class="continuetoenhancementpreview_span">
            Continue to Enhancement Preview
          </span>
        </div>
      </button>
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
      <div class="terms-of-service">
        <span class="termsofservice_span">Terms of Service</span>
      </div>
    </div>
  </div>
</div>

<style>
  .createyourcharacter_span {
    color: #121212;
    font-size: 32px;
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

  .polygon-1 {
    width: 0;
    height: 0;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
    border-top: 12px solid transparent;
    border-right: 18px solid #d9eaff;
  }

  .letsbringyourcharactertolifeuploadadrawingorphoto_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .lets-bring-your-character-to-life-upload-a-drawing-or-photo {
    width: 600px;
  }

  .uploadcharacter_span {
    color: #121212;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .upload-character {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .enhance-with-ai-btn {
    flex-shrink: 0;
    padding: 8px 14px;
    font-size: 14px;
    font-family: Quicksand, sans-serif;
    font-weight: 500;
    color: #121212;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    white-space: nowrap;
  }
  .enhance-with-ai-btn:hover:not(:disabled) {
    background: #e5e5e5;
    border-color: #ccc;
  }
  .enhance-with-ai-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .free-tier-limit-message {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 0;
    align-self: stretch;
  }

  .free-tier-limit-text {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 500;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .free-tier-limit-count {
    color: #438bff;
    font-size: 13px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 18px;
    word-wrap: break-word;
  }

  .image.daily-limit-reached {
    opacity: 0.7;
    cursor: not-allowed;
    pointer-events: none;
  }

  .clicktochoosefileordraganddrop_span_01 {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .clicktochoosefileordraganddrop_span_02 {
    color: #141414;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .click-to-choose-file-or-drag-and-drop {
    width: 296px;
    text-align: center;
  }

  .pngjpggifwebpupto10mb_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .png-jpg-gifwebp-up-to-10mb {
    align-self: stretch;
    text-align: center;
  }

  .usecamera_span {
    color: black;
    background-color: white;
    font-size: 14px;
    font-family: Quicksand;
    font-weight: 500;
    word-wrap: break-word;
  }

  .use-camera {
    text-align: center;
  }

  .helpertips_span {
    color: black;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .helper-tips {
    align-self: stretch;
  }

  .usedarkcolorssowecanseeyourcharacterclearly_span {
    color: #121212;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .use-dark-colors-so-we-can-see-your-character-clearly {
    text-align: center;
  }

  .divider {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .drawyourwholecharacterfromheadtofeet_span {
    color: #121212;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .draw-your-whole-character-from-head-to-feet {
    text-align: center;
  }

  .divider_01 {
    align-self: stretch;
    height: 1px;
    background: #ededed;
  }

  .makeyourcharacterniceandbigonthepaper_span {
    color: #121212;
    font-size: 16px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .make-your-character-nice-and-big-on-the-paper {
    text-align: center;
  }

  .backtostep_span {
    color: black;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .back-to-step {
    text-align: center;
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

  .frame-1410103823 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
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

  .uploadsimple {
    width: 32px;
    height: 32px;
    position: relative;
    overflow: hidden;
  }

  .camera {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame_01 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .frame_02 {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    position: relative;
    overflow: hidden;
  }

  .star-container {
    flex-shrink: 0;
    width: 88px;
    height: 88px;
  }

  .message-container {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 12px;
  }

  .message-content {
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: #d9eaff;
    border-radius: 24px;
    margin-left: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
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

  .frame-1410103822 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: inline-flex;
  }

  .button {
    align-self: stretch;
    padding: 8px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .checklist {
    align-self: stretch;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 16px;
    background: white;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .checklist_01 {
    align-self: stretch;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 16px;
    background: white;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .checklist_02 {
    align-self: stretch;
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 6px;
    padding-right: 16px;
    background: white;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    display: inline-flex;
  }

  .button_01 {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 16px;
    padding-bottom: 16px;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
    border-radius: 20px;
    outline: 1px #dcdcdc solid;
    background-color: white;
    outline-offset: -1px;
    justify-content: center;
    align-items: center;
    gap: 10px;
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

  .frame-1410104027 {
    justify-content: center;
    align-items: center;
    display: flex;
    width: 100%;
  }

  .image {
    align-self: stretch;
    min-height: 254px;
    background: #f8fafb;
    overflow: hidden;
    border-radius: 10px;
    outline: 2px #ededed solid;
    outline-offset: -2px;
    align-items: center;
    justify-content: center;
    display: flex;
  }

  .checklist-container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
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

  .right-column-container {
    background: #eef6ff;
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #bcdbff solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .heading_01 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #ededed solid;
    background: white;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 32px;
    display: flex;
  }

  .heading_02 {
    align-self: stretch;
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    border-radius: 20px;
    outline: 1px #ededed solid;
    background: white;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 16px;
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

  .frame-1410104032 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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
    padding-left: 12px;
    padding-right: 12px;
    padding-top: 16px;
    padding-bottom: 16px;
    background: white;
    border-radius: 20px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104031 {
    align-self: stretch;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .left-column-container {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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
    cursor: pointer;
  }
  .logo-img {
    background-image: url("../../../assets/logo.webp");
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
  }
  @media (max-width: 800px) {
    .frame-1410104031 {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
    }
    .left-column-container {
      width: 100%;
    }
    .frame-10 {
      width: 100%;
    }
    .frame-1410104032 {
      width: 100%;
    }
    .frame-1410104032-right {
      width: 100%;
    }
    .character-creation-default {
      padding-left: 20px;
      padding-right: 20px;
    }
    .star-container {
      width: 25%;
    }
    .message-container {
      max-width: 75%;
    }
    .message-content {
      width: 90%;
    }
    .style-card {
      width: 100%;
    }
    .uploaded-image {
      max-height: 600px;
    }
  }



  .image {
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .image:hover {
    background: #f0f4f8;
    outline-color: #438bff;
  }

  .image.drag-over {
    background: #e8f4ff;
    outline: 2px solid #438bff;
    outline-offset: -2px;
  }

  .image.uploading {
    cursor: not-allowed;
  }

  .upload-progress {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #438bff;
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

  .progress-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .uploading-text {
    color: #438bff;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
  }

  .progress-percentage {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 500;
  }

  .progress-bar {
    width: 200px;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #438bff 0%, #5ba0ff 100%);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .upload-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .uploaded-image {
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    max-width: 400px;
  }

  .success-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .success-message {
    color: #22c55e;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
  }

  .upload-error {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    padding: 8px 12px;
    max-width: 90%;
  }

  .error-message {
    color: #dc2626;
    font-size: 12px;
    font-family: Nunito;
    font-weight: 500;
    text-align: center;
  }
  .frame-1410104032-right {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .listofchildren_span {
    color: #121212;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .list-of-children {
    align-self: stretch;
  }

  .child-profiles-loading,
  .child-profiles-error,
  .child-profiles-empty {
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e6ebf3;
    background: #f8fafb;
    width: 100%;
  }

  .child-profiles-empty {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .child-profiles-loading-text {
    color: #666d80;
    font-size: 15px;
    font-family: Nunito;
    font-weight: 400;
  }

  .child-profiles-error-text {
    color: #DF1C41;
    font-size: 15px;
    font-family: Nunito;
    font-weight: 500;
  }

  .child-profiles-empty-text {
    color: #666d80;
    font-size: 15px;
    font-family: Nunito;
    font-weight: 400;
  }

  .child-profiles-add-link {
    color: #438bff;
    font-size: 15px;
    font-family: Quicksand;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .child-profiles-add-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .informationcharacter_span {
    color: #121212;
    font-size: 24px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 28px;
    word-wrap: break-word;
  }

  .information-character {
    align-self: stretch;
  }

  .whatsyourcharactersname_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .whats-your-characters-name {
    align-self: stretch;
  }

  .f200characters_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .text-0200-characters {
    align-self: stretch;
  }

  .whatsyourcharactersgender_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .whats-your-characters-gender {
    align-self: stretch;
  }

  .gender-radio-group {
    align-self: stretch;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .gender-radio-option {
    flex: 1 1 140px;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    background: white;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .gender-radio-option:hover {
    background: #f8fafb;
    outline-color: #438bff;
  }

  .gender-radio-option.selected {
    outline: 1px #438bff solid;
    background: #eef6ff;
  }

  .gender-radio-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .gender-radio-control {
    width: 20px;
    height: 20px;
    border: 1px solid #438bff;
    border-radius: 999px;
    background: white;
    position: relative;
    flex-shrink: 0;
  }

  .gender-radio-option.selected .gender-radio-control::after {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #438bff;
    position: absolute;
    left: 4px;
    top: 4px;
  }

  .gender-radio-label {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .whattypeofcharacteristhis_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .what-type-of-character-is-this {
    align-self: stretch;
  }

  .character-option {
    align-self: stretch;
    padding: 12px;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    background: white;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .character-option:hover {
    background: #f8fafb;
    outline-color: #438bff;
  }

  .character-option.selected {
    outline: 1px #438bff solid;
    background: #eef6ff;
  }

  .person_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .ahumancharacter_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .frame-1410103940 {
    flex: 1 1 0;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
  }

  .frame-1410103939 {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 2px;
    display: inline-flex;
  }

  .frame-1410104043 {
    width: 24px;
    height: 24px;
    position: relative;
    background: white;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ellipse-14 {
    width: 24px;
    height: 24px;
    left: 0px;
    top: 0px;
    position: absolute;
    border-radius: 9999px;
    border: 1px #438bff solid;
  }

  .ellipse-13 {
    width: 12px;
    height: 12px;
    left: 6px;
    top: 6px;
    position: absolute;
    background: #438bff;
    border-radius: 9999px;
    border: 1px #438bff solid;
  }

  .person-icon-frame {
    width: 40px;
    height: 40px;
    position: relative;
    overflow: hidden;
  }

  .whatspecialabilitydoesyourcharacterhave_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .what-special-ability-does-your-character-have {
    align-self: stretch;
  }

  .ordescribeyourownspecialpower_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .or-describe-your-own-special-power {
    align-self: stretch;
  }

  .frame-1410104041 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .input-placeholder_02 {
    align-self: stretch;
    min-height: 120px;
    padding: 12px;
    background: white;
    border: 1px solid #dcdcdc;
    border-radius: 12px;
    font-size: 16px;
    font-family: Nunito;
    color: #141414;
    resize: vertical;
    outline: none;
    transition: all 0.2s ease;
  }

  .input-placeholder_02:focus {
    outline: 2px solid #438bff;
    outline-offset: -2px;
    border-color: #438bff;
  }

  .f200characters_01_span {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .text-0200-characters_01 {
    align-self: stretch;
  }

  .selectcharacterstyle_span {
    color: #121212;
    font-size: 20px;
    font-family: Quicksand;
    font-weight: 500;
    line-height: 28px;
    word-wrap: break-word;
  }

  .select-character-style {
    align-self: stretch;
  }

  .style-selection-container {
    align-self: stretch;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 12px;
    display: flex;
  }

  .style-card {
    flex: 1 1 0;
    padding: 12px;
    background: white;
    border-radius: 12px;
    outline: 1px #ededed solid;
    outline-offset: -1px;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: inline-flex;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .style-card:hover {
    background: #f8fafb;
    outline-color: #438bff;
    transform: translateY(-2px);
  }

  .style-card.selected {
    outline: 2px #438bff solid;
    outline-offset: -2px;
    background: #eef6ff;
  }

  .style-image {
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .style-info {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .style-title {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .style-subtitle {
    color: #666d80;
    font-size: 14px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 19.6px;
    word-wrap: break-word;
  }

  .continuetoenhancementpreview_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  }

  .continue-to-enhancement-preview {
    text-align: center;
  }

  .button-fill {
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
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .button-fill:hover {
    background: #3a7ae4;
    transform: translateY(-1px);
  }

  .button-fill:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
  }

  .button-fill:disabled:hover {
    background: #cccccc;
    transform: none;
  }

  .frame-1410103942 {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media (max-width: 800px) {
    .button_01 {
      display: none;
    }
    .create-your-character {
      text-align: left;
    }
    .upload-your-drawing-or-draw-your-own-character-right-here {
      text-align: left;
    }
    .heading {
      align-items: flex-start;
    }
    .frame-1410104032-right {
      width: 100%;
    }
    .style-selection-container {
      flex-direction: column;
    }
    .button-fill {
      width: 100%;
    }
  }

  .yourcharacterlooksamazing_span {
    color: #121212;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .your-character-looks-amazing {
    text-align: center;
  }

  .sealcheck {
    width: 18px;
    height: 18px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .greencheck {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .frame-1410104036 {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    background: #2db8a1;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    gap: 0;
    display: flex;
  }

  @keyframes badgeFadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .frame-1410104035 {
    align-self: stretch;
    padding: 12px 16px;
    background: linear-gradient(90deg, #e8f8f5 0%, #effefa 50%, #e8f8f5 100%);
    border-radius: 12px;
    border: 1px solid rgba(64, 196, 170, 0.4);
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
    animation: badgeFadeIn 0.3s ease-out;
  }

  .warning-icon {
    width: 18px;
    height: 18px;
    position: relative;
    margin: auto;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .errormessage_span {
    color: #E60049;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.4px;
    word-wrap: break-word;
  }

  .error-message-container {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .warning {
    width: 24px;
    height: 24px;
    min-width: 24px;
    min-height: 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .frame-1410104036-error {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;
    padding: 0;
    background: #E60049;
    border-radius: 50%;
    justify-content: center;
    align-items: center;
    display: flex;
  }

  .frame-1410104035-error {
    align-self: stretch;
    padding: 12px 16px;
    background: #FFECEF;
    border: 1px solid #E60049;
    border-radius: 16px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: flex;
    animation: badgeFadeIn 0.3s ease-out;
  }
</style>
