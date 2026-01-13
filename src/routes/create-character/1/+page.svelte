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
  import D3 from "../../../assets/3d_style.png";
  import Cartoon from "../../../assets/cartoon_style.png";
  import Anime from "../../../assets/anime_style.png";
  import greecheck from "../../../assets/SealCheck.svg";
  import warningIcon from "../../../assets/WhiteWarning.svg";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import MobileStepProgressBar from "../../../components/MobileStepProgressBar.svelte";
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

  // Form state
  let selectedChildProfileId = "";
  let childProfiles: Array<{
    value: string;
    label: string;
    avatarUrl?: string;
  }> = [];
  let characterName = "";
  let selectedCharacterType = "person";
  let selectedSpecialAbility = "";
  let customSpecialAbility = "";
  let selectedCharacterStyle = "3d";

  // Special ability options
  const specialAbilityOptions = [
    { value: "healing-powers", label: "Healing Powers" },
    { value: "flying", label: "Flying" },
    { value: "super-strength", label: "Super Strength" },
    { value: "invisibility", label: "Invisibility" },
    { value: "animal-communication", label: "Animal Communication" },
    { value: "time-control", label: "Time Control" },
    { value: "shape-shifting", label: "Shape-Shifting" },
  ];

  // Reactive statement to keep local state in sync with store
  $: if ($storyCreation.selectedChildProfileName) {
    selectedChildProfileName = $storyCreation.selectedChildProfileName;
  }

  // Check for selected child profile and fetch child profiles
  onMount(async () => {
    if (browser) {
      // Get child profile ID from sessionStorage (set from dashboard)
      const childProfileId = sessionStorage.getItem("selectedChildProfileId");

      // Fetch child profiles for the dropdown
      if ($user?.id) {
        const result = await getChildProfiles($user.id);
        if (result.success && result.data) {
          childProfiles = result.data.map((profile: any) => ({
            value: profile.id.toString(),
            label: profile.first_name,
            avatarUrl: profile.avatar_url,
          }));
          
          // Set default selected child if available from sessionStorage
          if (childProfileId && childProfiles.length > 0) {
            const selectedChild = childProfiles.find(
              (c) => c.value === childProfileId,
            );
            if (selectedChild) {
              selectedChildProfileId = childProfileId;
              selectedChildProfileName = selectedChild.label;
              
              // Update the story creation store with the selected child
              storyCreation.setSelectedChild(childProfileId, selectedChild.label);
            }
          }
        }
      }

      // Check if we're in prefill mode (coming from "Use in New Book")
      const prefillMode = sessionStorage.getItem('prefill_character_mode');
      if (prefillMode === 'true') {
        // Pre-fill character image
        const prefillImage = sessionStorage.getItem('prefill_character_image');
        if (prefillImage) {
          uploadedImageUrl = prefillImage;
          storyCreation.setOriginalImageUrl(prefillImage);
        }

        // Pre-fill character name
        const prefillName = sessionStorage.getItem('prefill_character_name');
        if (prefillName) {
          characterName = prefillName;
        }

        // Pre-fill character type
        const prefillType = sessionStorage.getItem('prefill_character_type');
        if (prefillType) {
          selectedCharacterType = prefillType;
        }

        // Pre-fill special ability
        const prefillAbility = sessionStorage.getItem('prefill_special_ability');
        if (prefillAbility) {
          // Check if it's one of the predefined options (check both value and label)
          const matchingOption = specialAbilityOptions.find(
            opt => opt.value === prefillAbility || 
                   opt.label.toLowerCase() === prefillAbility.toLowerCase()
          );
          
          if (matchingOption) {
            // It's a predefined option
            selectedSpecialAbility = matchingOption.value;
          } else {
            // It's a custom ability
            customSpecialAbility = prefillAbility;
          }
          
          console.log('Prefilled special ability:', { 
            prefillAbility, 
            matchingOption: matchingOption?.label, 
            isCustom: !matchingOption 
          });
        }

        // Pre-fill character style
        const prefillStyle = sessionStorage.getItem('prefill_character_style');
        if (prefillStyle) {
          selectedCharacterStyle = prefillStyle;
        }

        // Pre-fill child profile ID if available
        const prefillChildProfileId = sessionStorage.getItem('prefill_child_profile_id');
        if (prefillChildProfileId && childProfiles.length > 0) {
          const selectedChild = childProfiles.find(
            (c) => c.value === prefillChildProfileId
          );
          if (selectedChild) {
            selectedChildProfileId = prefillChildProfileId;
            selectedChildProfileName = selectedChild.label;
            storyCreation.setSelectedChild(prefillChildProfileId, selectedChild.label);
          }
        }

        // Clear prefill flags from sessionStorage
        sessionStorage.removeItem('prefill_character_mode');
        sessionStorage.removeItem('prefill_character_image');
        sessionStorage.removeItem('prefill_character_name');
        sessionStorage.removeItem('prefill_character_type');
        sessionStorage.removeItem('prefill_special_ability');
        sessionStorage.removeItem('prefill_character_style');
        sessionStorage.removeItem('prefill_child_profile_id');
      }
    }
  });

  // Handle file selection from input
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Handle drag events
  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    isDragOver = true;
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Only set isDragOver to false if we're leaving the drop zone itself
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
      await processImageFile(file);
    } else {
      showErrorNotification = true;
      errorNotificationMessage = "Something went wrong while uploading. Please try again.";
      setTimeout(() => {
        showErrorNotification = false;
      }, 5000);
    }
  };

  // Helper function to show error notification
  const showError = (message: string) => {
    showErrorNotification = true;
    errorNotificationMessage = message;
    uploadError = "";
    showUploadNotification = false;
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      showErrorNotification = false;
    }, 5000);
  };

  // Process and upload image file
  const processImageFile = async (file: File) => {
    // Clear previous notifications
    showErrorNotification = false;
    showUploadNotification = false;
    uploadError = "";

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!file || !allowedTypes.includes(file.type)) {
      showError("Unsupported file type. Please upload a PNG, JPG, GIF, or WebP file.");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
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

        // Update the story creation store with the image URL
        storyCreation.setOriginalImageUrl(result.url);

        // Store image URL in sessionStorage for next step
        if (browser) {
          sessionStorage.setItem("characterImageUrl", result.url);
        }

        // Show success notification
        showUploadNotification = true;
        showErrorNotification = false;

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          showUploadNotification = false;
        }, 5000);
      } else {
        // Handle upload failure
        showError("Something went wrong while uploading. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showError("Something went wrong while uploading. Please try again.");
    } finally {
      uploading = false;
    }
  };

  // Click handler for upload area
  const handleUploadClick = () => {
    if (!uploading) {
      fileInput?.click();
    }
  };

  // Handle character type selection
  const selectCharacterType = (type: string) => {
    selectedCharacterType = type;
  };

  // Handle character style selection
  const selectCharacterStyle = (style: string) => {
    selectedCharacterStyle = style;
  };

  // Handle child profile selection
  const handleChildProfileChange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedChildProfileId = target.value;
    const selectedChild = childProfiles.find((c) => c.value === target.value);
    if (selectedChild) {
      selectedChildProfileName = selectedChild.label;
      if (browser) {
        storyCreation.setSelectedChild(target.value, selectedChild.label);
      }
    }
  };

  // Validation: Check if all required fields are filled
  $: isFormValid =
    !!uploadedImageUrl &&
    !!selectedChildProfileId &&
    !!characterName.trim() &&
    (!!selectedSpecialAbility || !!customSpecialAbility.trim()) &&
    !!selectedCharacterStyle;

  // Handle back button click
  const handleBackToStep = () => {
    if (browser) {
      // Clear selected child profile from sessionStorage
      sessionStorage.removeItem("selectedChildProfileId");
      sessionStorage.removeItem("selectedChildProfileName");
    }
    
    // Navigate back to dashboard
    goto("/dashboard");
  };

  // Handle continue to next step
  const handleContinue = async () => {
    // Validate required fields
    if (!uploadedImageUrl) {
      uploadError = "Please upload a character image";
      return;
    }

    if (!characterName.trim()) {
      uploadError = "Please enter a character name";
      return;
    }

    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('No authenticated user found');
        uploadError = "Please log in to continue";
        return;
      }

      // Prepare special ability value
      const specialAbilityValue = customSpecialAbility || selectedSpecialAbility;

      // Update story creation store with character details
      storyCreation.setCharacterDetails({
        characterName,
        characterType: selectedCharacterType as any,
        specialAbility: specialAbilityValue,
      });

      // Store style selection in the store
      storyCreation.setCharacterStyle(
        selectedCharacterStyle as "3d" | "cartoon" | "anime",
      );

      // Save character information to sessionStorage for use in next steps
      if (browser) {
        sessionStorage.setItem('characterName', characterName);
        sessionStorage.setItem('selectedCharacterType', selectedCharacterType);
        sessionStorage.setItem('specialAbility', specialAbilityValue);
        sessionStorage.setItem('selectedStyle', selectedCharacterStyle);
      }

      // Check if character ID exists in sessionStorage
      const existingCharacterId = browser ? sessionStorage.getItem('characterId') : null;
      let characterId = existingCharacterId ? parseInt(existingCharacterId) : null;

      // Prepare character data
      const characterData = {
        user_id: currentUser.id,
        child_profile_id: selectedChildProfileId ? parseInt(selectedChildProfileId) : null,
        character_name: characterName,
        character_type: selectedCharacterType as 'person' | 'animal' | 'magical_creature',
        special_ability: specialAbilityValue || undefined,
        character_style: selectedCharacterStyle as '3d' | 'cartoon' | 'anime',
        original_image_url: uploadedImageUrl,
        enhanced_images: '' // Will be updated later in step 2
      };

      // Check if character exists and update or create accordingly
      if (characterId) {
        // Verify character exists in database
        const existingCharacter = await getCharacterById(characterId);
        
        if (existingCharacter.success && existingCharacter.data) {
          // Character exists - update it
          console.log('Updating existing character:', characterId, characterData);
          const result = await updateCharacter(characterId, characterData);
          
          if (result.success) {
            console.log('Character updated successfully:', result.data);
          } else {
            console.error('Failed to update character:', result.error);
            // Continue anyway - character saving is not blocking
          }
        } else {
          // Character ID exists but not found in DB - create new
          console.log('Character ID not found in database, creating new character:', characterData);
          const result = await createCharacter(characterData);
          
          if (result.success) {
            console.log('Character created successfully:', result.data);
            // Store the new character ID
            if (result.data?.id && browser) {
              sessionStorage.setItem('characterId', result.data.id.toString());
            }
          } else {
            console.error('Failed to create character:', result.error);
            // Continue anyway - character saving is not blocking
          }
        }
      } else {
        // No character ID - create new character
        console.log('Creating new character:', characterData);
        const result = await createCharacter(characterData);
        
        if (result.success) {
          console.log('Character created successfully:', result.data);
          // Store character ID for later use
          if (result.data?.id && browser) {
            sessionStorage.setItem('characterId', result.data.id.toString());
          }
        } else {
          console.error('Failed to create character:', result.error);
          // Continue anyway - character saving is not blocking
        }
      }

      // Navigate to step 2
      goto("/create-character/2");
    } catch (error) {
      console.error('Error in handleContinue:', error);
      // Continue anyway
      goto("/create-character/2");
    }
  };
