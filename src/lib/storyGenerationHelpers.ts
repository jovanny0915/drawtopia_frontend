/**
 * Story Generation Helper Functions
 * Provides utilities for generating complete story books with templates
 */

import prompt2Data from './prompt1.json';
import type { BookTemplate } from './database/bookTemplates';
import { env, LOGO_PATH } from './env';
import { buildStoryScenePrompt } from './promptBuilder';

/** Text block for overlay API: text, font_size, color_hex, y_position, alignment, shadow */
export interface TextBlockOverlay {
  text: string;
  font_size?: number;
  color_hex?: string;
  y_position?: number;
  alignment?: 'center' | 'left' | 'right';
  shadow?: boolean;
  shadow_color?: string;
  shadow_offset?: number;
}

/**
 * Replace placeholders in text with actual values
 */
export function replacePlaceholders(text: string, replacements: { [key: string]: string }): string {
  let result = text;
  for (const [placeholder, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

/**
 * Build story page prompt with story text, character action, and scene description
 */
/** World keys used for story page prompts (forest, outerspace, underwater). */
type StoryWorldKey = 'forest' | 'outerspace' | 'underwater';
type StoryStyleKey = '3d' | 'anime' | 'cartoon';

/** Temporary fixed prompt for main story page. Set to null to use prompt builder again. */
interface WorldStoryPagePrompts {
  tempMainStoryPagePrompt: string | null;
  tempMainStoryPageAllyCharacterPrompt: string | null;
  pageAllyCharacterPrompts: { [key: number]: string };
  pageMainCharacterPoseActionEmotionPrompts: { [key: number]: string };
}

const STORY_STYLE_WORLD_PAGE_PROMPTS: Record<StoryStyleKey, Record<StoryWorldKey, WorldStoryPagePrompts>> = {
  '3d': {
    forest: {
      tempMainStoryPagePrompt:
        "Replace the main girl/boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original girl/boy main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Just integrate the character of the reference character image into the template background image as the new main character instead of original boy main character keeping the appearance and height of the character of reference character image, ensuring lighting and style are perfectly blended. Please don't add any effect image and additional items to the template background. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Kept the dolphin ally character of template image.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed in this image.",
        3: "Ally character - ally character should be not removed in this image.",
        4: "Ally character - ally character should be not removed in this image.",
        5: "Ally character - ally character should be not removed in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "The character stands in a magical treehouse dwelling. The character's hands gently cupped as if holding or observing something delicate. And he/she seems to look at us. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The placement of character stands in the a slightly left from center.",
        2: "A bright-eyed, the adventurous character stands smiling at the stone entrance to a magical, glowing forest path. The character's ready for the journey, accompanied by a friendly ally character. They are positioned a little left to the center and the alley companion fox character is right to the main character on reader perspective.",
        3: "The character and fox ally companion character pause on a mossy stone path in a deeply enchanted, twilight forest. The character looks on with wide-eyed curiosity and a touch of awe, one hand slightly raised. They are positioned a little left to the center and the companion fox character is right to the main character on reader perspective.",
        4: "The character stands in a powerful, slightly crouched pose on a mystical forest path, actively casting a swirling, blue-green magic from he/her outstretched hand. The character's gaze is intensely focused forward. The character stands in the left of fox companion character. They are positioned a little left to the center and the fox companion character is right to the main character on reader perspective.",
        5: "The warm and welcoming character stands confidently on a cobblestone path before the open, ornate gates of a magnificent, brightly lit castle at night. With a radiant smile and open hands, the character gestures invitingly, accompanied by the character's happy fox companion. The character should stand on the left to the fox on my perspective. They are positioned a little left to the center and fox companion character is very close right to the main character on reader perspective."
      }
    },
    outerspace: {
      tempMainStoryPagePrompt:
        "Replace the main boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original boy main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Just integrate the character of the reference character image into the template background image as the new main character instead of original boy main character keeping the appearance and height of the character of reference character image, ensuring lighting and style are perfectly blended. Please don't add any effect image and additional items to the template background. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Kept the dolphin ally character of template image.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "The thoughtful main character stands on a glowing, elevated platform. The main character's expression is one of slight worry or contemplation, with his right hand gently resting on his chin, seemingly lost in thought while observing the vast, star-filled nebula around him. He is positioned a little to the left of the image's center on reader's perspective.",
        2: "The main character space explorer is in mid-flight amidst a vibrant galaxy by accomplished with alley character. The main character has an expression of wonder and readiness for adventure, extending his hand slightly towards his companion character as they navigate the star-filled expanse, past distant spaceships and cosmic debris, towards a central swirling light. They are positioned left to the center.",
        3: "The adventurous main character, a young boy in a futuristic space suit, floats through an asteroid field, holding a glowing sci-fi blaster. His expression is focused and determined, ready for action, accompanied by his luminous, fox-like alien companion who floats beside him. They are positioned in the middle of a dense field of asteroids and cosmic dust, with a vibrant purple nebula forming the backdrop. They are positioned left to the center.",
        4: "The dynamic main character, the boy is caught in a moment of intense action, firing a vibrant energy weapon that illuminates the scene. His glowing spirit animal companion, a fox-like creature, floats protectively nearby. They are enveloped by swirling ribbons of cosmic energy and surrounded by a star-dusted asteroid field and a dramatic nebula, indicating a thrilling space encounter. They are positioned left to the center.",
        5: "The joyful main boy character stands with an open, inviting posture, engaging with his adorable, translucent blue fox-like creature. The creature, equally happy, reaches a paw towards the boy's hand. The main boy character and alley companion character are positioned left to the center of story book and the alley companion character is also placed left to the main boy character on reader's perspective."
      }
    },
    underwater: {
      tempMainStoryPagePrompt:
        "Replace the main girl character of template background image with the character of reference character image keeping the appearance of the reference image character. The girl main character of template background image must be removed and replaced with the another character of reference character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original girl main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Just integrate the character of the reference character image into the template background image as the new main character instead of original boy main character keeping the appearance and height of the character of reference character image, ensuring lighting and style are perfectly blended. Please don't add any effect image and additional items to the template background. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Kept the dolphin ally character of template image.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not removed, replaced and modified in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "The main character is underwater, amidst coral and sand. The character's left hand is extended towards alley companion character, seemingly interacting with it. The main character is looking towards the alley companion character. The character is positioned slightly to the left of the center and the alley companion character is positioned slightly to the right of the center.",
        2: "The main character is underwater, swimming alongside the alley companion character with coral and rocks in the background. The main character's right hand is placed on their chest, and their left arm is slightly extended forward. The main character is looking towards the right side of the image. The character is positioned to the left of the center and the alley companion character is positioned to the left of the character.",
        3: "The main character is underwater in what appears to be ancient ruins, holding a glowing staff with alley companion character. The character's left arm is extended forward, holding the staff, and their right arm is slightly bent at the elbow. The character is looking towards the left side of the image with a determined expression. The character is positioned to the left of the center and the alley character is positioned to the right of the center.",
        4: "The main character is underwater in a vibrant coral reef, generating a swirling magical effect with their hands. Both of the character's arms are extended upwards and outwards, creating the magical swirl. The main character is looking towards the upper left of the image with alley companion character. The main character is positioned to the left of the center and the alley companion character is positioned in the center.",
        5: "The main character is sitting cross-legged on the floor of an elegant underwater structure, high-fiving the alley companion character. Both of the character's hands are raised in a high-five gesture with the alley companion character. The main character is looking towards the alley companion character. The main character and the alley companion character are positioned to the left of the center and the main character is left to the alley companion character on user perspective."
      }
    }
  },
  anime: {
    forest: {
      tempMainStoryPagePrompt:
        "Replace the main girl/boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. Please don't add any effect image and additional items to the template background. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original girl/boy main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Keep this in polished anime storybook style with expressive eyes, clean cel-shaded lighting, and soft magical color grading. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed in this image.",
        3: "Ally character - ally character should be not removed in this image.",
        4: "Ally character - ally character should be not removed in this image.",
        5: "Ally character - ally character should be not removed in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Anime style. The main character stands alone on the left side of a dim indoor room, in three-quarter view facing right toward a large window with light curtains; one hand firmly on the hip, the other arm bent with index finger at the cheek in a thinking pose; serious, focused, contemplative expression, staring intently out at a dark forest. Primary light from the window; no companion character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The main character is placed slightly left of center on reader's perspective.",
        2: "Anime style. The main character walks with purpose mid-stride from left to right across a wooden porch in front of a rustic wooden building with large double doors, toward an open forest path; determined, serious expression. The fox ally companion walks beside the character on the character's right side (the viewer's left), looking up at the character's face. They are positioned a little left to the center and the fox companion is to the viewer's left of the main character on reader perspective.",
        3: "Anime style. On a forest path at night, the main character stands in a wide stance in the foreground, body angled slightly right; the right arm is raised and fully extended with index finger pointing toward the upper right; left arm slightly behind with an open hand; intense excitement and wonder, wide sparkling eyes, joyful open mouth. The fox ally companion stands on all fours just to the right and slightly behind the main character, looking up at the main character's face. They are positioned a little left to the center and the fox companion is right to the main character on reader perspective.",
        4: "Anime style. On a forest path, the main character stands in a wide low defensive combat-ready stance in the foreground left, body angled slightly right but head turned to look intensely toward the left; both hands hold a large two-handed sword angled downward across the body; fierce, determined, focused expression. A bright circular magical light or portal glows in the background between the trees. The fox ally companion stands on all fours in an alert aggressive posture just to the right and slightly behind the main character's legs, snarling and looking the same direction. They are positioned a little left to the center and the fox companion is right to the main character on reader perspective.",
        5: "Anime style. At the open wrought-iron gates of a path toward a distant castle, the main character stands in the lower-left foreground in a dynamic forward-leaning stance; the right arm is raised high for a high-five; extremely joyful excited expression with sparkling eyes and wide smile. The fox ally companion leaps mid-air to the left of the main character from reader perspective, front paw meeting the high-five. They are positioned a little left to the center; the fox is close beside the main character on the left for this gesture and the warmly lit castle sits at the end of the path in the background."
      }
    },
    outerspace: {
      tempMainStoryPagePrompt:
        "Replace the main boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original boy main character of the template background image. Please don't add any effect image and additional items to the template background. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Render in cinematic anime sci-fi style with clean linework, luminous highlights, and dramatic but child-friendly color contrast. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove, replace, or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Anime style. The main character stands alone in a futuristic spaceship corridor with a vast starfield visible through large windows. The main character has a thoughtful, slightly serious expression, with one hand near the chin as if planning the mission while walking forward. Keep the main character slightly left of center on reader's perspective. Ally character should not appear in this page.",
        2: "Anime style. On a bright orbital platform near a space station, the main character stands with an excited smile and points forward as if spotting the next destination. The glowing fox-like ally companion stands close beside the character with cheerful energy. Keep both slightly left of center, with the ally companion on the right from reader perspective.",
        3: "Anime style. In deep space with swirling clouds and asteroids, the adventurous main character rides alongside the luminous ally companion in a fast forward-flight pose, arm extended ahead with determined excitement. Keep both left of center, with the ally companion directly under or slightly right of the main character from reader perspective.",
        4: "Anime style. During an intense cosmic battle scene, the main character flies forward while aiming and firing a glowing sci-fi blaster, with a focused combat expression. The ally companion stays close beneath the character in a protective action posture. Keep both left of center, with bright energy trails and distant ships in the background.",
        5: "Anime style. After the action, the main character and glowing ally companion float calmly in open starry space with a victorious, relieved mood. The main character shows a confident, friendly gesture, while the ally companion stays close nearby. Place both left of center, with the ally companion slightly lower and to the right of the main character from reader perspective."
      }
    },
    underwater: {
      tempMainStoryPagePrompt:
        "Replace the main girl character of template background image with the character of reference character image keeping the appearance of the reference image character. The girl main character of template background image must be removed and replaced with another character from the reference image. When replacing and integrating, the pose and emotion of the reference image character must not be kept. The replaced character should match the pose, action, appearance (facial and body features), emotions, scale and height of the original template main character. Please don't add any effect image and additional items to the template background. All other characters and elements from the template background image must be kept and integrated seamlessly. Keep the background unchanged and render in vibrant underwater anime style with clear linework, soft caustic glow, and dreamy blue gradients. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove, replace, or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not removed, replaced and modified in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Anime style. In a glowing underwater cavern, the main character takes a defensive battle-ready stance while holding a trident-like spear, with a focused and determined expression. The pufferfish ally companion floats close behind near shoulder height. Keep the main character slightly left of center, with the ally companion to the upper left from reader perspective.",
        2: "Anime style. In front of a grand underwater castle, the main character shows joyful excitement with hands clasped together as if celebrating a discovery. The pufferfish ally companion hovers nearby with cheerful energy. Keep both left of center, with the ally companion slightly behind and to the right of the main character from reader perspective.",
        3: "Anime style. In a deep-sea canyon, the main character floats upward with a surprised, wide-eyed expression and both hands raised near the head as if reacting to danger or a sudden sound. The pufferfish ally companion stays close on the character's left side. Keep both left of center.",
        4: "Anime style. During an action moment in underwater ruins, the main character moves forward in a dynamic swimming-combat pose while channeling glowing water magic from one hand, showing intense focus. The pufferfish ally companion hovers protectively nearby. Keep the main character left of center and the ally companion just above and to the right from reader perspective.",
        5: "Anime style. Inside an ancient underwater hall with tall arched windows, the main character floats calmly in profile with one hand near the chin, showing a thoughtful and reflective mood after the adventure. Ally character should not appear in this page. Keep the main character slightly left of center with open space to the right."
      }
    }
  },
  cartoon: {
    forest: {
      tempMainStoryPagePrompt:
        "Replace the main girl/boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original girl/boy main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. Please don't add any effect image and additional items to the template background. The background of template image must be kept - never changed. Render in colorful cartoon storybook style with soft outlines, rounded forms, and bright kid-friendly tones. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed in this image.",
        3: "Ally character - ally character should be not removed in this image.",
        4: "Ally character - ally character should be not removed in this image.",
        5: "Ally character - ally character should be not removed in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Cartoon style. Inside a warm wooden cabin lit by a fireplace and hanging lamp, the main character stands alone in a thoughtful pose with one hand near the chin and a slightly puzzled expression, as if planning the next step. Keep the main character slightly left of center on reader's perspective. Ally character should not appear in this page.",
        2: "Cartoon style. Outside a small forest cottage at night, the adventurous main character steps forward holding a lantern with cautious curiosity. The fox ally companion stands close near the character's side as they prepare to leave. Keep both slightly left of center, with the fox companion on the right from reader perspective.",
        3: "Cartoon style. On a glowing enchanted forest path, the main character points ahead with excitement after spotting something important, smiling with wonder. The fox ally companion follows closely and looks in the same direction. Keep both slightly left of center, with the fox companion on the left from reader perspective.",
        4: "Cartoon style. In a denser magical forest scene, the main character moves forward in an alert action pose while carrying a short sword and lantern, showing focused determination. The fox ally companion stays close in a protective, tense posture. Keep both left of center, with the fox companion to the left of the main character from reader perspective.",
        5: "Cartoon style. At the open gates of a moonlit castle, the main character celebrates with a joyful smile and raises a hand to high-five the happy fox ally companion. Keep both slightly left of center, with the fox companion on the left from reader perspective and the castle clearly visible in the background."
      }
    },
    outerspace: {
      tempMainStoryPagePrompt:
        "Replace the main boy character of template background image with the character of reference character image keeping the appearance of the reference image character. When replacing and integrating, the pose of emotions of the character of reference character image must be not kept. The replaced character should precisely match the pose, action, appearance (facial and body features), emotions, scale and size and height of the original boy main character of the template background image. All other characters and elements from the template background image must be kept and integrated seamlessly. The background of template image must be kept - never changed. Please don't add any effect image and additional items to the template background. Render in playful cartoon sci-fi style with clean shapes, vibrant neon colors, and readable expressions for children. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove, replace, or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Cartoon style. Inside a futuristic space station hall with large star-view windows, the main character stands alone in a thoughtful pose, one hand near the chin and a slightly worried expression, while holding the helmet in the other hand. Keep the main character slightly left of center on reader's perspective. Ally character should not appear in this page.",
        2: "Cartoon style. On a glowing spaceship walkway, the main character smiles with joyful excitement and raises a hand in a friendly greeting gesture toward the floating ally companion. Keep both slightly left of center, with the ally companion hovering to the left of the main character from reader perspective.",
        3: "Cartoon style. In open space, the main character flies forward in a determined action pose with one arm extended ahead while the glowing ally companion flies close beside. Add a sense of fast movement toward a luminous cosmic destination. Keep both left of center, with the ally companion slightly below and right of the main character from reader perspective.",
        4: "Cartoon style. During an intense cosmic encounter, the main character braces in midair and aims a glowing sci-fi blaster with focused combat emotion while swirling light trails and asteroids surround the scene. The ally companion hovers protectively nearby. Keep both left of center, with the ally companion above and behind the main character from reader perspective.",
        5: "Cartoon style. In a dangerous asteroid tunnel, the main character drifts backward in a startled evasive pose with a tense, alarmed expression as if avoiding impact. The ally companion appears shocked and stays close near the character's shoulder. Keep both left of center with strong motion through the rocky space corridor."
      }
    },
    underwater: {
      tempMainStoryPagePrompt:
        "Replace the main girl character of template background image with the character of reference character image keeping the appearance of the reference image character. The girl main character of template background image must be removed and replaced with another character from the reference image. When replacing and integrating, the pose and emotion of the reference image character must not be kept. The replaced character should match the pose, action, appearance (facial and body features), emotions, scale and height of the original template main character. All other characters and elements from the template background image must be kept and integrated seamlessly. Please don't add any effect image and additional items to the template background. Keep the background unchanged and render in bright cartoon underwater style with playful shapes, clear silhouettes, and soft aquatic glow. Generate the final image in stunning 4K resolution with an aspect ratio of 3:2 (width:height).",
      tempMainStoryPageAllyCharacterPrompt: "Keep the ally character from the template image. Do not remove, replace, or redesign it.",
      pageAllyCharacterPrompts: {
        1: "Ally character - ally character should be not removed, replaced and modified in this image.",
        2: "Ally character - ally character should be not removed, replaced and modified in this image.",
        3: "Ally character - ally character should be not removed, replaced and modified in this image.",
        4: "Ally character - ally character should be not removed, replaced and modified in this image.",
        5: "Ally character - ally character should be not removed, replaced and modified in this image."
      },
      pageMainCharacterPoseActionEmotionPrompts: {
        1: "Cartoon style. In a dark underwater cave tunnel, the main character takes a guarded combat-ready stance while holding a spear-like tool with a focused, determined expression. The otter ally companion appears close behind in an alert protective mood. Keep both left of center, with the ally companion slightly above and behind the main character from reader perspective.",
        2: "Cartoon style. In a bright shallow reef with soft sun rays, the main character floats in place with one hand near the chin and a thoughtful, slightly worried expression as if solving a clue. Keep the main character slightly left of center. The ally companion is not the foreground focus and may stay subtle or farther from the main character.",
        3: "Cartoon style. Near a colorful underwater castle, the main character advances in a cautious action pose while gripping the spear-like tool, showing focused bravery before entering. Keep the main character left of center with the castle as the clear destination in the background. The ally companion can remain nearby but secondary in visual emphasis.",
        4: "Cartoon style. In front of a cave entrance, the main character swims forward with excited discovery energy, pointing ahead with a bright smile. The otter ally companion swims closely beside with matching enthusiasm. Keep both left of center, with the ally companion just behind and to the right of the main character from reader perspective.",
        5: "Cartoon style. Inside a grand underwater hall, the main character and otter ally celebrate success with joyful expressions and an energetic high-five gesture. Keep both slightly left of center, with the ally companion to the right of the main character from reader perspective, and preserve the elegant palace details around them."
      }
    }
  }
};

