<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { MessageSquareText } from 'lucide-svelte';
  import {
    buildEnhancementPrompt,
    buildTemplateCompositeCoverPrompt
  } from '$lib/promptBuilder';
  import {
    buildStoryPagePrompt,
    generateCharacterAction,
    generateSceneDescription
  } from '$lib/storyGenerationHelpers';
  import { buildStoryTitlePrompt } from '$lib/api/storyTitles';
  import {
    getAdminPrompts,
    resetAdminPrompt,
    updateAdminPrompt,
    type PromptDocument,
    type PromptFileKey
  } from '$lib/api/prompts';
  import {
    getPrompt1Data,
    getPromptImageData,
    getFallbackPromptDocument,
    getPromptDocumentsSnapshot,
    setRuntimePromptDocument,
    setRuntimePromptDocuments
  } from '$lib/promptRuntime';

  type PromptSection =
    | 'character-enhancement'
    | 'cover-image'
    | 'story-image'
    | 'interactive-character';
  type CharacterStyle = '3d' | 'cartoon' | 'anime';
  type CharacterGender = 'female' | 'male' | 'neutral';
  type EnhancementLevel = 'minimal' | 'normal' | 'high';
  type StoryWorld = 'enchanted-forest' | 'outer-space' | 'underwater-kingdom';
  type Difficulty = 'easy' | 'medium' | 'hard';

  type SourcePrompt = {
    title: string;
    source: string;
    fileKey: PromptFileKey;
    keyPath: string[];
    editKey: string;
    value: string;
    draftValue: string;
    isDirty: boolean;
    editorMode: 'text' | 'json';
  };

  const sections: { key: PromptSection; label: string; description: string }[] = [
    {
      key: 'character-enhancement',
      label: 'Character Enhancement Prompts',
      description: 'Prompts used on /create-character/2 for enhancing the uploaded character.'
    },
    {
      key: 'cover-image',
      label: 'Cover Image Prompts',
      description: 'Prompts used on /create-character/7 for story cover image generation.'
    },
    {
      key: 'story-image',
      label: 'Story Image Prompts',
      description: 'Prompts used on /adventure-story/loading for story scene images.'
    },
    {
      key: 'interactive-character',
      label: 'Interactive Character Prompts',
      description: 'Prompts used for interactive search scenes and character replacement.'
    }
  ];

  const sampleStoryTitles = [
    'Luna and the Secret Moonlight Forest',
    'Captain Milo and the Starship of Wonders',
    'Nia and the Hidden Pearl Kingdom'
  ];

  const worldOptions: { value: StoryWorld; label: string }[] = [
    { value: 'enchanted-forest', label: 'Enchanted Forest' },
    { value: 'outer-space', label: 'Outer Space' },
    { value: 'underwater-kingdom', label: 'Underwater Kingdom' }
  ];

  const characterStyles: { value: CharacterStyle; label: string }[] = [
    { value: '3d', label: '3D' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'anime', label: 'Anime' }
  ];

  const characterGenders: { value: CharacterGender; label: string }[] = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'neutral', label: 'Neutral / Unspecified' }
  ];

  const enhancementLevels: { value: EnhancementLevel; label: string }[] = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' }
  ];

  const sceneSamples: Record<number, { text: string; description: string; action: string; emotion: string }> = {
    1: {
      text: 'Luna steps into a magical new world and notices a soft glow ahead.',
      description: 'A welcoming opening scene with a clear sense of discovery.',
      action: 'looking around with wonder',
      emotion: 'curious and hopeful'
    },
    2: {
      text: 'Luna meets a friendly guide and follows a sparkling path deeper into the adventure.',
      description: 'A discovery scene with companion interaction and forward movement.',
      action: 'walking beside a trusted guide',
      emotion: 'excited and attentive'
    },
    3: {
      text: 'A challenge appears, and Luna uses courage and creativity to keep moving forward.',
      description: 'A challenge scene with visible action and emotional focus.',
      action: 'facing the challenge with courage',
      emotion: 'brave and focused'
    },
    4: {
      text: 'Luna helps a friend and discovers that kindness can change the whole journey.',
      description: 'A warm triumph scene showing progress and connection.',
      action: 'helping a friend with care',
      emotion: 'proud and joyful'
    },
    5: {
      text: 'The journey ends peacefully as Luna feels safe, loved, and ready to rest.',
      description: 'A calm closing scene with bedtime warmth.',
      action: 'settling down peacefully',
      emotion: 'safe and sleepy'
    }
  };

  const interactiveSceneSamples: Record<
    number,
    { title: string; description: string; action: string; emotion: string; context: string }
  > = {
    1: {
      title: 'The Search Begins',
      description: 'A busy opening environment with many playful details to search through.',
      action: 'waving from a clever hiding place',
      emotion: 'happy and welcoming',
      context: 'The search adventure begins and the reader must find Luna in the scene.'
    },
    2: {
      title: 'The Hidden Path',
      description: 'A denser scene with paths, objects, and layered hiding opportunities.',
      action: 'peeking from behind a scene object',
      emotion: 'excited and curious',
      context: 'Luna moves deeper into the search world while staying partly hidden.'
    },
    3: {
      title: 'The Tricky Clue',
      description: 'A challenging search scene with more visual distractions and clues.',
      action: 'hiding playfully near an important clue',
      emotion: 'playful and adventurous',
      context: 'The reader follows clues to find Luna in a more difficult scene.'
    },
    4: {
      title: 'The Celebration Find',
      description: 'A joyful final search scene with a clear reward moment.',
      action: 'celebrating after being found',
      emotion: 'triumphant and joyful',
      context: 'The search ends with a successful discovery and celebration.'
    }
  };

  let activeSection: PromptSection = normalizePromptSection($page.url.searchParams.get('tab'));
  let selectedStoryTitle = sampleStoryTitles[0];
  let selectedCharacterStyle: CharacterStyle = 'cartoon';
  let selectedCharacterGender: CharacterGender = 'female';
  let selectedEnhancementLevel: EnhancementLevel = 'normal';
  let selectedCoverWorld: StoryWorld = 'enchanted-forest';
  let selectedStoryImageWorld: StoryWorld = 'enchanted-forest';
  let selectedStoryImagePageNumber = 1;
  let selectedInteractiveWorld: StoryWorld = 'enchanted-forest';
  let selectedInteractiveSceneNumber = 1;
  let selectedInteractiveDifficulty: Difficulty = 'medium';
  let activePromptPreview = '';
  let activePromptError: string | null = null;
  let promptsLoading = true;
  let loadError = '';
  let promptDocuments = getPromptDocumentsSnapshot() as Partial<Record<PromptFileKey, any>>;
  let promptDocumentMeta: Partial<Record<PromptFileKey, PromptDocument>> = {};
  let promptDrafts: Record<string, string> = {};
  let promptErrors: Record<string, string> = {};
  let promptMessages: Record<string, string> = {};
  let promptSaving: Record<string, boolean> = {};

  onMount(() => {
    void loadEditablePrompts();
  });

  function normalizePromptSection(value: string | null): PromptSection {
    if (
      value === 'cover-image' ||
      value === 'story-image' ||
      value === 'interactive-character' ||
      value === 'character-enhancement'
    ) {
      return value;
    }
    return 'character-enhancement';
  }

  function stringifyPromptValue(value: unknown): string {
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  }

  function cloneValue<T>(value: T): T {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value)) as T;
  }

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function mergePromptDefaults<T>(fallback: T, incoming: unknown): T {
    if (!isPlainObject(fallback) || !isPlainObject(incoming)) {
      return (incoming === undefined ? cloneValue(fallback) : incoming) as T;
    }

    const merged: Record<string, unknown> = cloneValue(fallback);
    for (const [key, value] of Object.entries(incoming)) {
      merged[key] = key in merged ? mergePromptDefaults(merged[key], value) : value;
    }
    return merged as T;
  }

  function getNestedValue(source: any, keyPath: string[]): unknown {
    return keyPath.reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
  }

  function setNestedValue(source: any, keyPath: string[], value: unknown): any {
    if (keyPath.length === 0) return value;
    const next = cloneValue(source);
    let current = next;
    for (const key of keyPath.slice(0, -1)) {
      current = current[key];
    }
    current[keyPath[keyPath.length - 1]] = value;
    return next;
  }

  function applyPromptDraftsToDocuments(): Partial<Record<PromptFileKey, any>> {
    let documents = cloneValue(promptDocuments);
    const editablePrompts = Object.values(getSourcePromptGroups({}, documents)).flat();

    for (const item of editablePrompts) {
      if (!(item.editKey in promptDrafts)) continue;
      const draftValue = promptDrafts[item.editKey];
      const parsedValue = item.editorMode === 'text' ? draftValue : JSON.parse(draftValue);
      documents = {
        ...documents,
        [item.fileKey]: setNestedValue(getPromptDocument(item.fileKey, documents), item.keyPath, parsedValue)
      };
    }

    return documents;
  }

  function withPreviewPromptDocuments<T>(buildPreview: () => T): T {
    const previewDocuments = applyPromptDraftsToDocuments();
    setRuntimePromptDocuments(previewDocuments);
    return buildPreview();
  }

  function formatPreviewSections(sections: Array<{ title: string; prompt: string }>): string {
    return sections
      .filter((section) => section.prompt && section.prompt.trim().length > 0)
      .map((section) => `### ${section.title}\n\n${section.prompt}`)
      .join('\n\n---\n\n');
  }

  function getPromptDocument(fileKey: PromptFileKey, documents = promptDocuments): any {
    if (fileKey === 'prompt1') return mergePromptDefaults(getFallbackPromptDocument('prompt1') || getPrompt1Data(), documents.prompt1);
    if (fileKey === 'prompt_image') return mergePromptDefaults(getFallbackPromptDocument('prompt_image') || getPromptImageData(), documents.prompt_image);
    return documents.backend_prompts || {};
  }

  function sourcePrompt(
    title: string,
    source: string,
    fileKey: PromptFileKey,
    keyPath: string[],
    drafts: Record<string, string>,
    documents: Partial<Record<PromptFileKey, any>>
  ): SourcePrompt {
    const value = getNestedValue(getPromptDocument(fileKey, documents), keyPath);
    const editKey = `${fileKey}:${keyPath.join('.')}`;
    const renderedValue = stringifyPromptValue(value ?? '');
    const draftValue = drafts[editKey] ?? renderedValue;
    return {
      title,
      source,
      fileKey,
      keyPath,
      editKey,
      value: renderedValue,
      draftValue,
      isDirty: draftValue !== renderedValue,
      editorMode: typeof value === 'string' ? 'text' : 'json'
    };
  }

  function getPromptEditorValue(item: SourcePrompt): string {
    return promptDrafts[item.editKey] ?? item.draftValue;
  }

  function updatePromptDraft(item: SourcePrompt, event: Event) {
    const target = event.currentTarget as HTMLTextAreaElement;
    promptDrafts = { ...promptDrafts, [item.editKey]: target.value };
    promptErrors = { ...promptErrors, [item.editKey]: '' };
    promptMessages = { ...promptMessages, [item.editKey]: '' };
  }

  function isPromptDirty(item: SourcePrompt): boolean {
    return item.isDirty;
  }

  function parsePromptEditorValue(item: SourcePrompt): unknown {
    const value = getPromptEditorValue(item);
    if (item.editorMode === 'text') return value;
    return JSON.parse(value);
  }

  function syncPromptDocumentsFromRows(documents: PromptDocument[]) {
    const mapped = documents.reduce<Partial<Record<PromptFileKey, unknown>>>((acc, document) => {
      acc[document.file_key] = document.content;
      return acc;
    }, {});
    promptDocuments = {
      ...promptDocuments,
      ...mapped
    };
    promptDocumentMeta = documents.reduce<Partial<Record<PromptFileKey, PromptDocument>>>((acc, document) => {
      acc[document.file_key] = document;
      return acc;
    }, {});
    setRuntimePromptDocuments(mapped);
  }

  async function loadEditablePrompts() {
    promptsLoading = true;
    loadError = '';
    const result = await getAdminPrompts();
    if (result.success) {
      if (result.documents?.length) {
        syncPromptDocumentsFromRows(result.documents);
      } else if (result.data) {
        promptDocuments = { ...promptDocuments, ...result.data };
        setRuntimePromptDocuments(result.data);
      }
    } else {
      loadError = result.error || 'Failed to load prompts. Showing bundled fallback prompts.';
    }
    promptsLoading = false;
  }

  function cancelPromptEdit(item: SourcePrompt) {
    promptDrafts = { ...promptDrafts, [item.editKey]: item.value };
    promptErrors = { ...promptErrors, [item.editKey]: '' };
    promptMessages = { ...promptMessages, [item.editKey]: '' };
  }

  async function savePromptItem(item: SourcePrompt) {
    let parsedValue: unknown;
    try {
      parsedValue = parsePromptEditorValue(item);
    } catch (error) {
      promptErrors = { ...promptErrors, [item.editKey]: 'Invalid JSON. Fix the value before saving.' };
      return;
    }

    promptSaving = { ...promptSaving, [item.editKey]: true };
    promptErrors = { ...promptErrors, [item.editKey]: '' };
    promptMessages = { ...promptMessages, [item.editKey]: '' };

    const result = await updateAdminPrompt(item.fileKey, item.keyPath, parsedValue, getPromptDocument(item.fileKey));
    if (result.success && result.document) {
      setRuntimePromptDocument(result.document);
      promptDocuments = {
        ...promptDocuments,
        [item.fileKey]: result.document.content
      };
      promptDocumentMeta = {
        ...promptDocumentMeta,
        [item.fileKey]: result.document
      };
      const updatedValue = getNestedValue(result.document.content, item.keyPath);
      promptDrafts = { ...promptDrafts, [item.editKey]: stringifyPromptValue(updatedValue ?? '') };
      promptMessages = { ...promptMessages, [item.editKey]: 'Saved.' };
    } else if (result.success) {
      const updatedDocument = setNestedValue(getPromptDocument(item.fileKey), item.keyPath, parsedValue);
      promptDocuments = { ...promptDocuments, [item.fileKey]: updatedDocument };
      setRuntimePromptDocuments({ [item.fileKey]: updatedDocument });
      promptDrafts = { ...promptDrafts, [item.editKey]: stringifyPromptValue(parsedValue) };
      promptMessages = { ...promptMessages, [item.editKey]: 'Saved.' };
    } else {
      promptErrors = { ...promptErrors, [item.editKey]: result.error || 'Failed to save prompt.' };
    }
    promptSaving = { ...promptSaving, [item.editKey]: false };
  }

  async function resetPromptFile(item: SourcePrompt) {
    if (!window.confirm(`Reset ${item.fileKey} to the bundled JSON default? This affects the whole prompt document.`)) {
      return;
    }

    const resetKey = `reset:${item.fileKey}`;
    promptSaving = { ...promptSaving, [resetKey]: true };
    const result = await resetAdminPrompt(item.fileKey, getFallbackPromptDocument(item.fileKey));
    if (result.success && result.document) {
      setRuntimePromptDocument(result.document);
      promptDocuments = { ...promptDocuments, [item.fileKey]: result.document.content };
      promptDocumentMeta = { ...promptDocumentMeta, [item.fileKey]: result.document };
      promptDrafts = {};
      promptMessages = { ...promptMessages, [item.editKey]: `${item.fileKey} reset to default.` };
      promptErrors = { ...promptErrors, [item.editKey]: '' };
    } else {
      promptErrors = { ...promptErrors, [item.editKey]: result.error || 'Failed to reset prompt document.' };
    }
    promptSaving = { ...promptSaving, [resetKey]: false };
  }

  function setActiveSection(section: PromptSection) {
    activeSection = section;
    void goto(`/admin/prompts-manage?tab=${section}`, {
      replaceState: true,
      noScroll: true,
      keepFocus: true
    });
  }

  function toBuilderWorld(world: StoryWorld): string {
    return world;
  }

  function getAgeGroupFromDifficulty(difficulty: Difficulty): string {
    if (difficulty === 'easy') return '3-6';
    if (difficulty === 'hard') return '11-12';
    return '7-10';
  }

  function getPersonSuitPrompt(): string {
    const imageGeneration = getPrompt1Data().imageGeneration || {};
    return typeof imageGeneration.personSuitPrompt === 'string' ? imageGeneration.personSuitPrompt : '';
  }

  function buildCharacterEnhancementPreview(): string {
    const enhancementPrompt = buildEnhancementPrompt({
      characterName: 'Luna',
      characterType: 'person',
      characterStyle: selectedCharacterStyle,
      specialAbility: 'magic casting',
      enhancementLevel: selectedEnhancementLevel,
      ageGroup: '7-10',
      uploadedImageUrl: '[uploaded child drawing]'
    });

    return formatPreviewSections([
      {
        title: 'Character Enhancement Image Generation Prompt',
        prompt: enhancementPrompt
      }
    ]);
  }

  function buildCoverImagePreview(): string {
    const titlePromptOptions = {
      characterName: 'Luna',
      specialAbility: 'magic casting',
      storyWorld: selectedCoverWorld,
      adventureType: 'Treasure Hunt',
      characterType: 'person',
      characterStyle: selectedCharacterStyle,
      ageGroup: '7-10',
      learningTheme: 'kindness and courage'
    };
    const adventureTitlePrompt = buildStoryTitlePrompt({
      ...titlePromptOptions,
      storyFormat: 'adventure_story'
    });
    const interactiveTitlePrompt = buildStoryTitlePrompt({
      ...titlePromptOptions,
      storyFormat: 'interactive_story'
    });
    const templateCompositePrompt = buildTemplateCompositeCoverPrompt({
      characterName: 'Luna',
      characterType: 'person',
      characterStyle: selectedCharacterStyle,
      storyWorld: selectedCoverWorld,
      adventureType: 'Treasure Hunt',
      ageGroup: '7-10',
      storyTitle: selectedStoryTitle
    });
    const personSuitPrompt = getPersonSuitPrompt();
    const coverPrompt = personSuitPrompt ? `${templateCompositePrompt} ${personSuitPrompt}` : templateCompositePrompt;

    return formatPreviewSections([
      {
        title: 'Adventure Story Title Generation Prompt',
        prompt: adventureTitlePrompt
      },
      {
        title: 'Interactive Story Title Generation Prompt',
        prompt: interactiveTitlePrompt
      },
      {
        title: 'Cover Image Generation Prompt',
        prompt: coverPrompt
      }
    ]);
  }

  function buildStoryImagePreview(): string {
    const sample = sceneSamples[selectedStoryImagePageNumber] || sceneSamples[1];
    const characterAction = generateCharacterAction(selectedStoryImagePageNumber, selectedStoryImageWorld, sample.text);
    const sceneDescription = generateSceneDescription(selectedStoryImagePageNumber, selectedStoryImageWorld, sample.text);

    const storyPagePrompt = buildStoryPagePrompt(
      selectedStoryImagePageNumber,
      sample.text,
      characterAction,
      sceneDescription,
      {
        characterName: 'Luna',
        characterType: 'person',
        specialAbility: 'magic casting',
        characterStyle: selectedCharacterStyle,
        storyWorld: toBuilderWorld(selectedStoryImageWorld),
        adventureType: 'Treasure Hunt',
        ageGroup: '7-10',
        storyTitle: selectedStoryTitle,
        characterImageUrl: '[reference character image]',
        storyFormat: 'adventure_story',
        characterGender: selectedCharacterGender
      }
    );

    return formatPreviewSections([
      {
        title: 'Story Page Image Generation Prompt',
        prompt: storyPagePrompt
      }
    ]);
  }

  function buildInteractiveCharacterPreview(): string {
    const scene = interactiveSceneSamples[selectedInteractiveSceneNumber] || interactiveSceneSamples[1];
    const ageGroup = getAgeGroupFromDifficulty(selectedInteractiveDifficulty);
    const storyPagePrompt = buildStoryPagePrompt(
      selectedInteractiveSceneNumber,
      scene.context,
      scene.action,
      scene.description,
      {
        characterName: 'Luna',
        characterType: 'person',
        specialAbility: 'magic casting',
        characterStyle: selectedCharacterStyle,
        storyWorld: selectedInteractiveWorld,
        adventureType: 'Search Adventure',
        ageGroup,
        storyTitle: selectedStoryTitle,
        characterImageUrl: '[reference character image]',
        storyFormat: 'interactive',
        characterGender: selectedCharacterGender
      }
    );
    const replacementPrompt = getPromptImageData().interactiveCharacterReplacementPrompt || '';
    return formatPreviewSections([
      {
        title: 'Interactive Story Page Image Generation Prompt',
        prompt: storyPagePrompt
      },
      {
        title: 'Interactive Character Replacement Prompt',
        prompt: replacementPrompt
      }
    ]);
  }

  function getSourcePromptGroups(
    drafts: Record<string, string>,
    documents: Partial<Record<PromptFileKey, any>>
  ): Record<PromptSection, SourcePrompt[]> {
    return {
      'character-enhancement': [
        sourcePrompt('Character Type Prompts', 'prompt1.json -> enhanceCharacter.characterType', 'prompt1', ['enhanceCharacter', 'characterType'], drafts, documents),
        sourcePrompt('Character Style Prompts', 'prompt1.json -> enhanceCharacter.characterStyle', 'prompt1', ['enhanceCharacter', 'characterStyle'], drafts, documents),
        sourcePrompt('Special Ability Prompts', 'prompt1.json -> enhanceCharacter.specialAbility', 'prompt1', ['enhanceCharacter', 'specialAbility'], drafts, documents),
        sourcePrompt('Enhancement Level Prompts', 'prompt1.json -> enhanceCharacter.enhancementLevel', 'prompt1', ['enhanceCharacter', 'enhancementLevel'], drafts, documents),
        sourcePrompt('Additional Enhancement Prompts', 'prompt1.json -> enhanceCharacter.additionalEnhancement', 'prompt1', ['enhanceCharacter', 'additionalEnhancement'], drafts, documents),
        sourcePrompt('Reference Preservation Prompts', 'prompt1.json -> enhanceCharacter.referencePreservation', 'prompt1', ['enhanceCharacter', 'referencePreservation'], drafts, documents),
        sourcePrompt('Additional Guidance Prompts', 'prompt1.json -> enhanceCharacter.additionalGuidance', 'prompt1', ['enhanceCharacter', 'additionalGuidance'], drafts, documents),
        sourcePrompt('Reference Preservation Section Template', 'prompt1.json -> promptBuilderTemplates.referencePreservationSection', 'prompt1', ['promptBuilderTemplates', 'referencePreservationSection'], drafts, documents),
        sourcePrompt('Additional Guidance Section Template', 'prompt1.json -> promptBuilderTemplates.additionalGuidanceSection', 'prompt1', ['promptBuilderTemplates', 'additionalGuidanceSection'], drafts, documents),
        sourcePrompt('Custom Special Ability Template', 'prompt1.json -> promptBuilderTemplates.customSpecialAbility', 'prompt1', ['promptBuilderTemplates', 'customSpecialAbility'], drafts, documents),
        sourcePrompt('Character Type Section Template', 'prompt1.json -> promptBuilderTemplates.characterTypeSpecificationsSection', 'prompt1', ['promptBuilderTemplates', 'characterTypeSpecificationsSection'], drafts, documents),
        sourcePrompt('Character Style Section Template', 'prompt1.json -> promptBuilderTemplates.characterStyleSpecificationsSection', 'prompt1', ['promptBuilderTemplates', 'characterStyleSpecificationsSection'], drafts, documents),
        sourcePrompt('Special Ability Section Template', 'prompt1.json -> promptBuilderTemplates.specialAbilitySpecificationsSection', 'prompt1', ['promptBuilderTemplates', 'specialAbilitySpecificationsSection'], drafts, documents),
        sourcePrompt('Additional Character Type Section Template', 'prompt1.json -> promptBuilderTemplates.additionalCharacterTypeEnhancementSection', 'prompt1', ['promptBuilderTemplates', 'additionalCharacterTypeEnhancementSection'], drafts, documents),
        sourcePrompt('Additional Style Section Template', 'prompt1.json -> promptBuilderTemplates.additionalStyleEnhancementSection', 'prompt1', ['promptBuilderTemplates', 'additionalStyleEnhancementSection'], drafts, documents),
        sourcePrompt('Additional Special Ability Section Template', 'prompt1.json -> promptBuilderTemplates.additionalSpecialAbilityEnhancementSection', 'prompt1', ['promptBuilderTemplates', 'additionalSpecialAbilityEnhancementSection'], drafts, documents),
        sourcePrompt('Final Enhancement Enforcement Template', 'prompt1.json -> promptBuilderTemplates.finalEnhancementEnforcement', 'prompt1', ['promptBuilderTemplates', 'finalEnhancementEnforcement'], drafts, documents)
      ],
      'cover-image': [
        sourcePrompt('Adventure Story Title Generation Prompt', 'prompt1.json -> storyTitlePrompts.story', 'prompt1', ['storyTitlePrompts', 'story'], drafts, documents),
        sourcePrompt('Interactive Story Title Generation Prompt', 'prompt1.json -> storyTitlePrompts.interactive', 'prompt1', ['storyTitlePrompts', 'interactive'], drafts, documents),
        sourcePrompt('Template Composite Cover Prompt', 'prompt1.json -> generateStoryScene.cover.templateCompositePrompt', 'prompt1', ['generateStoryScene', 'cover', 'templateCompositePrompt'], drafts, documents),
        sourcePrompt('Cover Template Base Prompt', 'prompt1.json -> imageGeneration.coverTemplateBasePrompt', 'prompt1', ['imageGeneration', 'coverTemplateBasePrompt'], drafts, documents),
        sourcePrompt('Person Cover Outfit Prompt', 'prompt1.json -> imageGeneration.personSuitPrompt', 'prompt1', ['imageGeneration', 'personSuitPrompt'], drafts, documents)
      ],
      'story-image': [
        sourcePrompt('Adventure Story Template Page Prompts', 'prompt_image.json -> storyStyleWorldPagePrompts', 'prompt_image', ['storyStyleWorldPagePrompts'], drafts, documents),
        sourcePrompt('Gender Appearance Prompts', 'prompt_image.json -> personGenderAppearancePrompts', 'prompt_image', ['personGenderAppearancePrompts'], drafts, documents),
        sourcePrompt('Legacy Template Outfit Fallback', 'prompt_image.json -> personTemplateOutfitPrompt', 'prompt_image', ['personTemplateOutfitPrompt'], drafts, documents)
      ],
      'interactive-character': [
        sourcePrompt('Interactive Story Template Page Prompts', 'prompt_image.json -> interactiveStoryStyleWorldPagePrompts', 'prompt_image', ['interactiveStoryStyleWorldPagePrompts'], drafts, documents),
        sourcePrompt('Template Outfit Prompt', 'prompt_image.json -> personTemplateOutfitPrompt', 'prompt_image', ['personTemplateOutfitPrompt'], drafts, documents),
        sourcePrompt('Interactive Character Replacement Prompt', 'prompt_image.json -> interactiveCharacterReplacementPrompt', 'prompt_image', ['interactiveCharacterReplacementPrompt'], drafts, documents)
      ]
    };
  }

  $: urlSection = normalizePromptSection($page.url.searchParams.get('tab'));
  $: if (urlSection !== activeSection) {
    activeSection = urlSection;
  }

  $: activeSectionMeta =
    sections.find((section) => section.key === activeSection) || sections[0];
  $: sourcePromptGroups = getSourcePromptGroups(promptDrafts, promptDocuments);
  $: activeSourcePrompts = sourcePromptGroups[activeSection] ?? [];

  $: {
    promptDocuments;
    promptDrafts;
    selectedStoryTitle;
    selectedCharacterStyle;
    selectedCharacterGender;
    selectedEnhancementLevel;
    selectedCoverWorld;
    selectedStoryImageWorld;
    selectedStoryImagePageNumber;
    selectedInteractiveWorld;
    selectedInteractiveSceneNumber;
    selectedInteractiveDifficulty;
    try {
      activePromptPreview = withPreviewPromptDocuments(() => {
        if (activeSection === 'character-enhancement') {
          return buildCharacterEnhancementPreview();
        } else if (activeSection === 'cover-image') {
          return buildCoverImagePreview();
        } else if (activeSection === 'story-image') {
          return buildStoryImagePreview();
        }
        return buildInteractiveCharacterPreview();
      });
      activePromptError = null;
    } catch (error) {
      activePromptPreview = '';
      activePromptError = error instanceof Error ? error.message : 'Failed to build prompt preview.';
    }
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
    <p class="page-description">Edit the Supabase-backed AI prompts used by generation flows.</p>
  </div>

  <div class="switcher-card">
    <div class="section-switch" role="tablist" aria-label="Prompt sections">
      {#each sections as section}
        <button
          type="button"
          class:active={activeSection === section.key}
          role="tab"
          aria-selected={activeSection === section.key}
          on:click={() => setActiveSection(section.key)}
        >
          {section.label}
        </button>
      {/each}
    </div>

    <div class="section-content">
      <div class="story-title-container">
        <p class="content-title">{activeSectionMeta.label}</p>
        <p>{activeSectionMeta.description}</p>
        {#if promptsLoading}
          <p class="muted-status">Loading editable prompts from Supabase...</p>
        {:else if loadError}
          <p class="error-text">{loadError}</p>
        {/if}
      </div>

      {#if activeSection === 'character-enhancement'}
        <div class="story-title-container">
          <p class="content-title">Preview Variables</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>Character Style</span>
              <select bind:value={selectedCharacterStyle}>
                {#each characterStyles as styleOption}
                  <option value={styleOption.value}>{styleOption.label}</option>
                {/each}
              </select>
            </label>
            <label class="control-field">
              <span>Enhancement Level</span>
              <select bind:value={selectedEnhancementLevel}>
                {#each enhancementLevels as levelOption}
                  <option value={levelOption.value}>{levelOption.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
      {:else if activeSection === 'cover-image'}
        <div class="story-title-container">
          <p class="content-title">Preview Variables</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>Character Style</span>
              <select bind:value={selectedCharacterStyle}>
                {#each characterStyles as styleOption}
                  <option value={styleOption.value}>{styleOption.label}</option>
                {/each}
              </select>
            </label>
            <label class="control-field">
              <span>World</span>
              <select bind:value={selectedCoverWorld}>
                {#each worldOptions as worldOption}
                  <option value={worldOption.value}>{worldOption.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
        <div class="story-title-container">
          <p class="content-title">Sample Story Title</p>
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
      {:else if activeSection === 'story-image'}
        <div class="story-title-container">
          <p class="content-title">Preview Variables</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>World</span>
              <select bind:value={selectedStoryImageWorld}>
                {#each worldOptions as worldOption}
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
              <span>Character Gender</span>
              <select bind:value={selectedCharacterGender}>
                {#each characterGenders as genderOption}
                  <option value={genderOption.value}>{genderOption.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
      {:else if activeSection === 'interactive-character'}
        <div class="story-title-container">
          <p class="content-title">Preview Variables</p>
          <div class="story-prompt-controls">
            <label class="control-field">
              <span>World</span>
              <select bind:value={selectedInteractiveWorld}>
                {#each worldOptions as worldOption}
                  <option value={worldOption.value}>{worldOption.label}</option>
                {/each}
              </select>
            </label>
            <label class="control-field">
              <span>Scene</span>
              <select bind:value={selectedInteractiveSceneNumber}>
                <option value={1}>Scene 1</option>
                <option value={2}>Scene 2</option>
                <option value={3}>Scene 3</option>
                <option value={4}>Scene 4</option>
              </select>
            </label>
            <label class="control-field">
              <span>Difficulty</span>
              <select bind:value={selectedInteractiveDifficulty}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
            <label class="control-field">
              <span>Character Gender</span>
              <select bind:value={selectedCharacterGender}>
                {#each characterGenders as genderOption}
                  <option value={genderOption.value}>{genderOption.label}</option>
                {/each}
              </select>
            </label>
          </div>
        </div>
      {/if}

      <div class="story-title-container">
        <p class="content-title prompt-title">Generated Prompt Preview</p>
        {#if activePromptError}
          <p class="error-text">{activePromptError}</p>
        {:else}
          <pre class="prompt-preview">{activePromptPreview}</pre>
        {/if}
      </div>

      <div class="story-title-container source-prompts-container">
        <p class="content-title prompt-title">Editable Prompt Templates</p>
        <div class="source-prompt-grid">
          {#each activeSourcePrompts as sourcePromptItem (sourcePromptItem.editKey)}
            <details class="source-prompt-card">
              <summary>
                <span>{sourcePromptItem.title}</span>
                <small>
                  {sourcePromptItem.source}
                  {#if promptDocumentMeta[sourcePromptItem.fileKey]?.version}
                    · v{promptDocumentMeta[sourcePromptItem.fileKey]?.version}
                  {/if}
                </small>
              </summary>
              <div class="editor-block">
                <textarea
                  class="source-prompt-editor"
                  spellcheck="false"
                  value={sourcePromptItem.draftValue}
                  on:input={(event) => updatePromptDraft(sourcePromptItem, event)}
                ></textarea>
                <div class="editor-actions">
                  <span class="editor-hint">
                    {sourcePromptItem.editorMode === 'text' ? 'Text prompt' : 'JSON object/array'}
                  </span>
                  <button
                    type="button"
                    class="secondary-action"
                    disabled={!sourcePromptItem.isDirty || promptSaving[sourcePromptItem.editKey]}
                    on:click={() => cancelPromptEdit(sourcePromptItem)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="secondary-action danger"
                    disabled={promptSaving[`reset:${sourcePromptItem.fileKey}`]}
                    on:click={() => resetPromptFile(sourcePromptItem)}
                  >
                    Reset File
                  </button>
                  <button
                    type="button"
                    class="primary-action"
                    disabled={!sourcePromptItem.isDirty || promptSaving[sourcePromptItem.editKey]}
                    on:click={() => savePromptItem(sourcePromptItem)}
                  >
                    {promptSaving[sourcePromptItem.editKey] ? 'Saving...' : 'Save'}
                  </button>
                </div>
                {#if promptErrors[sourcePromptItem.editKey]}
                  <p class="error-text">{promptErrors[sourcePromptItem.editKey]}</p>
                {:else if promptMessages[sourcePromptItem.editKey]}
                  <p class="success-text">{promptMessages[sourcePromptItem.editKey]}</p>
                {/if}
              </div>
            </details>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .prompts-manage-page {
    width: 100%;
    padding: 0 1rem;
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

  .source-prompts-container {
    border-top: 1px solid #e5e7eb;
    padding-top: 1rem;
  }

  .source-prompt-grid {
    display: grid;
    gap: 0.75rem;
  }

  .source-prompt-card {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #ffffff;
    overflow: hidden;
  }

  .source-prompt-card summary {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 0.9rem;
    cursor: pointer;
    color: #111827;
    font-weight: 600;
  }

  .source-prompt-card summary small {
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .editor-block {
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    padding: 0.9rem;
  }

  .source-prompt-editor {
    width: 100%;
    min-height: 220px;
    resize: vertical;
    margin: 0;
    white-space: pre-wrap;
    border: 1px solid #d1d5db;
    border-radius: 0.45rem;
    background: #ffffff;
    padding: 0.8rem;
    color: #111827;
    font-size: 0.8rem;
    line-height: 1.45;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  }

  .editor-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .editor-hint {
    margin-right: auto;
    color: #6b7280;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .primary-action,
  .secondary-action {
    border: 1px solid #d1d5db;
    border-radius: 0.45rem;
    padding: 0.45rem 0.75rem;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }

  .primary-action {
    border-color: #2563eb;
    background: #2563eb;
    color: #ffffff;
  }

  .secondary-action {
    background: #ffffff;
    color: #374151;
  }

  .secondary-action.danger {
    border-color: #fecaca;
    color: #b91c1c;
  }

  .primary-action:disabled,
  .secondary-action:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  .error-text {
    margin: 0;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .success-text {
    margin: 0.6rem 0 0;
    color: #15803d;
    font-size: 0.875rem;
  }

  .muted-status {
    color: #6b7280;
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
