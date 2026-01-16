<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { getCharacterById, updateCharacter, type Character } from "../../../lib/database/characters";
  import { getChildProfiles } from "../../../lib/database/childProfiles";
  import { uploadCharacterImage } from "../../../lib/storage";
  import { user } from "../../../lib/stores/auth";
  import { supabase } from "../../../lib/supabase";
  import logo from "../../../assets/logo.png";
  import arrowLeft from "../../../assets/ArrowLeft.svg";
  import uploadSimple from "../../../assets/upload-icon.svg";
  import darkColors from "../../../assets/day.svg";
  import pen from "../../../assets/pen.svg";
  import picture from "../../../assets/picture.svg";
  import camera from "../../../assets/Camera-black.svg";
  import personFrame from "../../../assets/PersonFrame.svg";
  import animal from "../../../assets/animal.svg";
  import magical from "../../../assets/monster.svg";
  import D3 from "../../../assets/3d_style.png";
  import Cartoon from "../../../assets/cartoon_style.png";
  import Anime from "../../../assets/anime_style.png";
  import greecheck from "../../../assets/SealCheck.svg";
  import warningIcon from "../../../assets/WhiteWarning.svg";
  import PrimaryInput from "../../../components/PrimaryInput.svelte";
  import AdvancedSelect from "../../../components/AdvancedSelect.svelte";
  import ChildrenSelect from "../../../components/ChildrenSelect.svelte";

  let fileInput: HTMLInputElement;
  let isDragOver = false;
  let uploading = false;
  let uploadProgress = 0;
  let uploadError = "";
  let uploadedImageUrl = "";
  let selectedFile: File | null = null;
  let showUploadNotification = false;
  let showErrorNotification = false;
  let errorNotificationMessage = "";

  // Form state
  let character: Character | null = null;
  let isLoading = true;
  let loadError = "";
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

  // Get characterId from URL query params
  $: characterId = $page.url.searchParams.get('characterId');

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

  // Load character data and child profiles
  onMount(async () => {
    if (browser) {
      // Load character data
      if (!characterId) {
        loadError = "No character ID provided";
        isLoading = false;
        return;
      }

      isLoading = true;
      try {
        // Fetch character
        const result = await getCharacterById(parseInt(characterId, 10));
        
        if (!result.success || !result.data) {
          loadError = result.error || "Failed to load character";
          isLoading = false;
          console.error("Failed to fetch character:", result.error);
          return;
        }

        character = result.data as Character;

        // Pre-fill form with character data
        characterName = character.character_name || "";
        
        // Handle character type (map magical_creature to magical for UI)
        if (character.character_type === "magical_creature") {
          selectedCharacterType = "magical";
        } else {
          selectedCharacterType = character.character_type || "person";
        }

        // Handle special ability
        const specialAbility = character.special_ability || "";
        let matchingOption = null;
        
        if (specialAbility) {
          // Try to find matching option by value first
          matchingOption = specialAbilityOptions.find(
            opt => opt.value === specialAbility
          );
          
          // If not found by value, try matching by label (case-insensitive)
          if (!matchingOption) {
            matchingOption = specialAbilityOptions.find(
              opt => opt.label.toLowerCase().trim() === specialAbility.toLowerCase().trim()
            );
          }
          
          if (matchingOption) {
            // It's a predefined option - use the value
            selectedSpecialAbility = matchingOption.value;
            customSpecialAbility = "";
          } else {
            // It's a custom ability
            customSpecialAbility = specialAbility;
            selectedSpecialAbility = "";
          }
        } else {
          // No special ability set
          selectedSpecialAbility = "";
          customSpecialAbility = "";
        }

        // Handle character style
        selectedCharacterStyle = character.character_style || "3d";

        // Handle image URL (prefer enhanced, fallback to original)
        if (character.enhanced_images) {
          if (Array.isArray(character.enhanced_images) && character.enhanced_images.length > 0) {
            uploadedImageUrl = character.enhanced_images[0];
          } else if (typeof character.enhanced_images === 'string' && character.enhanced_images) {
            uploadedImageUrl = character.enhanced_images;
          }
        }
        if (!uploadedImageUrl && character.original_image_url) {
          uploadedImageUrl = character.original_image_url;
        }

        // Handle child profile
        if (character.child_profile_id) {
          selectedChildProfileId = character.child_profile_id.toString();
        }

        // Fetch child profiles for the dropdown
        if ($user?.id) {
          const childResult = await getChildProfiles($user.id);
          if (childResult.success && childResult.data) {
            childProfiles = childResult.data.map((profile: any) => ({
              value: profile.id.toString(),
              label: profile.first_name,
              avatarUrl: profile.avatar_url,
            }));
          }
        }

        isLoading = false;
      } catch (error) {
        loadError = "An unexpected error occurred while loading the character";
        isLoading = false;
        console.error("Error loading character:", error);
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
      showError("Something went wrong while uploading. Please try again.");
    }
  };

  // Helper function to show error notification
  const showError = (message: string) => {
    showErrorNotification = true;
    errorNotificationMessage = message;
    uploadError = "";
    showUploadNotification = false;
    setTimeout(() => {
      showErrorNotification = false;
    }, 5000);
  };

  // Process and upload image file
  const processImageFile = async (file: File) => {
    showErrorNotification = false;
    showUploadNotification = false;
    uploadError = "";

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
        showUploadNotification = true;
        showErrorNotification = false;
        setTimeout(() => {
          showUploadNotification = false;
        }, 5000);
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
  };

  // Validation: Check if all required fields are filled
  $: isFormValid =
    !!uploadedImageUrl &&
    !!characterName.trim() &&
    (!!selectedSpecialAbility || !!customSpecialAbility.trim()) &&
    !!selectedCharacterStyle;

  // Handle cancel - navigate to dashboard
  const handleCancel = () => {
    goto('/dashboard');
  };

  // Handle go to dashboard
  const goToDashboard = () => {
    goto('/dashboard');
  };

  // Handle save character
  const handleSave = async () => {
    if (!character || !characterId) {
      showError("Character data not loaded");
      return;
    }

    // Validate required fields
    if (!uploadedImageUrl) {
      showError("Please upload a character image");
      return;
    }

    if (!characterName.trim()) {
      showError("Please enter a character name");
      return;
    }

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        showError("Please log in to continue");
        return;
      }

      // Prepare special ability value
      const specialAbilityValue = customSpecialAbility.trim() || selectedSpecialAbility || undefined;

      // Map character_type: "magical" -> "magical_creature" for database
      let characterTypeForDB = selectedCharacterType;
      if (characterTypeForDB === "magical") {
        characterTypeForDB = "magical_creature";
      }

      // Prepare character data for update
      const characterData: Partial<Character> = {
        child_profile_id: selectedChildProfileId ? parseInt(selectedChildProfileId) : null,
        character_name: characterName.trim(),
        character_type: characterTypeForDB as 'person' | 'animal' | 'magical_creature',
        special_ability: specialAbilityValue,
        character_style: selectedCharacterStyle as '3d' | 'cartoon' | 'anime',
        original_image_url: uploadedImageUrl,
      };

      // Update character
      const result = await updateCharacter(parseInt(characterId, 10), characterData);
      
      if (result.success) {
        // Show success and navigate back
        showUploadNotification = true;
        showErrorNotification = false;
        
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          goto('/dashboard');
        }, 1500);
      } else {
        showError(result.error || "Failed to update character. Please try again.");
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      showError("An unexpected error occurred. Please try again.");
    }
  };
