import promptConfig from '$lib/prompt1.json';

const NOT_MATCHED_TEXT = 'The story theme is not matched or existed';

type AgeGroup = '3-6' | '7-10' | '11-12';

type ThemePromptConfig = {
  themeName?: string;
  worldName?: string;
  storyVariablesByAgeGroup?: Record<string, Record<string, string>>;
  ageRanges?: Record<
    string,
    {
      variables?: Record<string, string>;
      pages?: Record<string, string>;
    }
  >;
};

const VALID_AGE_GROUPS: AgeGroup[] = ['3-6', '7-10', '11-12'];

function parseAgeGroup(ageGroup: string): AgeGroup | null {
  const trimmed = ageGroup?.trim();
  if (!trimmed) return null;
  return VALID_AGE_GROUPS.includes(trimmed as AgeGroup) ? (trimmed as AgeGroup) : null;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function toTokenKey(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

function replacePageVariables(pagePrompt: string, variables: Record<string, string>): string {
  return pagePrompt.replace(/\[([A-Z_]+)\]/g, (fullMatch, rawToken) => {
    const value = variables[rawToken];
    return value ?? fullMatch;
  });
}

export function buildStoryTextPrompt(
  themeName: string,
  worldName: string,
  ageGroup: string
): string {
  if (!themeName || !worldName) {
    return NOT_MATCHED_TEXT;
  }

  const validAgeGroup = parseAgeGroup(ageGroup);
  if (!validAgeGroup) {
    return NOT_MATCHED_TEXT;
  }

  const allThemes =
    promptConfig.generateStoryText?.storyTextGenerationPrompts as Record<string, ThemePromptConfig>;
  const matchedTheme = Object.values(allThemes).find((theme) => {
    if (!theme.themeName || !theme.worldName) return false;
    return (
      normalize(theme.themeName) === normalize(themeName) &&
      normalize(theme.worldName) === normalize(worldName)
    );
  });

  if (!matchedTheme) {
    return NOT_MATCHED_TEXT;
  }

  const ageRange = matchedTheme.ageRanges?.[validAgeGroup];
  const pages = ageRange?.pages;
  if (!pages || Object.keys(pages).length === 0) {
    return NOT_MATCHED_TEXT;
  }

  const variables: Record<string, string> = {};
  const storyVariablesByAgeGroup = matchedTheme.storyVariablesByAgeGroup?.[validAgeGroup] ?? {};

  for (const [key, value] of Object.entries(storyVariablesByAgeGroup)) {
    variables[toTokenKey(key)] = value;
  }

  for (const [key, value] of Object.entries(ageRange?.variables ?? {})) {
    variables[toTokenKey(key)] = value;
  }

  variables.WORLD_NAME = worldName;
  variables.LEARNING_THEME = matchedTheme.themeName ?? themeName;

  const sortedPageEntries = Object.entries(pages).sort(([a], [b]) => a.localeCompare(b));

  return sortedPageEntries
    .map(([, pagePrompt]) => replacePageVariables(pagePrompt, variables))
    .join('\n\n');
}

export { NOT_MATCHED_TEXT };