function getWorldKeyForPrompts(storyWorld: string): StoryWorldKey {
  const lower = (storyWorld || '').toLowerCase();
  if (lower.includes('forest') || lower === 'enchanted-forest' || lower === 'enchanted_forest') return 'forest';
  if (lower.includes('underwater') || lower.includes('kingdom')) return 'underwater';
  if (lower.includes('space') || lower.includes('outer')) return 'outerspace';
  return 'forest';
}

function getStyleKeyForPrompts(characterStyle: string): StoryStyleKey {
  const lower = (characterStyle || '').toLowerCase();
  if (lower.includes('anime')) return 'anime';
  if (lower.includes('cartoon')) return 'cartoon';
  return '3d';
}

function appendPageSpecificStoryRules(
  basePrompt: string,
  pageNumber: number,
  worldPrompts: WorldStoryPagePrompts
): string {
  const allyPrompt = worldPrompts.pageAllyCharacterPrompts[pageNumber];
  const posePrompt = worldPrompts.pageMainCharacterPoseActionEmotionPrompts[pageNumber];
  const sections: string[] = [basePrompt];

  if (allyPrompt) {
    sections.push(`PAGE-SPECIFIC ALLY CHARACTER RULE:\n- ${allyPrompt}`);
  }
  if (posePrompt) {
    sections.push(`PAGE-SPECIFIC MAIN CHARACTER POSE/ACTION/EMOTION RULE:\n- ${posePrompt}`);
  }

  return sections.join('\n\n');
}