</script>

<div class="character-creation-default">
  <div class="navbar">
    <div class="logo-text-full">
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
    <!-- <ProgressBar currentStep={1} /> -->
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
      <!-- Left Column: Upload Character and Helper Tips (stacked vertically) -->
      <div class="left-column-container">
        <!-- Upload Character Card -->
        <div class="frame-10">
          <div class="frame-1410103935">
            <div class="upload-character">
              <span class="uploadcharacter_span">Upload Character</span>
            </div>
            {#if showUploadNotification}
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
            <div class="frame-1410103851">
              <div class="form">
                <div
                  class="image {isDragOver ? 'drag-over' : ''} {uploading
                    ? 'uploading'
                    : ''}"
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
        <!-- Helper Tips Card -->
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
      <!-- Right Column: All option/form selecting boxes -->
      <div class="frame-1410104032-right">
        <!-- List of Children Card -->
        <div class="right-column-container">
          <div class="list-of-children">
            <span class="listofchildren_span">List of Children</span>
          </div>
          <ChildrenSelect
            options={childProfiles}
            selectedOption={selectedChildProfileId}
            onChange={handleChildProfileChange}
            placeholder="Select Your Children"
            id="childProfileSelect"
          />
        </div>

        <!-- Information Character Card -->
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
              <div class="what-type-of-character-is-this">
                <span class="whattypeofcharacteristhis_span"
                  >What type of character is this?</span
                >
              </div>
              <div class="frame-1410103942">
                <!-- Person Character Type -->
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

                <!-- Animal Character Type -->
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

                <!-- Magical Character Type -->
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

          <!-- Special Ability Card -->
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

          <!-- Select Character Style Card -->
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
        disabled={uploading || !isFormValid}
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
      <div class="privacy-policy">
        <span class="privacypolicy_span">Privacy Policy</span>
      </div>
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
    /* border-bottom: 12px solid transparent; */
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

  /* Left column container - Upload Character and Helper Tips stacked vertically */
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
  }
  .logo-img {
    background-image: url("../../../assets/logo.png");
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

  /* .continuetostyleselection_span {
    color: white;
    font-size: 18px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 25.2px;
    word-wrap: break-word;
  } */

  /* .continue-to-next-step {
    text-align: center;
  }

  .button-fill {
    width: 300px;
    height: 100%;
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
  } */

  /* Upload area styles */
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

  /* Upload progress styles */
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

  /* Upload success styles */
  .upload-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
  }

  .uploaded-image {
    /* max-width: 200px;
    max-height: 150px;*/
    /* object-fit: contain; */
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

  /* Upload error styles */
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
  /* Right column styles */
  .frame-1410104032-right {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  /* List of Children styles */
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

  /* Information Character styles */
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

  /* Character type selection styles */
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

  /* Special Ability styles */
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

  /* Character Style Selection styles */
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
    /* height: 120px; */
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

  /* Continue button styles */
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
    color: #40c4aa;
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
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .greencheck {
    width: 100%;
    margin: auto;
  }

  .frame-1410104036 {
    padding: 8px;
    background: #40c4aa;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104035 {
    width: 100%;
    height: 100%;
    padding: 8px;
    background: #effefa;
    border-radius: 10px;
    outline: 1px #40c4aa solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    margin-top: 12px;
  }

  /* Upload error notification styles */
  .warning-icon {
    width: 16px;
    height: 16px;
    position: relative;
    margin: auto;
  }

  .errormessage_span {
    color: #DF1C41;
    font-size: 16px;
    font-family: Quicksand;
    font-weight: 600;
    line-height: 22.40px;
    word-wrap: break-word;
  }

  .error-message-container {
    text-align: center;
  }

  .warning {
    width: 16px;
    height: 16px;
    position: relative;
    overflow: hidden;
  }

  .frame-1410104036-error {
    padding: 8px;
    background: #DF1C41;
    border-radius: 12px;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    display: flex;
  }

  .frame-1410104035-error {
    width: 100%;
    height: 100%;
    padding: 8px;
    background: #FFF0F3;
    border-radius: 10px;
    outline: 1px #DF1C41 solid;
    outline-offset: -1px;
    justify-content: flex-start;
    align-items: center;
    gap: 12px;
    display: inline-flex;
    margin-top: 12px;
  }
</style>
