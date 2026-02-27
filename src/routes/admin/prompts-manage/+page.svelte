<script lang="ts">
  import { MessageSquareText } from 'lucide-svelte';
  import {
    buildIntersearchScenePrompt,
    buildIntersearchSearchAdventurePrompt,
    buildStoryScenePrompt,
    buildStoryTextPrompt,
    buildTemplateCompositeCoverPrompt,
    type StoryAdventureCoverPromptOptions
  } from '$lib/promptBuilder';

  type PromptSection = 'story-cover' | 'story-text' | 'story-images';

  const sections: { key: PromptSection; label: string }[] = [
    {
      key: 'story-cover',
      label: 'Story Cover'
    },
    {
      key: 'story-text',
      label: 'Story Text'
    },
    {
      key: 'story-images',
      label: 'Story Images'
    }
  ];

  const sectionContent: Record<Exclude<PromptSection, 'story-cover'>, string> = {
    'story-text': 'Story text option content.',
    'story-images': 'Story images option content.'
  };

  const sampleStoryTitles = [
    'Luna and the Secret Moonlight Forest',
    'Captain Milo and the Starship of Wonders',
    'Nia and the Hidden Pearl Kingdom'
  ];

  const baseCoverPromptOptions: Omit<StoryAdventureCoverPromptOptions, 'storyTitle'> = {
    characterName: 'Luna',
    characterType: 'person',
    characterStyle: 'cartoon',
    storyWorld: 'enchantedForest',
    adventureType: 'Treasure Hunt',
    ageGroup: '7-10'
  };

  type StoryTextFormat = 'adventure' | 'interactive';
  type StoryTextWorld = 'enchanted-forest' | 'outer-space' | 'underwater-kingdom';
  type StoryTextDifficulty = 'easy' | 'medium' | 'hard';
  type StoryImagePlacement = 'left-half' | 'center' | 'right-half';

  const storyTextThemeOptions: { value: string; label: string; ageGroups: string[] }[] = [
    {
      value: 'kindnessEmpathy',
      label: 'Kindness & Empathy',
      ageGroups: ['3-6']
    },
    {
      value: 'bedtimeRoutineSleepHygiene',
      label: 'Bedtime Routine & Sleep Hygiene',
      ageGroups: ['7-10']
    }
  ];

  const storyTextWorldOptions: { value: StoryTextWorld; label: string }[] = [
    { value: 'enchanted-forest', label: 'Enchanted Forest' },
    { value: 'outer-space', label: 'Outer Space' },
    { value: 'underwater-kingdom', label: 'Underwater Kingdom' }
  ];

  const interactiveSceneTitles: Record<StoryTextWorld, string[]> = {
    'enchanted-forest': [
      'The Magical Forest',
      'The Enchanted Castle',
      'The Crystal Cave',
      'The Rainbow Meadow'
    ],
    'outer-space': [
      'The Cosmic Station',
      'The Alien Planet',
      'The Asteroid Field',
      'The Nebula Garden'
    ],
    'underwater-kingdom': [
      'The Coral Reef',
      'The Sunken Palace',
      'The Pearl Cave',
      'The Kelp Forest'
    ]
  };

  const interactiveSceneInfo: Record<
    StoryTextWorld,
    Array<{
      sceneDescription: string;
      characterAction: string;
      characterEmotion: string;
      storyContext: string;
    }>
  > = {
    'enchanted-forest': [
      {
        sceneDescription:
          'A magical forest filled with ancient trees, glowing mushrooms, and gentle creatures.',
        characterAction: 'Waving cheerfully to forest creatures',
        characterEmotion: 'Happy and welcoming',
        storyContext: 'The adventure starts as Luna enters the enchanted forest.'
      },
      {
        sceneDescription:
          'An enchanted castle with floating lights, magical windows, and a mystery to solve.',
        characterAction: 'Running excitedly through castle pathways',
        characterEmotion: 'Excited and curious',
        storyContext: 'Luna explores the castle searching for hidden clues.'
      },
      {
        sceneDescription:
          'A crystal cave with sparkling walls and hidden corners full of magical details.',
        characterAction: 'Hiding playfully behind crystal formations',
        characterEmotion: 'Playful and adventurous',
        storyContext: 'Luna navigates the cave to uncover the next quest hint.'
      },
      {
        sceneDescription:
          'A rainbow meadow with colorful flowers and magical friends celebrating nearby.',
        characterAction: 'Celebrating with a joyful victory pose',
        characterEmotion: 'Triumphant and joyful',
        storyContext: 'Luna completes the quest and celebrates with new friends.'
      }
    ],
    'outer-space': [
      {
        sceneDescription:
          'A cosmic station with floating platforms, bright stars, and friendly aliens.',
        characterAction: 'Waving to friendly aliens and robots',
        characterEmotion: 'Happy and welcoming',
        storyContext: 'Luna arrives at the cosmic station to begin a space adventure.'
      },
      {
        sceneDescription:
          'A colorful alien planet with floating rocks, strange plants, and multiple moons.',
        characterAction: 'Running and exploring the alien landscape',
        characterEmotion: 'Excited and curious',
        storyContext: 'Luna explores the planet while searching for hidden objects.'
      },
      {
        sceneDescription:
          'An asteroid field with glowing particles and winding paths between space rocks.',
        characterAction: 'Hiding behind asteroids while navigating',
        characterEmotion: 'Playful and adventurous',
        storyContext: 'Luna carefully moves through the asteroid field to find a clue.'
      },
      {
        sceneDescription:
          'A nebula garden with swirling colors and bright stars creating a magical sky.',
        characterAction: 'Celebrating with a joyful victory pose among the stars',
        characterEmotion: 'Triumphant and joyful',
        storyContext: 'Luna completes the mission and celebrates in the nebula garden.'
      }
    ],
    'underwater-kingdom': [
      {
        sceneDescription:
          'A vibrant coral reef with glowing fish, bubbles, and soft beams of light.',
        characterAction: 'Waving to friendly sea creatures',
        characterEmotion: 'Happy and welcoming',
        storyContext: 'Luna enters the underwater kingdom and begins exploring.'
      },
      {
        sceneDescription:
          'A sunken palace with ancient architecture, shimmering pearls, and sea gardens.',
        characterAction: 'Swimming excitedly through palace corridors',
        characterEmotion: 'Excited and curious',
        storyContext: 'Luna discovers the palace and searches for hidden treasures.'
      },
      {
        sceneDescription:
          'A pearl cave filled with glowing gems and winding passages of sparkling water.',
        characterAction: 'Hiding playfully behind pearl formations',
        characterEmotion: 'Playful and adventurous',
        storyContext: 'Luna explores the cave to uncover the final clue.'
      },
      {
        sceneDescription:
          'A kelp forest with swaying sea plants and colorful creatures celebrating together.',
        characterAction: 'Celebrating with a joyful victory pose underwater',
        characterEmotion: 'Triumphant and joyful',
        storyContext: 'Luna finishes the journey and celebrates with underwater friends.'
      }
    ]
  };

  let activeSection: PromptSection = 'story-cover';
  let selectedStoryTitle = sampleStoryTitles[0];
  let isEditingStoryCoverPrompt = false;
  let storyCoverPromptBeforeEdit = '';
  let storyCoverPromptDraft = '';
  let generatedStoryCoverPrompt = '';
  let storyCoverPrompt = '';
  let storyCoverPromptError: string | null = null;
  let selectedStoryTextFormat: StoryTextFormat = 'adventure';
  let selectedStoryTextWorld: StoryTextWorld = 'enchanted-forest';
  let selectedStoryTextTheme = storyTextThemeOptions[0].value;
  let selectedStoryTextAgeGroup = storyTextThemeOptions[0].ageGroups[0];
  let selectedStoryTextDifficulty: StoryTextDifficulty = 'medium';
  let selectedStoryTextSceneNumber = 1;
  let isEditingStoryTextPrompt = false;
  let storyTextPromptBeforeEdit = '';
  let storyTextPromptDraft = '';
  let generatedStoryTextPrompt = '';
  let storyTextPrompt = '';
  let storyTextPromptError: string | null = null;
  let selectedStoryImageWorld: StoryTextWorld = 'enchanted-forest';
  let selectedStoryImagePageNumber = 1;
  let selectedStoryImagePlacement: StoryImagePlacement = 'center';
  let isEditingStoryImagePrompt = false;
  let storyImagePromptBeforeEdit = '';
  let storyImagePromptDraft = '';
  let generatedStoryImagePrompt = '';
  let storyImagePrompt = '';
  let storyImagePromptError: string | null = null;

  $: activeContent = sectionContent[activeSection as Exclude<PromptSection, 'story-cover'>] ?? '';
  $: selectedStoryTextThemeOption =
    storyTextThemeOptions.find((theme) => theme.value === selectedStoryTextTheme) ||
    storyTextThemeOptions[0];
  $: storyTextAgeGroupOptions = selectedStoryTextThemeOption.ageGroups;

  $: if (!storyTextAgeGroupOptions.includes(selectedStoryTextAgeGroup)) {
    selectedStoryTextAgeGroup = storyTextAgeGroupOptions[0];
  }

  $: {
    try {
      generatedStoryCoverPrompt = buildTemplateCompositeCoverPrompt({
        ...baseCoverPromptOptions,
        storyTitle: selectedStoryTitle
      });
      if (!isEditingStoryCoverPrompt) {
        storyCoverPrompt = generatedStoryCoverPrompt;
      }
      storyCoverPromptError = null;
    } catch (error) {
      generatedStoryCoverPrompt = '';
      storyCoverPrompt = '';
      storyCoverPromptError =
        error instanceof Error ? error.message : 'Failed to build story cover prompt.';
    }
  }

  $: {
    try {
      const pageTextSamples: Record<number, string> = {
        1: `${selectedStoryTitle} begins with Luna stepping into a magical new world full of wonder.`,
        2: `Luna meets a friendly guide and starts exploring deeper into the adventure.`,
        3: `A challenge appears, and Luna bravely uses creativity to keep moving forward.`,
        4: `Luna overcomes the challenge and helps friends around her with kindness and courage.`,
        5: `The journey ends with a peaceful celebration and a warm, bedtime-ready feeling.`
      };

      const pageSceneSamples: Record<number, string> = {
        1: 'A welcoming scene that introduces the world and the first spark of adventure.',
        2: 'A discovery scene with friendly companion interaction and forward movement.',
        3: 'A challenge scene with clear action and emotional intensity.',
        4: 'A triumph scene showing progress, connection, and positive transformation.',
        5: 'A calm closure scene with safety, comfort, and reflective mood.'
      };

      const pageActionSamples: Record<number, string> = {
        1: 'looking around with wonder',
        2: 'walking beside a trusted guide',
        3: 'facing the challenge with courage',
        4: 'celebrating quietly with friends',
        5: 'settling down peacefully'
      };

      const pageEmotionSamples: Record<number, string> = {
        1: 'curious and hopeful',
        2: 'excited and attentive',
        3: 'brave and focused',
        4: 'proud and joyful',
        5: 'safe and sleepy'
      };

      generatedStoryImagePrompt = buildStoryScenePrompt({
        characterName: 'Luna',
        characterType: 'person',
        specialAbility: 'magic casting',
        characterStyle: 'cartoon',
        storyWorld: selectedStoryImageWorld,
        adventureType: 'Treasure Hunt',
        ageGroup: '7-10',
        storyTitle: selectedStoryTitle,
        pageNumber: selectedStoryImagePageNumber,
        pageText:
          pageTextSamples[selectedStoryImagePageNumber] ||
          pageTextSamples[1],
        pageSceneDescription:
          pageSceneSamples[selectedStoryImagePageNumber] ||
          pageSceneSamples[1],
        pageCharacterAction:
          pageActionSamples[selectedStoryImagePageNumber] ||
          pageActionSamples[1],
        pageEmotion:
          pageEmotionSamples[selectedStoryImagePageNumber] ||
          pageEmotionSamples[1],
        companionCharacters: 'Fox',
        characterPlacement: selectedStoryImagePlacement
      });

      if (!isEditingStoryImagePrompt) {
        storyImagePrompt = generatedStoryImagePrompt;
      }
      storyImagePromptError = null;
    } catch (error) {
      generatedStoryImagePrompt = '';
      storyImagePrompt = '';
      storyImagePromptError =
        error instanceof Error ? error.message : 'Failed to build story image prompt.';
    }
  }

  function getReadingLevelFromAgeGroup(ageGroup: string): string {
    if (ageGroup === '3-6') return 'early_reader';
    if (ageGroup === '11-12') return 'independent_reader';
    return 'developing_reader';
  }

  function getAgeGroupFromDifficulty(difficulty: StoryTextDifficulty): string {
    if (difficulty === 'easy') return '3-6';
    if (difficulty === 'hard') return '11-12';
    return '7-10';
  }

  $: {
    try {
      if (selectedStoryTextFormat === 'adventure') {
        generatedStoryTextPrompt = buildStoryTextPrompt({
          characterName: 'Luna',
          characterType: 'person',
          specialAbility: 'magic casting',
          characterStyle: 'cartoon',
          storyWorld: selectedStoryTextWorld,
          adventureType: 'Treasure Hunt',
          occasionTheme: 'general',
          ageGroup: selectedStoryTextAgeGroup,
          readingLevel: getReadingLevelFromAgeGroup(selectedStoryTextAgeGroup),
          storyTitle: selectedStoryTitle,
          pageNumber: 1,
          storyTheme: selectedStoryTextTheme
        });
      } else {
        const sceneIndex = Math.max(0, Math.min(3, selectedStoryTextSceneNumber - 1));
        const sceneTitle = interactiveSceneTitles[selectedStoryTextWorld][sceneIndex];
        const sceneInfo = interactiveSceneInfo[selectedStoryTextWorld][sceneIndex];
        const ageGroup = getAgeGroupFromDifficulty(selectedStoryTextDifficulty);

        const scenePrompt = buildIntersearchScenePrompt({
          sceneNumber: selectedStoryTextSceneNumber,
          storyTitle: selectedStoryTitle,
          storyWorld: selectedStoryTextWorld,
          characterName: 'Luna',
          characterType: 'person',
          characterStyle: 'cartoon',
          specialAbility: 'magic casting',
          ageGroup,
          sceneTitle,
          sceneDescription: sceneInfo.sceneDescription,
          characterActionForScene: sceneInfo.characterAction,
          characterEmotionForScene: sceneInfo.characterEmotion,
          storyContinuationForThisScene: sceneInfo.storyContext
        });

        const searchAdventurePrompt = buildIntersearchSearchAdventurePrompt({
          characterName: 'Luna',
          characterType: 'person',
          characterDescription: 'magic casting',
          characterStyle: 'cartoon',
          storyWorld: selectedStoryTextWorld,
          storyTitle: selectedStoryTitle,
          ageGroup,
          specialAbility: 'magic casting',
          difficulty: selectedStoryTextDifficulty,
          sceneNumber: selectedStoryTextSceneNumber
        });

        generatedStoryTextPrompt = `${scenePrompt}\n\n${searchAdventurePrompt}`;
      }

      if (!isEditingStoryTextPrompt) {
        storyTextPrompt = generatedStoryTextPrompt;
      }
      storyTextPromptError = null;
    } catch (error) {
      generatedStoryTextPrompt = '';
      storyTextPrompt = '';
      storyTextPromptError =
        error instanceof Error ? error.message : 'Failed to build story text prompt.';
    }
  }

  function startEditingStoryCoverPrompt() {
    if (storyCoverPromptError) return;
    storyCoverPromptBeforeEdit = storyCoverPrompt;
    storyCoverPromptDraft = storyCoverPrompt;
    isEditingStoryCoverPrompt = true;
  }

  function saveStoryCoverPromptEdit() {
    storyCoverPrompt = storyCoverPromptDraft;
    isEditingStoryCoverPrompt = false;
  }

  function cancelStoryCoverPromptEdit() {
    storyCoverPrompt = storyCoverPromptBeforeEdit;
    isEditingStoryCoverPrompt = false;
  }

  function startEditingStoryTextPrompt() {
    if (storyTextPromptError) return;
    storyTextPromptBeforeEdit = storyTextPrompt;
    storyTextPromptDraft = storyTextPrompt;
    isEditingStoryTextPrompt = true;
  }

  function saveStoryTextPromptEdit() {
    storyTextPrompt = storyTextPromptDraft;
    isEditingStoryTextPrompt = false;
  }

  function cancelStoryTextPromptEdit() {
    storyTextPrompt = storyTextPromptBeforeEdit;
    isEditingStoryTextPrompt = false;
  }

  function startEditingStoryImagePrompt() {
    if (storyImagePromptError) return;
    storyImagePromptBeforeEdit = storyImagePrompt;
    storyImagePromptDraft = storyImagePrompt;
    isEditingStoryImagePrompt = true;
  }

  function saveStoryImagePromptEdit() {
    storyImagePrompt = storyImagePromptDraft;
    isEditingStoryImagePrompt = false;
  }

  function cancelStoryImagePromptEdit() {
    storyImagePrompt = storyImagePromptBeforeEdit;
    isEditingStoryImagePrompt = false;
  }