</script>

<div class="character-edit-container">
  <div class="navbar">
    <div class="logo-text-full" role="button" tabindex="0" on:click={goToDashboard} on:keydown={(e) => e.key === 'Enter' && goToDashboard()}>
      <img src={logo} alt="Drawtopia" class="logo-img" />
    </div>
  </div>

  <div class="content-wrapper">
    {#if isLoading}
      <div class="loading-container">
        <div class="loading-text">Loading character information...</div>
      </div>
    {:else if loadError}
      <div class="error-container">
        <div class="error-text">{loadError}</div>
        <button class="back-button" on:click={handleCancel}>Go Back</button>
      </div>
    {:else if character}
      <div class="character-edit-content">
        <div class="header-section">
          <div class="page-title">Edit Character</div>
        </div>

        <div class="form-sections">
          <!-- Left Column: Upload Character and Helper Tips -->
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
                      <span class="yourcharacterlooksamazing_span">Character updated successfully!</span>
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
                      class="image {isDragOver ? 'drag-over' : ''} {uploading ? 'uploading' : ''}"
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
                            <span class="progress-percentage">{uploadProgress}%</span>
                          </div>
                          <div class="progress-bar">
                            <div class="progress-fill" style="width: {uploadProgress}%"></div>
                          </div>
                        </div>
                      {:else if uploadedImageUrl}
                        <div class="upload-success">
                          <img src={uploadedImageUrl} alt="Uploaded character" class="uploaded-image" />
                          <div class="success-text">
                            <span class="success-message">✓ Image loaded</span>
                          </div>
                        </div>
                      {:else}
                        <div class="frame-1410103822">
                          <div class="uploadsimple">
                            <img src={uploadSimple} alt="uploadSimple" />
                          </div>
                          <div class="frame-1410103823">
                            <div class="click-to-choose-file-or-drag-and-drop">
                              <span class="clicktochoosefileordraganddrop_span_01">Click to Choose File</span>
                              <span class="clicktochoosefileordraganddrop_span_02">or drag and drop</span>
                            </div>
                            <div class="png-jpg-gifwebp-up-to-10mb">
                              <span class="pngjpggifwebpupto10mb_span">PNG, JPG, GIF,Webp Up to 10MB</span>
                            </div>
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
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
                    <div class="use-dark-colors-so-we-can-see-your-character-clearly">
                      <span class="usedarkcolorssowecanseeyourcharacterclearly_span">Use dark colors so we can see your character clearly</span>
                    </div>
                  </div>
                  <div class="divider"></div>
                  <div class="checklist_01">
                    <div class="frame_01">
                      <img src={pen} alt="pen" />
                    </div>
                    <div class="draw-your-whole-character-from-head-to-feet">
                      <span class="drawyourwholecharacterfromheadtofeet_span">Draw your whole character from head to feet</span>
                    </div>
                  </div>
                  <div class="divider_01"></div>
                  <div class="checklist_02">
                    <div class="frame_02">
                      <img src={picture} alt="pictured" />
                    </div>
                    <div class="make-your-character-nice-and-big-on-the-paper">
                      <span class="makeyourcharacterniceandbigonthepaper_span">Make your character nice and big on the paper</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Form Fields -->
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
                    <span class="whatsyourcharactersname_span">What's your character's name?</span>
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
                      <span class="f200characters_span">{characterName.length}/200 Characters</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="heading_02">
                <div class="form_01" style="width: 100%;">
                  <div class="what-type-of-character-is-this">
                    <span class="whattypeofcharacteristhis_span">What type of character is this?</span>
                  </div>
                  <div class="frame-1410103942">
                    <!-- Person Character Type -->
                    <button
                      class="character-option {selectedCharacterType === 'person' ? 'selected' : 'unselected'}"
                      on:click={() => selectCharacterType("person")}
                    >
                      <div class="frame-1410103940">
                        <div class="person-icon-frame">
                          <img src={personFrame} alt="personFrame" />
                        </div>
                        <div class="frame-1410103939">
                          <div><span class="person_span">Person</span></div>
                          <div><span class="ahumancharacter_span">A human character</span></div>
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
                      class="character-option {selectedCharacterType === 'animal' ? 'selected' : 'unselected'}"
                      on:click={() => selectCharacterType("animal")}
                    >
                      <div class="frame-1410103940">
                        <img src={animal} alt="animal" style="width: 40px; height: 40px;" />
                        <div class="frame-1410103939">
                          <div><span class="person_span">Animal</span></div>
                          <div><span class="ahumancharacter_span">Pet or wild animal</span></div>
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
                      class="character-option {selectedCharacterType === 'magical' ? 'selected' : 'unselected'}"
                      on:click={() => selectCharacterType("magical")}
                    >
                      <div class="frame-1410103940">
                        <img src={magical} alt="magical" style="width: 40px; height: 40px;" />
                        <div class="frame-1410103939">
                          <div><span class="person_span">Magical Features</span></div>
                          <div><span class="ahumancharacter_span">Fairy, dragon, etc.</span></div>
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
                    <span class="whatspecialabilitydoesyourcharacterhave_span">What special ability does your character have?</span>
                  </div>
                  <AdvancedSelect
                    options={specialAbilityOptions}
                    selectedOption={selectedSpecialAbility}
                    onChange={(e) => {
                      const value = (e.target as HTMLInputElement).value;
                      selectedSpecialAbility = value;
                      // Clear custom ability when a predefined option is selected
                      if (value) {
                        customSpecialAbility = "";
                      }
                    }}
                    placeholder="Select special Ability"
                    id="specialAbilitySelect"
                  />
                </div>
                <div class="form_03" style="width: 100%;">
                  <div class="or-describe-your-own-special-power">
                    <span class="ordescribeyourownspecialpower_span">Or describe your own special power:</span>
                  </div>
                  <div class="frame-1410104041">
                    <textarea
                      bind:value={customSpecialAbility}
                      placeholder="Example: A friendly space alien with six arms and big eyes."
                      class="input-placeholder_02 exampleafriendlyspacealienwithsixarmsandbigeyes_span"
                      maxlength="200"
                      on:input={(e) => {
                        // Clear selected predefined option when typing custom ability
                        if ((e.target as HTMLTextAreaElement).value.trim()) {
                          selectedSpecialAbility = "";
                        }
                      }}
                    ></textarea>
                    <div class="text-0200-characters_01">
                      <span class="f200characters_01_span">{customSpecialAbility.length}/200 Characters</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Select Character Style Card -->
              <div class="heading_02">
                <div class="select-character-style">
                  <span class="selectcharacterstyle_span">Select Character Style</span>
                </div>
                <div class="style-selection-container">
                  <div
                    class="style-card {selectedCharacterStyle === '3d' ? 'selected' : ''}"
                    on:click={() => selectCharacterStyle("3d")}
                    role="button"
                    tabindex="0"
                    on:keydown={(e) => e.key === "Enter" && selectCharacterStyle("3d")}
                  >
                    <img src={D3} alt="3D Realistic" class="style-image" />
                    <div class="style-info">
                      <div class="style-title">3D Realistic</div>
                      <div class="style-subtitle">Like your favorite animated movies.</div>
                    </div>
                  </div>
                  <div
                    class="style-card {selectedCharacterStyle === 'cartoon' ? 'selected' : ''}"
                    on:click={() => selectCharacterStyle("cartoon")}
                    role="button"
                    tabindex="0"
                    on:keydown={(e) => e.key === "Enter" && selectCharacterStyle("cartoon")}
                  >
                    <img src={Cartoon} alt="Cartoon style" class="style-image" />
                    <div class="style-info">
                      <div class="style-title">Cartoon style</div>
                      <div class="style-subtitle">Classic storybook style.</div>
                    </div>
                  </div>
                  <div
                    class="style-card {selectedCharacterStyle === 'anime' ? 'selected' : ''}"
                    on:click={() => selectCharacterStyle("anime")}
                    role="button"
                    tabindex="0"
                    on:keydown={(e) => e.key === "Enter" && selectCharacterStyle("anime")}
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

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="button_01" on:click={handleCancel}>
            <div class="arrowleft">
              <img src={arrowLeft} alt="arrowLeft" />
            </div>
            <div class="back-to-step">
              <span class="backtostep_span">Cancel</span>
            </div>
          </button>
          <button
            class="button-fill"
            on:click={handleSave}
            disabled={uploading || !isFormValid}
          >
            <div class="continue-to-enhancement-preview">
              <span class="continuetoenhancementpreview_span">Save Changes</span>
            </div>
          </button>
        </div>
      </div>
    {/if}
  </div>

  <div class="footer">
    <div class="contact-us">Contact us: hello@drawtopia.com</div>
    <div class="footer-divider"></div>
    <div class="footer-links">
      <div class="footer-link">Privacy Policy</div>
      <div class="footer-link">Terms of Service</div>
    </div>
  </div>
</div>

<!-- All styles included below -->
<style>
  
  /* Additional edit-specific styles */
  .character-edit-container {
    width: 100%;
    min-height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    padding: 24px 100px 80px 100px;
    gap: 48px;
  }

  .navbar {
    align-self: stretch;
    height: 79px;
    padding-top: 12px;
    padding-bottom: 12px;
    padding-left: 24px;
    padding-right: 12px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .logo-text-full {
    width: 203.32px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading-container,
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 24px;
  }

  .loading-text,
  .error-text {
    color: #666d80;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    text-align: center;
  }

  .error-text {
    color: #d32f2f;
  }

  .character-edit-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
    width: 100%;
  }

  .header-section {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .page-title {
    color: black;
    font-size: 36px;
    font-family: Quicksand;
    font-weight: 700;
    line-height: 50.4px;
  }

  .form-sections {
    display: flex;
    gap: 24px;
    width: 100%;
  }

  .left-column-container {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .frame-1410104032-right {
    flex: 1 1 0;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    gap: 24px;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    background: white;
    border: 1px solid #DCDCDC;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0px 4px 4px rgba(98.89, 98.89, 98.89, 0.25);
  }

  .back-button:hover {
    background: #f8f8f8;
    box-shadow: 0px 6px 8px rgba(98.89, 98.89, 98.89, 0.3);
  }

  .arrowleft {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .arrowleft img {
    width: 18px;
    height: 15px;
    object-fit: contain;
  }


  .footer {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding-top: 24px;
  }

  .contact-us {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    text-align: center;
  }

  .footer-divider {
    width: 100%;
    height: 1px;
    background: #EDEDED;
  }

  .footer-links {
    display: flex;
    gap: 24px;
  }

  .footer-link {
    color: #141414;
    font-size: 18px;
    font-family: Nunito;
    font-weight: 400;
    line-height: 25.2px;
    cursor: pointer;
  }

  .footer-link:hover {
    text-decoration: underline;
  }

  /* Import all styles from step 1 - copying key styles here instead */
  /* Character creation form styles from step 1 */
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

  .frame-1410103822 {
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 16px;
    display: inline-flex;
  }

  .uploadsimple {
    width: 32px;
    height: 32px;
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

  .checklist-container {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
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
    cursor: pointer;
    border: none;
  }

  .button_01:hover {
    background: #f8f8f8;
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

  .frame-1410104032 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 24px;
    display: inline-flex;
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

  .frame-1410104039 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
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

  .form_03 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103942 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  .frame-1410104040 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 4px;
    display: flex;
  }

  .frame-1410103823 {
    align-self: stretch;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: 8px;
    display: flex;
  }

  /* Image upload styles */
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
    cursor: pointer;
    transition: all 0.3s ease;
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
    max-height: 300px;
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

  /* Notification styles */
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

  @media (max-width: 800px) {
    .character-edit-container {
      padding: 24px 20px 40px 20px;
      gap: 32px;
    }

    .form-sections {
      flex-direction: column;
    }

    .left-column-container,
    .frame-1410104032-right {
      width: 100%;
    }

    .page-title {
      font-size: 28px;
      line-height: 39.2px;
    }

    .style-selection-container {
      flex-direction: column;
    }

    .action-buttons {
      flex-direction: column;
    }

    .button-fill {
      width: 100%;
    }
  }
</style>