function normalizeThemeKey(theme: string): string {
  return theme.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function resolveAllyNameFromPromptData(storyTheme: string | undefined, ageGroup: string): string {
  const promptData = prompt2Data as {
    generateStoryText?: {
      defaultTheme?: string;
      themeToAllyMapping?: Record<string, Record<string, string>>;
      storyTextGenerationPrompts?: Record<string, { storyVariablesByAgeGroup?: Record<string, { allyName?: string }> }>;
    };
  };
  const generateStoryText = promptData.generateStoryText;
  if (!generateStoryText) return 'Fox';

  const promptsByTheme = generateStoryText.storyTextGenerationPrompts ?? {};
  const allyMappingByTheme = generateStoryText.themeToAllyMapping ?? {};
  const themeCandidates = [storyTheme, generateStoryText.defaultTheme].filter((value): value is string => !!value);
  const normalizedPromptThemeEntries = Object.entries(promptsByTheme).map(([key, value]) => [normalizeThemeKey(key), value] as const);
  const normalizedAllyThemeEntries = Object.entries(allyMappingByTheme).map(([key, value]) => [normalizeThemeKey(key), value] as const);

  for (const themeCandidate of themeCandidates) {
    const promptTheme =
      promptsByTheme[themeCandidate] ??
      normalizedPromptThemeEntries.find(([normalizedKey]) => normalizedKey === normalizeThemeKey(themeCandidate))?.[1];
    const promptAllyName = promptTheme?.storyVariablesByAgeGroup?.[ageGroup]?.allyName;
    if (promptAllyName) return promptAllyName;

    const mappingTheme =
      allyMappingByTheme[themeCandidate] ??
      normalizedAllyThemeEntries.find(([normalizedKey]) => normalizedKey === normalizeThemeKey(themeCandidate))?.[1];
    const mappedAllyName = mappingTheme?.[ageGroup];
    if (mappedAllyName) return mappedAllyName;
  }

  return 'Fox';
}

/** Human / humanoid reference types that should inherit template outfit in two-image story scenes. */
function shouldApplyTemplateOutfitPrompt(characterType: string): boolean {
  const t = characterType.trim().toLowerCase();
  return t === 'person' || t === 'a person' || t === 'character';
}

export function buildStoryPagePrompt(
  pageNumber: number,
  storyText: string,
  characterAction: string,
  sceneDescription: string,
  options: {
    characterName: string;
    characterType: string;
    specialAbility: string;
    characterStyle: '3d' | 'cartoon' | 'anime';
    storyWorld: string;
    adventureType: string;
    ageGroup: string;
    storyTheme?: string;
    storyTitle: string;
    characterImageUrl: string;
  }
): string {
  const worldKey = getWorldKeyForPrompts(options.storyWorld);
  const styleKey = getStyleKeyForPrompts(options.characterStyle);
  const worldPrompts = STORY_STYLE_WORLD_PAGE_PROMPTS[styleKey][worldKey];

  const allyName = resolveAllyNameFromPromptData(options.storyTheme, options.ageGroup);
  const allyReplacementPrompt = worldPrompts.tempMainStoryPageAllyCharacterPrompt
    ? worldPrompts.tempMainStoryPageAllyCharacterPrompt.replace(/\[ally_name\]/g, allyName)
    : null;

  // TEMPORARY: use fixed base prompt for story page generation on /adventure-story/loading.
  // Set tempMainStoryPagePrompt to null in a world to use the prompt builder again for that world.
  if (worldPrompts.tempMainStoryPagePrompt != null) {
    let fixedPrompt = allyReplacementPrompt
      // ? `${worldPrompts.tempMainStoryPagePrompt}\n\n${allyReplacementPrompt}`
      ? `${worldPrompts.tempMainStoryPagePrompt}`
      : worldPrompts.tempMainStoryPagePrompt;
    // When reference is a person / character (including loading flow's mapCharacterType → "a person"), inherit template outfit.
    if (shouldApplyTemplateOutfitPrompt(options.characterType)) {
      const costumePrompt =
        'The replaced reference character must wear the same costumes, clothes, and outfit as the original main character of the template image (including trousers, tops, shoes, and any visible accessories or symbols).';
      fixedPrompt = `${fixedPrompt}\n\n${costumePrompt}`;
    }
    return appendPageSpecificStoryRules(fixedPrompt, pageNumber, worldPrompts);
  }

  const derivedEmotion = generateCharacterEmotion(pageNumber, storyText);
  const derivedAtmosphere = generateAtmosphereDescription(pageNumber, storyText);
  const enrichedSceneDescription = `${sceneDescription}. Atmosphere: ${derivedAtmosphere}`;

  const prompt = buildStoryScenePrompt({
    characterName: options.characterName,
    characterType: options.characterType,
    specialAbility: options.specialAbility,
    characterStyle: options.characterStyle,
    storyWorld: options.storyWorld,
    adventureType: options.adventureType,
    ageGroup: options.ageGroup,
    storyTitle: options.storyTitle,
    pageNumber,
    pageText: storyText,
    pageSceneDescription: enrichedSceneDescription,
    pageCharacterAction: characterAction,
    pageEmotion: derivedEmotion,
    companionCharacters: 'Fox',
    characterImageUrl: options.characterImageUrl,
    characterPlacement: 'left-half'
  });

  const basePromptWithRules = `${prompt}\n\nTEMPLATE LOCK (HIGHEST PRIORITY):\n- Keep the provided template artwork structurally unchanged.\n- Do not redesign background layout, props, perspective, camera, or composition.\n- If any instruction conflicts with template preservation, preserve the template and adapt only character integration.\n- Mood/style updates must be subtle and global (light/tone/color grading), not repainting.\n\nSTORY-TO-SCENE MAPPING (SECOND PRIORITY):\n- Use the exact page story text as the source of truth for action, emotion, and atmosphere.\n- Keep expressions, body language, and lighting aligned with this page's emotional beat.\n- If the story text implies calm or sleep, prefer gentle, natural poses over exaggerated action.\n\nPAGE STORY TEXT (SOURCE OF TRUTH):\n${storyText}\n\nSCENE SIGNALS DERIVED FROM STORY:\n- Character Action: ${characterAction}\n- Character Emotion: ${derivedEmotion}\n- Atmosphere: ${derivedAtmosphere}\n\nPOSE CONSTRAINTS:\n- Avoid static front-facing, T-pose, idle, or reference-sheet poses.\n- Use movement and posture that match the story beat (active, gentle, or sleepy as needed).\n- Body language and facial expression must reinforce the page emotion.\n\nFACIAL CONSISTENCY (CRITICAL ACROSS PAGES 1-5):\n- Keep the same core facial features from the reference in every story scene (face shape, eyes, eyebrows, nose, mouth, ears).\n- Do not add, remove, or swap facial features between pages (example: if the character has a visible nose, it must remain visible in all main story scenes).\n- Maintain recognizable facial proportions and feature placement while only changing expression for the page emotion.\n\nCOMPANION CONSTRAINTS:\n- Always include the ally companion with the main character in every story scene page (1-5).\n- The ally companion should be clearly visible and naturally interacting with the main character.\n\nLAYOUT CONSTRAINTS:\n- Always position the main character on the LEFT HALF of the page scene (for story pages 1-5).\n- Keep the character fully within the left half and preserve template composition.`;
  const promptWithAllyReplacement = allyReplacementPrompt
    ? `${basePromptWithRules}\n\n${allyReplacementPrompt}`
    : basePromptWithRules;

  return appendPageSpecificStoryRules(promptWithAllyReplacement, pageNumber, worldPrompts);
}

/**
 * Get back cover text blocks and options for overlay-back-cover API.
 * Layout: title (top), description, then bottom-left tagline/website, bottom-right ISBN/age.
 */
export function getBackCoverTextBlocks(): TextBlockOverlay[] {
  const bc = prompt2Data.generateStoryScene.backCover;
  const titleLine1 = (bc as { titleLine1?: string }).titleLine1 ?? 'Drawtopia Makes';
  const titleLine2 = (bc as { titleLine2?: string }).titleLine2 ?? 'Every Child a';
  const titleLine3 = (bc as { titleLine3?: string }).titleLine3 ?? 'Storyteller';
  const titleText = [titleLine1, titleLine2, titleLine3].join('\n');
  const description = bc.description ?? '';
  const tagline = (bc as { tagline?: string }).tagline ?? "Their imagination. Their characters. Their stories. Enhanced, not replaced.";
  const website = (bc as { website?: string }).website ?? 'drawtopia.ai';
  const isbnPlaceholder = (bc as { isbnPlaceholder?: string }).isbnPlaceholder ?? 'ISBN placeholder';
  const ageRange = (bc as { ageRange?: string }).ageRange ?? '[Age 6-12]';

  const lightColor = '#e8ecf0';
  const baseStyle = { color_hex: lightColor, alignment: 'center' as const, shadow: false };

  return [
    { text: titleText, font_size: 42, ...baseStyle, y_position: 0.12, alignment: 'center' },
    { text: description, font_size: 24, ...baseStyle, y_position: 0.34, alignment: 'center' },
    { text: tagline, font_size: 18, color_hex: lightColor, y_position: 0.78, alignment: 'left', shadow: false },
    { text: website, font_size: 16, color_hex: lightColor, y_position: 0.90, alignment: 'left', shadow: false },
    { text: isbnPlaceholder, font_size: 14, color_hex: lightColor, y_position: 0.80, alignment: 'right', shadow: false },
    { text: ageRange, font_size: 14, color_hex: lightColor, y_position: 0.94, alignment: 'right', shadow: false }
  ];
}

/**
 * Call backend overlay-back-cover API (text + optional logo + barcode).
 */
export async function overlayBackCover(
  imageUrl: string,
  textBlocks: TextBlockOverlay[],
  options: { logoUrl?: string; barcodeIsbn?: string; backendBaseUrl?: string }
): Promise<{ success: boolean; url?: string; error?: string }> {
  const base = options.backendBaseUrl ?? env.PUBLIC_BACKEND_URL;
  const url = `${base.replace(/\/$/, '')}/overlay-back-cover/`;
  try {
    const body: Record<string, unknown> = {
      image_url: imageUrl,
      text_blocks: textBlocks.map((b) => ({
        text: b.text,
        font_size: b.font_size ?? 48,
        color_hex: b.color_hex ?? '#1a1a1a',
        y_position: b.y_position ?? 0.5,
        alignment: b.alignment ?? 'center',
        shadow: b.shadow ?? false,
        shadow_color: b.shadow_color,
        shadow_offset: b.shadow_offset
      }))
    };
    if (options.logoUrl) body.logo_url = options.logoUrl;
    if (options.barcodeIsbn) body.barcode_isbn = options.barcodeIsbn;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(errText || `Back cover API failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.url) {
      return { success: true, url: data.url.split('?')[0] };
    }
    return { success: false, error: data.message || 'No URL in back cover response' };
  } catch (error) {
    console.error('Error creating back cover:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Build back cover prompt (kept for legacy use)
 */
export function buildBackCoverPrompt(): string {
  return prompt2Data.generateStoryScene.backCover.basePrompt;
}

/**
 * Generate action descriptions based on page number and story context
 */
export function generateCharacterAction(pageNumber: number, storyWorld: string, storyText?: string): string {
  const worldKey = (storyWorld || '').toLowerCase();
  const worldMotion = worldKey.includes('underwater') ? 'swimming' : worldKey.includes('space') ? 'floating and maneuvering' : 'running';
  const actions: { [key: number]: string } = {
    1: "Character is discovering or entering a new world with forward movement and curious body language",
    2: `Character is exploring the environment with active ${worldMotion} motion`,
    3: "Character is actively overcoming an obstacle in a dynamic mid-action pose (not static)",
    4: "Character is using their special ability to solve the main challenge in a powerful action pose",
    5: "Character is celebrating success or reflecting warmly with expressive movement"
  };

  const fallback = actions[pageNumber] || "Character is actively participating in the scene with clear movement";

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  // Prefer a concrete action sentence from the page text when available.
  const actionSentence = storyText
    .split(/[.!?]/)
    .map((s) => s.trim())
    .find((s) => /(run|running|jump|jumping|climb|climbing|fly|flying|swim|swimming|use|using|open|opening|reach|reaching|rescue|help|helping|solve|solving|search|find|finding|follow|following|hold|holding|push|pull|dodge|celebrate|celebrating|breathe|breathing|settle|settling|nestle|nestled|relax|relaxing|drift|drifting|sleep|sleeping|rest|resting|whisper|whispering)/i.test(s));

  if (!actionSentence) {
    return fallback;
  }

  return `${actionSentence}. Use a storytelling pose with clear intent that matches the page mood (active when needed, gentle when sleepy).`;
}

/**
 * Derive character emotion from the generated story text.
 */
export function generateCharacterEmotion(pageNumber: number, storyText?: string): string {
  const defaultEmotions: { [key: number]: string } = {
    1: 'curious and emotionally open',
    2: 'safe and trusting',
    3: 'concerned but brave',
    4: 'peaceful pride',
    5: 'sleepy and content'
  };
  const fallback = defaultEmotions[pageNumber] || 'warm and engaged';

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  const lower = storyText.toLowerCase();
  if (/(sleepy|drowsy|eyes.*(heavy|closing)|drift|dream)/.test(lower)) return 'drowsy, calm, and ready for sleep';
  if (/(peaceful|calm|settled|relaxed|safe)/.test(lower)) return 'calm, safe, and relaxed';
  if (/(sad|lonely|worried|anxious|too awake|restless)/.test(lower)) return 'tender concern with gentle reassurance';
  if (/(happy|smile|joy|proud|wonderful)/.test(lower)) return 'quiet joy and peaceful pride';
  if (/(wonder|curious|maybe|discover|learn)/.test(lower)) return 'curious and hopeful';

  return fallback;
}

/**
 * Derive atmosphere and visual mood from the generated story text.
 */
export function generateAtmosphereDescription(pageNumber: number, storyText?: string): string {
  const defaults: { [key: number]: string } = {
    1: 'soft twilight, gentle cozy lighting, inviting wonder',
    2: 'warm mentorship, calm pacing, safe and peaceful environment',
    3: 'empathetic guidance, focused calm, comforting support',
    4: 'quiet triumph, warm glow, peaceful connection',
    5: 'very soft moonlit bedtime calm, hushed and sleepy'
  };
  const fallback = defaults[pageNumber] || 'warm storybook atmosphere';

  if (!storyText || storyText.trim().length === 0) {
    return fallback;
  }

  const lower = storyText.toLowerCase();
  if (/(sleepy|drowsy|dream|whisper|moonlight|settled|nestled|eyes.*heavy)/.test(lower)) {
    return 'hushed bedtime mood, soft moonlight, slow quiet rhythm, sleep-inducing calm';
  }
  if (/(sad|lonely|worried|anxious|restless)/.test(lower)) {
    return 'gentle supportive atmosphere, tender lighting, emotionally safe and non-scary';
  }
  if (/(calm|peaceful|safe|breathe|breathing|relax)/.test(lower)) {
    return 'calming atmosphere with soft light, slow pace, and emotional safety';
  }
  if (/(smile|happy|joy|proud|wonderful|connection)/.test(lower)) {
    return 'warm, peaceful celebration with quiet joy and comforting light';
  }

  return fallback;
}

/**
 * Normalize story world to the keys used in worldDescriptions (forest, underwater, outerspace).
 */
function normalizeStoryWorldForDescriptions(storyWorld: string): string {
  const lower = (storyWorld || '').toLowerCase();
  if (lower.includes('forest') || lower === 'enchanted-forest' || lower === 'enchanted_forest') return 'forest';
  if (lower.includes('underwater') || lower.includes('kingdom')) return 'underwater';
  if (lower.includes('space') || lower.includes('outer')) return 'outerspace';
  return 'forest';
}

/**
 * Generate scene descriptions based on page number and story world
 */
export function generateSceneDescription(pageNumber: number, storyWorld: string, storyText?: string): string {
  const worldKey = normalizeStoryWorldForDescriptions(storyWorld);
  const worldDescriptions: { [key: string]: { [key: number]: string } } = {
    'forest': {
      1: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page1,
      2: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page2,
      3: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.enchantedForest.page5
    },
    'underwater': {
      1: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page1,
      2: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page2,
      3: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.underwaterKingdom.page5
    },
    'outerspace': {
      1: "A space station or planet entrance with stars and cosmic elements",
      2: "Deep space with planets, asteroids, and cosmic wonders",
      3: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page3,
      4: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page4,
      5: prompt2Data.generateStoryScene.worldSpecific.outerSpace.page5
    }
  };

  const descriptions = worldDescriptions[worldKey] || worldDescriptions['forest'];
  const baseDescription = descriptions[pageNumber] || `Scene ${pageNumber} in ${worldKey}`;
  
  // Add story text excerpt if available
  if (storyText && storyText.trim().length > 0) {
    const excerpt = storyText.length > 100 ? storyText.substring(0, 100) + '...' : storyText;
    return `${baseDescription}. Story context: ${excerpt}`;
  }
  
  return baseDescription;
}

/**
 * Call edit-image endpoint with one image and prompt
 */
const getImageApiBaseUrl = (): string => {
  const base = env.PUBLIC_BACKEND_URL || '';
  return base.replace(/\/api\/?$/, '').replace(/\/$/, '') || 'https://image-edit-five.vercel.app';
};

export async function generateImageWithSingleTemplate(
  templateImageUrl: string,
  prompt: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const baseUrl = getImageApiBaseUrl();
    const response = await fetch(`${baseUrl}/edit-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: templateImageUrl,
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate image: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.storage_info?.uploaded && data.storage_info?.url) {
      return {
        success: true,
        url: data.storage_info.url.split('?')[0]
      };
    } else {
      return {
        success: false,
        error: 'No image URL received from API'
      };
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Call generate-cover-image endpoint with two images and prompt
 */
export async function generateImageWithTwoTemplates(
  templateImageUrl: string,
  characterImageUrl: string,
  prompt: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const baseUrl = getImageApiBaseUrl();
    const response = await fetch(`${baseUrl}/generate-cover-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_cover_url: templateImageUrl,
        character_image_url: characterImageUrl,
        prompt: prompt,
      }),
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to generate image: ${response.status}${errText ? ` - ${errText}` : ''}`);
    }
    
    const data = await response.json();
    // Accept both formats: GenerateCoverImageResponse (success, url) or ImageResponse (storage_info.url)
    const url = data.url ?? data.storage_info?.url;
    if (data.success && url) {
      return {
        success: true,
        url: String(url).split('?')[0]
      };
    }
    return {
      success: false,
      error: data.message || data.detail || 'No image URL received from API'
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate all book pages in sequence
 */
export interface GenerateBookPagesOptions {
  bookTemplate: BookTemplate;
  characterImageUrl: string;
  childName: string;
  characterName: string;
  dedicationMessage: string;
  storyPages: Array<{ pageNumber: number; text: string }>;
  storyWorld: string;
  characterType?: string;
  specialAbility?: string;
  characterStyle?: '3d' | 'cartoon' | 'anime';
  adventureType?: string;
  ageGroup?: string;
  storyTitle?: string;
  onProgress?: (step: string, progress: number) => void;
  /** When true, only generate story page images (skip copyright, dedication, last word, back cover). */
  storyPagesOnly?: boolean;
  /** Optional: when true, abort the generation loop (e.g. user cancelled). */
  shouldAbort?: () => boolean;
}

export interface GenerateBookPagesResult {
  success: boolean;
  storyPageImageUrls?: string[];
  backCoverImageUrl?: string;
  error?: string;
}

export async function generateAllBookPages(
  options: GenerateBookPagesOptions
): Promise<GenerateBookPagesResult> {
  const {
    bookTemplate,
    characterImageUrl,
    childName,
    characterName,
    dedicationMessage,
    storyPages,
    storyWorld,
    characterType = 'person',
    specialAbility = 'special ability',
    characterStyle = 'cartoon',
    adventureType = 'Treasure Hunt',
    ageGroup = '7-10',
    storyTitle = 'Adventure Story',
    onProgress,
    storyPagesOnly = false,
    shouldAbort
  } = options;
  
  const result: GenerateBookPagesResult = {
    success: false,
    storyPageImageUrls: []
  };
  
  try {
    // Validate required inputs
    if (!bookTemplate) {
      throw new Error('Book template is required');
    }
    
    if (!characterImageUrl) {
      throw new Error('Character image URL is required');
    }
    
    if (!storyPages || storyPages.length === 0) {
      throw new Error('Story pages are required');
    }
    
    // Validate story pages have text
    const validPages = storyPages.filter(p => p && p.text && p.text.trim().length > 0);
    if (validPages.length === 0) {
      throw new Error('Story pages must have text content');
    }
    
    console.log(`Generating book pages for ${validPages.length} story pages${storyPagesOnly ? ' (story pages only)' : ''}`);
    if (!storyPagesOnly) {
      console.log('Book template fields:', {
        hasBackCover: !!bookTemplate.back_cover_image,
        storyPagesCount: bookTemplate.story_page_images?.length || 0
      });
    }

    const logoUrl = env.PUBLIC_APP_URL ? `${env.PUBLIC_APP_URL.replace(/\/$/, '')}${LOGO_PATH}` : undefined;
    
    // Generate story page images
    if (onProgress) onProgress('Generating story pages...', storyPagesOnly ? 10 : 30);
    const totalPages = validPages.length;
    // Keep strict page-index alignment (index 0 => page 1, ..., index 4 => page 5)
    // so a failed page generation never shifts later pages.
    const storyPageImages: string[] = new Array(totalPages).fill('');
    
    for (let i = 0; i < totalPages; i++) {
      if (shouldAbort?.()) {
        console.warn('Story page image generation aborted');
        break;
      }
      const page = validPages[i];
      
      if (!page || !page.text) {
        console.warn(`Skipping invalid page at index ${i}`);
        continue;
      }
      
      const pageNumber = page.pageNumber || (i + 1);
      const templateImage = bookTemplate.story_page_images?.[i];
      
      if (!templateImage) {
        console.warn(`No template image for story page ${pageNumber}`);
        // Fallback to character image so the page slot is never omitted.
        storyPageImages[i] = characterImageUrl;
        continue;
      }
      
      const progress = storyPagesOnly
        ? 10 + ((i + 1) / totalPages) * 90  // 10-100%
        : 30 + ((i + 1) / totalPages) * 40; // 30-70%
      if (onProgress) onProgress(`Generating story page ${pageNumber}...`, progress);
      
      try {
        const characterAction = generateCharacterAction(pageNumber, storyWorld, page.text);
        const sceneDescription = generateSceneDescription(pageNumber, storyWorld, page.text);
        const storyPagePrompt = buildStoryPagePrompt(pageNumber, page.text, characterAction, sceneDescription, {
          characterName,
          characterType,
          specialAbility,
          characterStyle,
          storyWorld,
          adventureType,
          ageGroup,
          storyTitle,
          characterImageUrl
        });
        
        let storyPageResult = await generateImageWithTwoTemplates(
          templateImage,
          characterImageUrl,
          storyPagePrompt
        );

        // Retry once for transient generation failures.
        if (!(storyPageResult.success && storyPageResult.url)) {
          console.warn(`Retrying story page ${pageNumber} generation once...`);
          storyPageResult = await generateImageWithTwoTemplates(
            templateImage,
            characterImageUrl,
            storyPagePrompt
          );
        }
        
        if (storyPageResult.success && storyPageResult.url) {
          storyPageImages[i] = storyPageResult.url;
          console.log(`✅ Story page ${pageNumber} generated successfully`);
        } else {
          console.error(`❌ Failed to generate story page ${pageNumber}:`, storyPageResult.error);
          // Keep page slot populated to avoid omission/shifting.
          storyPageImages[i] = templateImage;
        }
      } catch (error) {
        console.error(`❌ Error generating story page ${pageNumber}:`, error);
        // Keep page slot populated to avoid omission/shifting.
        storyPageImages[i] = templateImage;
        // Continue with next page even if one fails
      }
    }
    
    result.storyPageImageUrls = storyPageImages;
    const generatedCount = storyPageImages.filter((url) => !!url).length;
    console.log(`Generated ${generatedCount} out of ${totalPages} story page image slots`);
    
    // Back cover (skipped when storyPagesOnly)
    if (!storyPagesOnly) {
      if (onProgress) onProgress('Creating back cover...', 85);
      if (bookTemplate.back_cover_image) {
        console.log('Creating back cover with text, logo and barcode:', bookTemplate.back_cover_image);
        const backCoverBlocks = getBackCoverTextBlocks();
        const backCoverResult = await overlayBackCover(
          bookTemplate.back_cover_image,
          backCoverBlocks,
          {
            logoUrl,
            barcodeIsbn: '978012345678'
          }
        );
        if (backCoverResult.success && backCoverResult.url) {
          result.backCoverImageUrl = backCoverResult.url;
          console.log('✅ Back cover created:', backCoverResult.url);
        } else {
          console.error('❌ Failed to create back cover:', backCoverResult.error);
        }
      } else {
        console.warn('⚠️ Back cover template image not found in book template');
      }
    }
    
    if (onProgress) onProgress('Complete!', 100);
    result.success = true;
    
  } catch (error) {
    console.error('Error generating book pages:', error);
    result.error = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return result;
}