</script>

<svelte:head>
  <title>Prompts Manage - Admin</title>
</svelte:head>

<div class="prompts-manage-page">
  <div class="page-header">
    <h1 class="page-title">
      <MessageSquareText size={28} />
      Prompts Manage
    </h1>
    <p class="page-description">Configure and maintain prompt templates for the platform.</p>
  </div>

  <div class="switcher-card">
    <div class="section-switch" role="tablist" aria-label="Prompt sections">
      {#each sections as section}
        <button
          type="button"
          class:active={activeSection === section.key}
          role="tab"
          aria-selected={activeSection === section.key}
          on:click={() => (activeSection = section.key)}
        >
          {section.label}
        </button>
      {/each}
    </div>

    {#if activeSection === 'story-cover'}
      <div class="section-content">
        <div class="story-title-container">
          <p class="content-title">Sample Story Titles</p>
          <div class="title-options">
            {#each sampleStoryTitles as storyTitle}
              <button
                type="button"
                class:title-active={selectedStoryTitle === storyTitle}
                on:click={() => (selectedStoryTitle = storyTitle)}
              >
                {storyTitle}
              </button>
            {/each}
          </div>
        </div>

        <div class="story-title-container">
          <p class="content-title prompt-title">
            Story Cover Prompt (same as create-character/7 API input)
          </p>
  
          {#if storyCoverPromptError}
            <p class="error-text">{storyCoverPromptError}</p>
          {:else}
            <div class="prompt-editor">
              <div class="prompt-editor-header">
                <p class="editor-label">Prompt</p>
                {#if !isEditingStoryCoverPrompt}
                  <button type="button" class="edit-button" on:click={startEditingStoryCoverPrompt}>
                    Edit
                  </button>
                {/if}
              </div>

              {#if isEditingStoryCoverPrompt}
                <textarea
                  class="prompt-textarea"
                  bind:value={storyCoverPromptDraft}
                  spellcheck="false"
                ></textarea>
                <div class="prompt-edit-actions">
                  <button type="button" class="save-button" on:click={saveStoryCoverPromptEdit}>
                    Save
                  </button>
                  <button
                    type="button"
                    class="cancel-button"
                    on:click={cancelStoryCoverPromptEdit}
                  >
                    Cancel
                  </button>
                </div>
              {:else}
                <pre class="prompt-preview">{storyCoverPrompt}</pre>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {:else if activeSection === 'story-text'}
      <div class="section-content">
        <div class="story-title-container">
          <p class="content-title">Sample Story Titles</p>
          <div class="title-options">
            {#each sampleStoryTitles as storyTitle}
              <button
                type="button"
                class:title-active={selectedStoryTitle === storyTitle}
                on:click={() => (selectedStoryTitle = storyTitle)}
              >
                {storyTitle}
              </button>
            {/each}
          </div>
        </div>

        <div class="story-title-container">
          <p class="content-title">Story Text Variables</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>Format</span>
              <select bind:value={selectedStoryTextFormat}>
                <option value="adventure">Adventure Story</option>
                <option value="interactive">Interactive Search Story</option>
              </select>
            </label>

            <label class="control-field">
              <span>World</span>
              <select bind:value={selectedStoryTextWorld}>
                {#each storyTextWorldOptions as worldOption}
                  <option value={worldOption.value}>{worldOption.label}</option>
                {/each}
              </select>
            </label>

            {#if selectedStoryTextFormat === 'adventure'}
              <label class="control-field">
                <span>Theme</span>
                <select bind:value={selectedStoryTextTheme}>
                  {#each storyTextThemeOptions as themeOption}
                    <option value={themeOption.value}>{themeOption.label}</option>
                  {/each}
                </select>
              </label>

              <label class="control-field">
                <span>Age Group</span>
                <select bind:value={selectedStoryTextAgeGroup}>
                  {#each storyTextAgeGroupOptions as ageGroupOption}
                    <option value={ageGroupOption}>{ageGroupOption}</option>
                  {/each}
                </select>
              </label>
            {:else}
              <label class="control-field">
                <span>Difficulty</span>
                <select bind:value={selectedStoryTextDifficulty}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>

              <label class="control-field">
                <span>Scene</span>
                <select bind:value={selectedStoryTextSceneNumber}>
                  <option value={1}>Scene 1</option>
                  <option value={2}>Scene 2</option>
                  <option value={3}>Scene 3</option>
                  <option value={4}>Scene 4</option>
                </select>
              </label>
            {/if}
          </div>
        </div>

        <div class="story-title-container">
          <p class="content-title prompt-title">Story Text Prompt Preview</p>

          {#if storyTextPromptError}
            <p class="error-text">{storyTextPromptError}</p>
          {:else}
            <div class="prompt-editor">
              <div class="prompt-editor-header">
                <p class="editor-label">Prompt</p>
                {#if !isEditingStoryTextPrompt}
                  <button type="button" class="edit-button" on:click={startEditingStoryTextPrompt}>
                    Edit
                  </button>
                {/if}
              </div>

              {#if isEditingStoryTextPrompt}
                <textarea
                  class="prompt-textarea"
                  bind:value={storyTextPromptDraft}
                  spellcheck="false"
                ></textarea>
                <div class="prompt-edit-actions">
                  <button type="button" class="save-button" on:click={saveStoryTextPromptEdit}>
                    Save
                  </button>
                  <button
                    type="button"
                    class="cancel-button"
                    on:click={cancelStoryTextPromptEdit}
                  >
                    Cancel
                  </button>
                </div>
              {:else}
                <pre class="prompt-preview">{storyTextPrompt}</pre>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {:else if activeSection === 'story-images'}
      <div class="section-content">
        <div class="story-title-container">
          <p class="content-title">Sample Story Titles</p>
          <div class="title-options">
            {#each sampleStoryTitles as storyTitle}
              <button
                type="button"
                class:title-active={selectedStoryTitle === storyTitle}
                on:click={() => (selectedStoryTitle = storyTitle)}
              >
                {storyTitle}
              </button>
            {/each}
          </div>
        </div>

        <div class="story-title-container">
          <p class="content-title">Story Image Variables (single image instance)</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>World</span>
              <select bind:value={selectedStoryImageWorld}>
                {#each storyTextWorldOptions as worldOption}
                  <option value={worldOption.value}>{worldOption.label}</option>
                {/each}
              </select>
            </label>

            <label class="control-field">
              <span>Page</span>
              <select bind:value={selectedStoryImagePageNumber}>
                <option value={1}>Page 1</option>
                <option value={2}>Page 2</option>
                <option value={3}>Page 3</option>
                <option value={4}>Page 4</option>
                <option value={5}>Page 5</option>
              </select>
            </label>

            <label class="control-field">
              <span>Character Placement</span>
              <select bind:value={selectedStoryImagePlacement}>
                <option value="left-half">Left Half</option>
                <option value="center">Center</option>
                <option value="right-half">Right Half</option>
              </select>
            </label>
          </div>
        </div>

        <div class="story-title-container">
          <p class="content-title prompt-title">Story Image Prompt Preview (one image)</p>
          {#if storyImagePromptError}
            <p class="error-text">{storyImagePromptError}</p>
          {:else}
            <div class="prompt-editor">
              <div class="prompt-editor-header">
                <p class="editor-label">Prompt</p>
                {#if !isEditingStoryImagePrompt}
                  <button type="button" class="edit-button" on:click={startEditingStoryImagePrompt}>
                    Edit
                  </button>
                {/if}
              </div>

              {#if isEditingStoryImagePrompt}
                <textarea
                  class="prompt-textarea"
                  bind:value={storyImagePromptDraft}
                  spellcheck="false"
                ></textarea>
                <div class="prompt-edit-actions">
                  <button type="button" class="save-button" on:click={saveStoryImagePromptEdit}>
                    Save
                  </button>
                  <button
                    type="button"
                    class="cancel-button"
                    on:click={cancelStoryImagePromptEdit}
                  >
                    Cancel
                  </button>
                </div>
              {:else}
                <pre class="prompt-preview">{storyImagePrompt}</pre>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="section-content">
        <p>{activeContent}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .prompts-manage-page {
    width: 100%;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .page-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
    margin: 0 0 0.25rem 0;
  }

  .page-description {
    margin: 0;
    color: #6b7280;
    font-size: 0.9375rem;
  }

  .switcher-card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    border: 1px solid #e5e7eb;
  }

  .section-switch {
    display: inline-flex;
    gap: 0.5rem;
    background: #f3f4f6;
    padding: 0.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .section-switch button {
    border: none;
    background: transparent;
    color: #4b5563;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.5rem 0.8rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .section-switch button:hover {
    color: #111827;
  }

  .section-switch button.active {
    background: #ffffff;
    color: #111827;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .section-content p {
    margin: 0;
    color: #4b5563;
    font-size: 0.9375rem;
  }

  .story-title-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .content-title {
    color: #111827;
    font-weight: 600;
    margin-bottom: 0.6rem;
  }

  .prompt-title {
    margin-top: 1rem;
  }

  .title-options {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }

  .title-options button {
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #1f2937;
    text-align: left;
    padding: 0.625rem 0.75rem;
    border-radius: 0.45rem;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .title-options button:hover {
    border-color: #9ca3af;
  }

  .title-options button.title-active {
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
    background: #eff6ff;
  }

  .prompt-preview {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.9rem;
    color: #111827;
    font-size: 0.82rem;
    line-height: 1.45;
    max-height: 420px;
    overflow: auto;
  }

  .prompt-editor {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f9fafb;
    padding: 0.75rem;
  }

  .prompt-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .editor-label {
    margin: 0;
    color: #111827;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .edit-button,
  .save-button,
  .cancel-button {
    border-radius: 0.375rem;
    border: 1px solid #d1d5db;
    background: #ffffff;
    color: #111827;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.35rem 0.65rem;
    cursor: pointer;
  }

  .edit-button:hover,
  .cancel-button:hover {
    background: #f3f4f6;
  }

  .save-button {
    border-color: #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .save-button:hover {
    background: #1d4ed8;
  }

  .prompt-textarea {
    width: 100%;
    min-height: 240px;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.75rem;
    font-size: 0.82rem;
    line-height: 1.45;
    color: #111827;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
      'Courier New', monospace;
    resize: vertical;
    background: #ffffff;
  }

  .prompt-edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.65rem;
  }

  .error-text {
    margin: 0;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .story-prompt-controls {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .control-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .control-field span {
    color: #374151;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .control-field select {
    border: 1px solid #d1d5db;
    border-radius: 0.45rem;
    padding: 0.5rem 0.625rem;
    color: #111827;
    background: #ffffff;
    font-size: 0.875rem;
  }
</style>
