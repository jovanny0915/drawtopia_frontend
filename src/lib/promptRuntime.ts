import { browser } from '$app/environment';
import prompt1Fallback from './prompt1.json';
import promptImageFallback from './prompt_image.json';
import { getAdminPrompts, type PromptDocument, type PromptFileKey } from './api/prompts';

type PromptDocumentMap = {
  prompt1: any;
  prompt_image: any;
  backend_prompts?: any;
};

const fallbackDocuments: PromptDocumentMap = {
  prompt1: prompt1Fallback as any,
  prompt_image: promptImageFallback as any
};

let runtimeDocuments: PromptDocumentMap = { ...fallbackDocuments };
let loadPromise: Promise<PromptDocumentMap> | null = null;

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
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

export function setRuntimePromptDocuments(documents: Partial<Record<PromptFileKey, unknown>>): void {
  runtimeDocuments = {
    ...runtimeDocuments,
    ...(documents.prompt1 ? { prompt1: mergePromptDefaults(fallbackDocuments.prompt1, documents.prompt1) } : {}),
    ...(documents.prompt_image ? { prompt_image: mergePromptDefaults(fallbackDocuments.prompt_image, documents.prompt_image) } : {}),
    ...(documents.backend_prompts ? { backend_prompts: documents.backend_prompts } : {})
  };
}

export function setRuntimePromptDocument(document: PromptDocument): void {
  if (document.file_key === 'prompt1' || document.file_key === 'prompt_image' || document.file_key === 'backend_prompts') {
    setRuntimePromptDocuments({ [document.file_key]: document.content });
  }
}

export function getPrompt1Data(): any {
  return runtimeDocuments.prompt1 || fallbackDocuments.prompt1;
}

export function getPromptImageData(): any {
  return runtimeDocuments.prompt_image || fallbackDocuments.prompt_image;
}

export function getPromptDocumentsSnapshot(): PromptDocumentMap {
  return cloneValue(runtimeDocuments);
}

export function getFallbackPromptDocument(fileKey: PromptFileKey): unknown {
  const fallback = fallbackDocuments[fileKey as keyof PromptDocumentMap];
  return fallback === undefined ? undefined : cloneValue(fallback);
}

export async function loadRuntimePromptDocuments(force = false): Promise<PromptDocumentMap> {
  if (!browser) {
    return runtimeDocuments;
  }

  if (loadPromise && !force) {
    return loadPromise;
  }

  loadPromise = (async () => {
    const result = await getAdminPrompts();
    if (result.success) {
      if (result.documents?.length) {
        const mapped = result.documents.reduce<Partial<Record<PromptFileKey, unknown>>>((acc, document) => {
          acc[document.file_key] = document.content;
          return acc;
        }, {});
        setRuntimePromptDocuments(mapped);
      } else if (result.data) {
        setRuntimePromptDocuments(result.data);
      }
    }
    return runtimeDocuments;
  })();

  return loadPromise;
}
