type AgeGroupKey = '3-6' | '7-10' | '11-12';
type StoryWorldKey = 'enchanted-forest' | 'outer-space' | 'underwater-kingdom';
type LearningThemeKey = 'courage' | 'kindness' | 'connection' | 'patience' | 'bedtime';
type CharacterGender = 'male' | 'female' | 'non_binary';

interface AdventureStoryTemplateInput {
  storyWorld?: string;
  ageGroup?: string;
  learningTheme?: string;
  characterName: string;
  characterGender?: string;
  specialAbility: string;
}

const adventureStoryTemplates: Record<
  StoryWorldKey,
  Record<AgeGroupKey, Record<LearningThemeKey, string[]>>
> = {
  'enchanted-forest': {
    '3-6': {
      courage: [
        `[CHARACTER_NAME] could not sleep. Tonight felt different. The forest outside was calling, and she could feel it in her chest like something that had not been finished yet.`,
        `At the gate, Fern - a wise forest fox with gentle eyes and a warm russet coat - was waiting. "The oldest tree has gone dark," he said. "I think you can help." [CHARACTER_NAME] felt scared. But she followed anyway.`,
        `The forest got very dark. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY]. Nothing happened. She tried again. Still nothing. Fern said, "Try again." She did. The darkness pressed in close. She took one step back toward home. Then she stopped. Then she turned around.`,
        `The old tree was grey and still. [CHARACTER_NAME] pressed her hands to it and waited. Nothing happened for a long time. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. Then the whole tree blazed with light.`,
        `All the animals cheered. Fern smiled his quiet fox smile. "You were scared," he said. "And you stayed." [CHARACTER_NAME] looked at her hands. She felt like herself, but now she knew something new about who that was.`
      ],
      kindness: [
        `[CHARACTER_NAME] heard something small crying in the dark forest. She did not think about whether it was a good idea. She just got up.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was at the gate with a tiny shivering creature. "It needs a kind heart," he said. [CHARACTER_NAME] knelt down and reached out slowly.`,
        `Deep in the forest, more animals were lost and cold. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to help them all at once. Nothing came. She tried again. Still nothing. Fern did not panic. "One at a time," he said. She started with the smallest one.`,
        `At the great tree she found a nest that had fallen. [CHARACTER_NAME] held it carefully and waited. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The eggs inside began to move.`,
        `The forest was full of sound and life again. Fern said, "Kindness grows when you share it." [CHARACTER_NAME] smiled all the way home.`
      ],
      connection: [
        `[CHARACTER_NAME] felt lonely sitting by herself. She looked out at the forest and wondered if someone out there felt the same way.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was sitting alone at the gate. "I was hoping someone would come," he said. [CHARACTER_NAME] sat down next to him. That felt better already.`,
        `The trees in the forest had grown so far apart they could not see each other in the dark. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to reach them. Nothing came. She tried again. Still nothing. She walked toward the nearest tree anyway and pressed her hand to its bark.`,
        `[CHARACTER_NAME] kept her hands on the bark and waited. Nothing happened for a long time. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The glow spread from tree to tree like hands reaching across the dark.`,
        `"No one has to be alone," said Fern. All the creatures were together now. [CHARACTER_NAME] stood in the middle and felt full.`
      ],
      patience: [
        `[CHARACTER_NAME] wanted something to happen right now. But nothing would. She sat very still and waited. The forest outside did not hurry either. It just stood there, the way forests do.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was watching a tiny seed at the gate. "Good things take time," he said. [CHARACTER_NAME] sat beside him to watch too.`,
        `In the forest a small creature was stuck. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to help it fast. It got more stuck. She tried again. Still stuck. She slowed all the way down. She waited. Then she tried once more, gently.`,
        `At the old tree nothing happened when she first touched it. She kept her hands there and waited. Nothing happened for a long time. Then, very slowly, [SPECIAL_ABILITY] came back. It grew from the inside out, slow and warm, until the whole tree was awake.`,
        `"Patience made that possible," said Fern. [CHARACTER_NAME] nodded. Some things could not be rushed. And that was okay.`
      ],
      bedtime: [
        `[CHARACTER_NAME] did not want the night to end. But the forest was going quiet outside. And she was getting quiet too, whether she wanted to or not.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was at the gate. "Every good thing needs rest," he said. [CHARACTER_NAME] thought about that as they walked slowly together.`,
        `The forest creatures were finding their beds. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to keep going. Nothing came. She tried again. Her body was done for the night. Even the fireflies were blinking out one by one.`,
        `She touched the ancient tree goodnight. She kept her hand there and waited. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. A soft pulse. The tree seemed to say: rest now. Tomorrow you can try again.`,
        `[CHARACTER_NAME] went home. She washed. She changed. She climbed into bed. She thought about the forest, resting. Then she stopped thinking.`
      ]
    },
    '7-10': {
      courage: [
        `[CHARACTER_NAME] sat by the window long after she should have been asleep. The forest was restless tonight, and she could feel it pulling at her chest like something unfinished. She pressed her hands together. Something out there needed her, even if she couldn't explain what.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was sitting at the gate. "The oldest tree has gone dark," he said quietly. "I think you can help." [CHARACTER_NAME] crossed her arms. "What if I can't?" Fern looked at her steadily. "I didn't say it would be easy. I said I think you can help." He turned and walked down the path. After a long moment, she followed.`,
        `The deeper they walked, the darker it got. [CHARACTER_NAME] reached for [SPECIAL_ABILITY]. Nothing came. She tried again. A faint flicker, then nothing. "Fern." Her voice came out smaller than she wanted. "Try again," he said. She did. The trees pressed in close. Every instinct said to go back. She took one full step toward home. Then stopped. Then turned around. That was the whole decision.`,
        `The ancient tree stood grey and still at the center of the clearing. [CHARACTER_NAME] pressed both hands flat against the bark. Nothing. She pressed harder and held her breath. The forest went completely quiet, the kind of quiet that feels like a question. She kept her hands there anyway. Ten seconds. Twenty. Her arms started to shake. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. Not all at once. One degree at a time. Until every branch was burning gold.`,
        `Walking back, [CHARACTER_NAME] was quiet. Eventually Fern said, "Whatever you were reaching for back there - it stopped working." "I know," she said. "But you stayed anyway." "I know." He glanced sideways at her. "That part was all you." At the castle gate, the animals had gathered. Their sound filled the whole night. She looked at her hands. Something was steadier in them than before.`
      ],
      kindness: [
        `[CHARACTER_NAME] heard it from her room: a small, sad sound coming from the dark forest. She didn't think about whether it was a good idea. She just got up.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was crouched beside a shivering creature half-buried in leaves. "It got separated," he said. "It's too scared to move." [CHARACTER_NAME] knelt down slowly. "It's okay," she said. "You're not alone anymore."`,
        `Further in, more animals were cold and separated in the dark. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to help them all. Nothing came. She tried again. Still nothing. Fern said nothing, which was more useful than advice. She went to the most frightened one first and started there.`,
        `At the great tree, she found a nest that had fallen. Her first instinct was to rush. But she stopped herself, held the nest in both hands, and waited. She kept her hands there anyway. Ten seconds. Twenty. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. She held on. One egg rocked. Then another.`,
        `Fern said, "Kindness multiplies when you share it without keeping score." [CHARACTER_NAME] looked around at the forest, full of sound and life again. She had given what she had. Somehow there was more of it now, not less.`
      ],
      connection: [
        `[CHARACTER_NAME] sat in her room surrounded by all her things and felt, for some reason she couldn't name, completely alone. She pressed her hands flat against the cold window and looked out at the forest, wondering if anything out there felt the same way.`,
        `She found Fern - a wise forest fox with gentle eyes and a warm russet coat - sitting by himself at the gate, very still. "I was hoping someone would come," he said. [CHARACTER_NAME] sat beside him without saying anything at first. That felt better. Not because anything had changed. Because someone was there.`,
        `The trees had grown so far apart their branches no longer touched. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to bridge the distance. Nothing came. She tried again. Still nothing. She walked between them anyway and pressed a hand to the nearest trunk, letting the tree know she was there.`,
        `She went to each tree and kept her hands there. Nothing happened for a long time. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. It moved from tree to tree like a question being answered. The whole forest hummed. Not loudly. But steadily.`,
        `"You can't force connection," Fern said. "But you can make light so people find their way to each other." [CHARACTER_NAME] stood in the center of the connected forest. She had felt alone at the start of the night. She didn't feel that way anymore.`
      ],
      patience: [
        `[CHARACTER_NAME] had been trying all evening to make things work exactly the way she wanted. They kept doing something slightly different instead. She sat down and huffed. The forest outside didn't hurry. The trees just stood there. She noticed that.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was at the gate watching a small seed in the dirt with total concentration. "Has it done anything?" she asked. "Not yet," he said, not looking up. "I've been here an hour." She sat down next to him.`,
        `A young creature in the forest was wedged under a root and panicking. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to free it quickly. It struggled harder. She tried again. Still worse. She pulled back completely. She took a breath. She moved slowly the second time, voice low, and the creature calmed.`,
        `[CHARACTER_NAME] placed her hands on the ancient tree and waited. One minute. Two. The forest was so quiet she could hear her own heartbeat. She did not move. She did not rush. She just stayed present. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. Not all at once. One degree at a time. Until the whole tree answered.`,
        `"Patience isn't waiting," said Fern on the way back. "It's staying open while you wait." [CHARACTER_NAME] thought about that the whole walk home. She had wanted things to happen on her schedule. Tonight had taught her a different one.`
      ],
      bedtime: [
        `[CHARACTER_NAME] did not want the night to end. There was still so much she wanted to do. But something in her was slowing down on its own, the way the forest outside was quieting whether anyone asked it to or not.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was stretching slowly at the gate. "Every powerful thing needs rest to stay powerful," he said. [CHARACTER_NAME] thought about that. She had never considered why.`,
        `The forest was putting itself to bed. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] one more time. Nothing came. She tried again. Her body had reached its limit. Even the oldest trees were breathing more slowly. She matched her breathing to theirs without meaning to.`,
        `She found the ancient tree and pressed one hand gently to its bark. She kept her hand there and waited. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. A single pulse, slow and warm. The tree seemed to lean into her hand. "Rest now," it said, in whatever language trees use. "Tomorrow you can try again."`,
        `[CHARACTER_NAME] came home. She washed her face, changed, climbed into bed without being asked. She thought about the forest, resting. Then she stopped thinking.`
      ]
    },
    '11-12': {
      courage: [
        `[CHARACTER_NAME] had been sitting by the window for a long time, watching the forest move in ways she couldn't explain. She could feel it: something out there that needed answering. She pressed her hands together and felt the familiar doubt settle in her chest. What if she went out there and had nothing to offer? The lantern on the table burned steadily. She could not say the same for herself.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was waiting at the gate with the quiet certainty of someone who had learned that certainty is earned, not assumed. "The oldest tree has gone dark," he said. "The forest is frightened." [CHARACTER_NAME] told him the truth: she wasn't confident she had what this needed. He didn't dismiss it. He said, "I didn't say you'd succeed. I said I think you can help." The difference felt important. She followed him into the dark.`,
        `The forest became the kind of dark that makes you question your own eyes. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. The absence of it was louder than anything else in the forest. She noticed the pull to announce the failure and ask permission to stop. She recognized that pull. She kept moving instead. That was the whole decision - not to act, but to stop retreating.`,
        `The ancient tree had the weight of something very old and very tired. [CHARACTER_NAME] pressed both palms to the bark and waited. Nothing. The silence was the kind that asks whether you'll leave. She held on through thirty seconds of nothing. The silence was the kind that asks whether you will leave. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to but needed her to stay long enough to receive it. She did not let go until every branch was lit.`,
        `Walking back, [CHARACTER_NAME] noticed that courage had not felt the way she expected. It hadn't felt like strength. It had felt like refusing to leave. Fern walked quietly beside her. After a while he said, "You stayed when nothing was working. That's the part nobody can teach." At the gate, the animals had gathered. She looked at her hands. Something was steadier in them than before. She had been scared. She had stayed. Those two facts now lived in her permanently.`
      ],
      kindness: [
        `[CHARACTER_NAME] heard the sound before she registered what it meant: something small, in pain, somewhere in the dark forest. She was tired. It was late. She almost talked herself out of it. But she pulled on her shoes.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - had found a creature wedged deep in the gate's stone wall, shaking too hard to respond. "It doesn't trust anyone right now," he said. [CHARACTER_NAME] understood something about that. She didn't try to fix it immediately. She sat near it and let her presence be the first thing, until she felt its breathing slow.`,
        `The forest held more than she'd expected: animals cold, separated, some injured. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to help them all. Nothing came. She tried again. Still nothing. Fern said nothing, which was the right call. She moved to the most frightened first, then the next, resisting the urge to try to fix everything at once. Kindness at scale, she was discovering, required a kind of discipline.`,
        `The nest at the base of the ancient tree held three eggs, cold from the storm. [CHARACTER_NAME] sat cross-legged in the mud and held them in both hands. She held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to but needed her to stay long enough to receive it. The first egg rocked against her fingers. She realized that patience was not the opposite of kindness. It was part of it.`,
        `"Kindness isn't a feeling," Fern said on the walk back. "It's a practice. You do it even when it costs you something." [CHARACTER_NAME] thought about the mud and the hour and the nest. She didn't feel resentful. She felt full in a way that was different from happiness. More like rightness.`
      ],
      connection: [
        `[CHARACTER_NAME] had not been able to name what she was feeling all evening. It wasn't sadness, exactly. It was the particular loneliness of being in a room full of your own things and realizing that things don't answer back. She pressed her hands against the cold glass and looked at the forest, wondering if there was something out there that would look back.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was sitting alone at the gate and didn't seem embarrassed about it. "I was hoping someone would come tonight," he said simply. [CHARACTER_NAME] sat beside him without knowing what to say. The quiet had changed quality. It was the same silence. But it was shared now.`,
        `The trees had grown away from each other over years of small separations. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to bridge them. She reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She walked between the trees anyway, pressing a hand to each one, letting them know the others were still there.`,
        `She held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to. It traveled between the trees along paths she couldn't see. The forest hummed at a frequency just below sound, the way a room feels different when everyone in it finally understands each other.`,
        `"You can't force people to connect," Fern said. "But you can be a light that makes it easier for them to find each other." [CHARACTER_NAME] thought about the window, her cold hands on the glass, looking for something to look back. Something had. And now she understood that connection wasn't about finding someone who understood you. It was about making it easier for everyone to be seen.`
      ],
      patience: [
        `[CHARACTER_NAME] had been fighting with herself all evening, wanting things to happen on her schedule. She understood intellectually that forcing it didn't help. Understanding and doing are different muscles. She slammed her hands down on the mattress and sat in the dark. The forest outside sat there too, not doing anything, not trying to be anything. She found that both irritating and instructive.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was at the gate with complete attention fixed on a seed that had been in the same patch of dirt for three days. He was not bored. He was not impatient. "Precision," he said when she asked how he stayed interested, "is just patience given a direction." She wrote that down.`,
        `A young animal trapped under roots had already panicked itself deeper into the tangle. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She pulled back completely. She thought about what she'd just seen. She went in again differently: slower, reading the resistance instead of fighting it. The animal's breathing slowed. Then it was free.`,
        `[CHARACTER_NAME] placed her hands on the ancient tree and held them there for what might have been four minutes or might have been twenty. She held on through the silence and found, underneath the waiting, something she could only call presence: the experience of being fully somewhere without the need for it to become something else. Then [SPECIAL_ABILITY] came back, arriving the way something does when it was always going to but needed her to stay long enough to receive it. It had always been coming.`,
        `"Most things work better when you stop trying to control the timing," Fern said, which she suspected was obvious and also one of those things you have to learn yourself to actually know. [CHARACTER_NAME] walked home and thought about all the things she had been rushing that might open differently if she gave them the time they were asking for.`
      ],
      bedtime: [
        `[CHARACTER_NAME] had a habit of treating the end of the day as a negotiation she could win. She was aware of this. She had not yet changed it. She sat by the window and let herself feel the tiredness without fighting it. Outside, the forest was doing the same thing. Even the most alive things had rhythms that required rest.`,
        `Fern - a wise forest fox with gentle eyes and a warm russet coat - was at the gate, moving at his own kind of slowing. "Power that doesn't rest becomes brittle," he said. [CHARACTER_NAME] thought about that as they walked. She had always treated sleep as something that interrupted life. She was beginning to understand it was part of it.`,
        `The forest at this hour had a different quality. Everything was present but less insistent. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] one last time. She reached for [SPECIAL_ABILITY] and found silence where it should have been. Her body had reached its limit for the day. The owls moved without hurry. She noticed how the forest didn't resist its own rhythms, and felt the permission in that.`,
        `She said goodnight to the ancient tree with one hand against its bark. She held on through the silence and felt, underneath the waiting, its heartbeat: long and slow, the rhythm of something very old that had learned to conserve itself across centuries. Then [SPECIAL_ABILITY] came back, just enough - one quiet pulse. She took her hand away.`,
        `[CHARACTER_NAME] came home and moved through her routine without resentment: washing, changing, the small reliable steps that told her body the day was complete. She thought about the forest, resting. She thought about tomorrow. Then she stopped thinking.`
      ]
    }
  },
  'outer-space': {
    '3-6': {
      courage: [
        `[CHARACTER_NAME] looked out the big window of the space station. The stars went on forever. Something out there was calling her, and she could feel it even though she couldn't explain it.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - beeped and spun his antenna. "A beacon has gone dark," he said. "Ships can't find their way without it. Will you come?" [CHARACTER_NAME] felt scared. Space was very big. But she nodded and followed Nova out into the stars.`,
        `The asteroid field was dark and jumbled. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY]. Nothing happened. She tried again. Still nothing. "Try again," said Nova. She did. The rocks moved close around them. She took one step back toward the station. Then stopped. Then turned around.`,
        `The beacon was barely glowing. [CHARACTER_NAME] pressed her hands to it and waited. Nothing happened for a long time. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The beacon blazed back to full light.`,
        `Nova beeped and spun with joy. "You were scared and you stayed!" [CHARACTER_NAME] looked at her hands. She had been brave in the biggest place there was.`
      ],
      kindness: [
        `[CHARACTER_NAME] spotted something small drifting alone outside the space station window. It was a tiny moon that had lost its planet. She wanted to help.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - found the little moon spinning sadly. "It needs a friend," he said. [CHARACTER_NAME] floated up to it and reached out gently. "You're not alone," she said.`,
        `More small moons and stardust trails were lost too. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to gather them all at once. Nothing came. She tried again. Still nothing. Nova said nothing. She went to the nearest one first and started there.`,
        `She brought all the small moons to the swirl of light at the center and held them there. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The moons began to orbit each other. They had a home now.`,
        `"Kindness makes the universe bigger," said Nova. [CHARACTER_NAME] watched the small moons spin happily together and felt warm inside.`
      ],
      connection: [
        `[CHARACTER_NAME] stood at the big window and felt very small. Space was so big. She wondered if anyone out there felt small too.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - beeped softly beside her. "I feel small too sometimes," he said. [CHARACTER_NAME] looked at him. She had not known robots could feel things. "Oh," she said. That was enough.`,
        `Out in the asteroid field, stars were too far apart to see each other. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to reach them. Nothing came. She tried again. Still nothing. She stretched her arms wide and held them there anyway.`,
        `She went from star to star and held on at each one. Nothing happened for a long time at each one. Then, very slowly, [SPECIAL_ABILITY] came back. It moved from star to star like a question being answered. The sky got louder. Not with sound. With light.`,
        `"You made them see each other," said Nova. [CHARACTER_NAME] looked out at the connected sky. She did not feel small anymore.`
      ],
      patience: [
        `[CHARACTER_NAME] kept trying to make things work exactly right. They kept doing something slightly different. She huffed. The stars outside did not huff. They just burned.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - was watching a comet move very slowly across the sky. "It's been traveling for a thousand years," he said. [CHARACTER_NAME] sat down to watch too. A thousand years. That was a long time to go somewhere.`,
        `A small planet was still forming from dust and gas in the nebula. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to speed it up. It scattered. She tried again. It scattered again. She pulled back completely and waited instead. The dust came back together on its own.`,
        `[CHARACTER_NAME] pressed her hands toward a fading star and waited. She kept her hands there and waited. Nothing happened for a long time. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The star answered.`,
        `"Space takes its time," said Nova. "So do good things." [CHARACTER_NAME] looked at the star now glowing again. She had not rushed it. That made the result feel better.`
      ],
      bedtime: [
        `[CHARACTER_NAME] watched the stars from the station window. They were so bright. But even stars had a rhythm. Her eyes were getting heavy. It was nearly time.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - dimmed his own lights to half. "Even the sun rests on the other side of the planet," he said. [CHARACTER_NAME] had not thought of it that way. Rest was not stopping. It was the other side.`,
        `In the nebula, gas clouds were pulling together slowly for the night. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] one last time. Nothing came. Her body had reached its limit for the day. The whole universe had a bedtime. She followed its example.`,
        `She pressed her hands to the center of the swirl and felt the heartbeat of space: slow, deep, reliable. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. One pulse. "Goodnight," she whispered. The light pulsed once in reply.`,
        `Back at the station, [CHARACTER_NAME] changed into her sleep suit and climbed into her bunk. Through the porthole, stars wheeled slowly overhead. She watched them until she couldn't.`
      ]
    },
    '7-10': {
      courage: [
        `[CHARACTER_NAME] stood at the observation deck long after she should have returned to her bunk, watching the asteroid field churn beyond the glass. Something out there needed her. She could feel it even if she couldn't explain it. She had been told the sector was too unstable for a mission tonight. She kept staring anyway.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - found her there at 0200. "A navigation beacon at the heart of the asteroid field has failed," he said. "Ships can't find their way without it. I think you can fix it." [CHARACTER_NAME] looked at her hands. "What if it stops working out there?" Nova's expression did not waver. "Then we figure it out from there." She grabbed her suit.`,
        `The asteroid field was everything the warnings had promised: dark, fast-moving, disorienting. [CHARACTER_NAME] reached for [SPECIAL_ABILITY]. Nothing came. She shook herself and tried again. Still nothing. "Nova." Her voice stayed steady with effort. "Keep moving forward," he said. She had taken four steps back toward the station before she realized. She stopped. She turned around. She moved forward.`,
        `The beacon was nearly dark, its signal reduced to a faint pulse she could only feel. [CHARACTER_NAME] pressed both hands around it. Nothing happened for a long time. She could hear her own breathing. She kept her hands there anyway. Ten seconds. Twenty. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. Not all at once. One degree at a time. Until the beacon blazed back to full signal.`,
        `On the way back, Nova said quietly, "Whatever you were reaching for out there - it stopped working." "Yes," said [CHARACTER_NAME]. "And you stayed." "Yes." He was quiet for a moment. "Do you know how rare that is?" At the docking bay, she could see the crew through the glass. She pressed her hand against it from the outside and held it there until they all pressed back.`
      ],
      kindness: [
        `[CHARACTER_NAME] was the only person on the station who had noticed the secondary distress signal on channel 7, because she was the only person still monitoring a channel everyone else had written off. She had continued monitoring it because something about the pattern felt intentional. She was right.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - confirmed it: an automated probe had been running a degraded loop in the outer nebula for eleven months since its mission data was corrupted. It had no way to know if anyone was receiving its signal. It had kept transmitting anyway. [CHARACTER_NAME] found something about that unbearable in the way that makes you want to act.`,
        `Reaching the probe required navigating a section of the nebula the station's routes avoided. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to clear a path. Nothing came. She tried again. Still nothing. Nova said nothing. She read the environment instead and moved through it the long way, at the right speed.`,
        `The probe's orientation systems had frozen in the cold of deep space. [CHARACTER_NAME] held her hands around it and waited. She kept her hands there anyway. Ten seconds. Twenty. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. She worked the warmth in slowly. Too fast would crack it further. The probe stopped spinning. Its signal changed from distress to clear.`,
        `"The probe will never know you were here," Nova said. "No," said [CHARACTER_NAME]. "That's fine." She had been taught that kindness needed witnesses to mean something. This night had taught her otherwise.`
      ],
      connection: [
        `[CHARACTER_NAME] had been on the station for three months and still felt like she was watching everyone through glass. She could do the work. She could follow the routines. But there was a version of herself that never quite made it through the airlock into actual connection with anyone.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - said, "You move like you're passing through. Not like you belong here." [CHARACTER_NAME] said, "I don't know how to change that." Nova considered this seriously. "You could start by going toward something instead of around it." She tried it immediately: she swam toward the next corridor instead of skirting the edge.`,
        `The pulsars in the outer nebula were having a conversation she couldn't decode with instruments. But something in her kept responding to it. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to answer back. Nothing came. She tried again. Still nothing. She raised her hands anyway and held them toward the pulsars, just to be present in their direction.`,
        `She held on through the silence. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. She let it go where it went. Not in words. In whatever language it knew. The exchange lasted eight minutes. By the end, the sector was pulsing in patterns it hadn't shown for years. Nova said nothing. She was glad of that.`,
        `"You don't have to understand everything to connect with it," Nova said on the way back. [CHARACTER_NAME] thought about the crew she had been watching through glass and wondered if the same thing applied to people. She went back into the station and, for the first time, let the glass stay open.`
      ],
      patience: [
        `[CHARACTER_NAME] had been trying for an hour to get things to work with precision, and they kept missing by exactly the amount that would have been acceptable if she didn't already know they could do better. She pushed her chair back from the console and stared at the stars through the porthole. They were not in a hurry. She found that both irritating and instructive.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - had been tracking the orbit of a newly formed planetoid for eleven days. He did not find this remarkable. "Precision," he said when she asked, "is just patience given a direction." She wrote that down.`,
        `The task in the nebula required holding at exactly the right intensity for twelve minutes without fluctuation, to allow a volatile gas formation to stabilize. [CHARACTER_NAME] reached for [SPECIAL_ABILITY]. Nothing came at first. She tried again. A faint return. She held it exactly there and did not let it waver. Her mind wandered at minute three. She brought it back. Minute seven was the hardest. She held.`,
        `The dormant pulsar at the center of the swirl needed exactly the kind of attention she had been bad at her whole life: not doing, just being present long enough for something to trust her. She held her hands near it and waited. She kept them there for twenty minutes. Then, so quietly she almost missed it, [SPECIAL_ABILITY] reached it. The pulsar pulsed once. Then again. Then it woke up.`,
        `"Most of the universe moves slower than we prefer," Nova said on the way back. [CHARACTER_NAME] thought about the gas formation, the pulsar, her own instinct to push. She filed that under things she would need to relearn approximately every six months for the rest of her life.`
      ],
      bedtime: [
        `[CHARACTER_NAME] had always thought of space as a place that never slept. But three months on the station had taught her that wasn't true. The ship cycled through artificial day and night for a reason. She was not finished with the day. Her body didn't care.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - found her still at the observation deck. "Your processing speed drops fourteen percent when you're under-rested," he said. She stared at him. "I looked it up," he added. He was the least romantic person she had ever met, and she found that comforting in a way she couldn't fully explain.`,
        `They made one last slow pass through the outer ring of the asteroid field. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] once more. Nothing came. Her body had reached its limit for the day. The asteroids moved at their own pace. She moved at hers. Everything had its rhythm.`,
        `At the navigation core, she put her hands on the controls for the last time that shift, just resting them there. She kept her hands there and felt the station hum back. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. Everything operational. Everything as it should be. She let herself feel satisfied about that.`,
        `[CHARACTER_NAME] went through the routine: suit off, log filed, teeth, bunk. She watched the stars wheel through the porthole for a few minutes, not trying to map them, just watching. Sleep, she had learned, was not the end of the shift. It was what made the next one possible.`
      ]
    },
    '11-12': {
      courage: [
        `[CHARACTER_NAME] had received the mission briefing twice and set it aside both times. The structural risk was real. She stood at the observation deck and tried to locate the precise nature of her hesitation. It wasn't fear of the asteroid field. It was fear of going out there and discovering that she had nothing to offer.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - approached at 0130 without preamble. "The beacon's window is narrowing. We have roughly three hours." [CHARACTER_NAME] told him the truth: she wasn't certain she was the variable that fixed this. He said, "I understand that. I still think we should go." The "we" was the thing that made the difference. She suited up.`,
        `The asteroid field was a different thing than its briefings described: moving in three dimensions, no fixed reference point. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She noticed she was drifting back toward the station and made the decision to stop that drift before she had fully thought it through. That was the moment. Not the decision to act. The decision to stop retreating.`,
        `The beacon was barely pulsing, its signal degraded below minimum threshold. She placed her hands against its housing and held them there while the asteroids moved around her. Nova said nothing. The silence between them was not empty: it was the quality of someone staying present without asking anything of you. She held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to but needed her to stay long enough to receive it. She did not let go until it was finished.`,
        `She didn't feel triumphant on the way back. She felt like herself, but a version that now contained the knowledge of what she did when things stopped working and she was a long way from certainty. That was what courage actually deposited: not confidence, but information about yourself you couldn't get any other way. Nova said, as they docked, "You'll be able to do that again now." She believed him.`
      ],
      kindness: [
        `[CHARACTER_NAME] was the only person on the station who had noticed the secondary distress pulse repeating on channel 7, because she was the only person who had been bothering to monitor a channel that everyone else had written off three months ago. She had continued because something about the pattern felt intentional. She was right. It was.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - confirmed: an automated research probe had been running a degraded loop in the outer nebula for eleven months since its mission data was corrupted. It had no way to know if anyone was receiving its signal. It had kept transmitting anyway. [CHARACTER_NAME] found something about that unbearable in the specific way that makes you want to act.`,
        `Reaching the probe required navigating a section of the nebula that the station's routes avoided. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She read the environment instead of her instruments, watching the gas formations for patterns the instruments weren't designed to detect. This took longer than efficient. It was the right speed.`,
        `The probe's orientation systems had frozen in the cold of deep space. [CHARACTER_NAME] held her hands around it and held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way it does when it was always going to but needed her to stay long enough to receive it. She worked the warmth in slowly, the way you thaw something fragile. The probe stopped spinning. Its signal changed from distress to clear.`,
        `"The probe will never know we were here," Nova said. [CHARACTER_NAME] thought about eleven months of transmitting into silence. "Good," she said. "That means we did it because it was the right thing, not because anyone was watching." She meant it.`
      ],
      connection: [
        `[CHARACTER_NAME] had been thinking about the paradox for weeks: she was physically closer to more people on this station than she had ever been in her life, and she had never felt further from actual human contact. She stood at the observation deck and looked at the vastness of space and thought that the universe and she had something in common: enormous, full of things, and fundamentally alone.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - said, "I've noticed that you observe more than you participate." She asked if that was a problem. "It's information," he said. "I don't know if it's a problem. Do you?" She had been carrying the answer for months without admitting it. "Yes," she said. That was the first honest thing she had said to anyone on the station.`,
        `The pulsars in the outer nebula were communicating in patterns too complex for her instruments. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She raised her hands toward the pulsars anyway, choosing presence over comprehension, not knowing the language, just knowing she wanted to be in the conversation.`,
        `She held on through the silence and felt, underneath the waiting, something respond. Then [SPECIAL_ABILITY] came back, not dramatically, and she let it go where it went, not controlling it. The exchange lasted eight minutes. By the end, the sector was pulsing in patterns it hadn't shown for years. She had never felt more connected to anything. She noted that it was a pulsar, and moved on.`,
        `Coming back into the station, she stopped to ask someone in the corridor how their shift had gone. It was a small thing. They seemed surprised she had asked. She was also a little surprised. She went to bed that night thinking about what else she had been not doing, and made a short list.`
      ],
      patience: [
        `[CHARACTER_NAME] had a gift for sensing things and a corresponding difficulty with the gap between sensing and knowing. She could feel something significant in sector nine three days before the instruments confirmed anything. She could only log it, return to her station, and wait in the particular frustration of having information she couldn't yet use.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - had been watching sector nine for the same three days. She found him at the long-range scope and sat beside him without explanation. They monitored in silence for the better part of an hour. She was learning that patience was easier with company, and that Nova understood this without being told.`,
        `The formation in the outer nebula required a sustained hold at exactly the right pressure for it to stabilize. Any change would disperse it. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again. A faint return. She held it exactly there and did not let it waver. Her mind wandered at minute three. She brought it back. Minute seven was the hardest. She held.`,
        `The dormant pulsar had been waiting for the right frequency to respond to for almost two years. She held on through thirty seconds of nothing, then kept holding. She stopped expecting and just stayed present. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to but needed her to stay long enough. The pulsar woke up. Its first transmission was three years of data.`,
        `"You can't rush things into being ready," Nova said. "But you can be ready when they are." [CHARACTER_NAME] thought about the three days of logging an unconfirmed feeling, the vigil at the scope, the sustained hold in the nebula. She had not done any of those things naturally. She had chosen them. That, she thought, was the actual definition of patience: not a personality trait, but a practice.`
      ],
      bedtime: [
        `[CHARACTER_NAME] had a habit of treating the end of her shift as a negotiation she could win. She was aware of this. She had not yet changed it. Tonight she sat at the observation deck and looked at the stars and thought, not for the first time, that the universe had better boundaries than she did.`,
        `Nova - a small glowing robot with a bright antenna and warm eyes - had developed the habit of being present at the end of her shifts without saying much. "Processing speed drops with fatigue," he said. She nodded. They both knew this already. Sometimes the point of saying something true is not the information but the act of saying it together.`,
        `The final check of the outer perimeter was a ritual she had made for herself: one slow pass through the asteroid field, nothing to fix, nothing to log, just presence. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] one last time. She reached for it and found silence where it should have been. Her body had reached its limit. She moved through the outer ring anyway, just slowly, just watching. You could belong to a place and a rhythm without being useful to it.`,
        `At the navigation core, she rested her hands on the main interface and felt the station's full-system pulse against her palms. She held on through the stillness and then, very slowly, [SPECIAL_ABILITY] came back - just enough. One quiet confirmation. Everything operational. She let herself feel genuine relief at that and then let it go.`,
        `In her bunk, she went through the list she kept of things she wanted to understand about space. She had been working through it slowly, adding items faster than she completed them. She added one more, turned off her reading light, and watched the stars wheel through the porthole until the rhythm of the station's nighttime hum became the rhythm of her own breathing and she stopped watching.`
      ]
    }
  },
  'underwater-kingdom': {
    '3-6': {
      courage: [
        `[CHARACTER_NAME] looked down through the clear water from the sandy ocean floor. Below, it got dark very fast. Something down there needed her. She could feel it.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - appeared in a flash of glowing blue. "A coral castle needs light," she said. "Will you come with me?" [CHARACTER_NAME] felt her heart beat fast. The tunnel was very dark. But Coral's kind eyes made her brave enough to follow.`,
        `Inside the tunnel it was very dark. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY]. Nothing happened. She tried again. Still nothing. "Try again," said Coral. She did. The darkness pressed in close. She took one step back toward the light. Then stopped. Then turned around.`,
        `The coral castle was grey and still. [CHARACTER_NAME] pressed her hands to the biggest coral and waited. Nothing happened for a long time. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. Then the whole castle bloomed with color.`,
        `Fish and sea creatures came from everywhere. Coral spun with joy. "You were scared and you stayed!" [CHARACTER_NAME] looked at her hands. They were glowing all the colors of the reef.`
      ],
      kindness: [
        `[CHARACTER_NAME] found a small starfish stuck on its back on the sandy floor. It was waving its legs and nobody was helping. She moved toward it.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - helped her look for more animals that needed help near the tunnel entrance. "One at a time," said Coral. [CHARACTER_NAME] started with the smallest one first.`,
        `In the cave, many creatures were lost and confused in the dark. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to guide them all. Nothing came. She tried again. Still nothing. Coral said nothing. She went to the nearest creature and started there, one at a time.`,
        `At the coral castle, she found the baby fish all huddled together and cold. [CHARACTER_NAME] wrapped her hands around the biggest piece of coral and waited. She kept her hands there and waited. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The coral bloomed pink and gold.`,
        `"You helped everyone," said Coral, spinning in the water. "Even the littlest ones." [CHARACTER_NAME] smiled. Those were the ones she liked helping most.`
      ],
      connection: [
        `[CHARACTER_NAME] watched the fish swim past in big groups and wished she could join them. She was not sure they would want her. But she went to the water's edge anyway.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - appeared and swam a circle around her. "Come on," she said. "I know everyone here." [CHARACTER_NAME] laughed and followed.`,
        `In the dark cave, some creatures were hiding all by themselves. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to reach them. Nothing came. She tried again. Still nothing. She swam to each one anyway and touched their fins gently. One by one they came out.`,
        `She brought them all to the coral castle and held on at the center. Nothing happened for a long time. Then, very slowly, [SPECIAL_ABILITY] came back. First a little. Then more. The creatures swam toward the light. The castle filled up with life.`,
        `"You showed them they were not alone," said Coral. [CHARACTER_NAME] looked around at the full and busy reef and felt exactly the same way.`
      ],
      patience: [
        `[CHARACTER_NAME] tried to catch a fish to say hello. It swam away every time. She huffed and stopped. The ocean did not hurry. It just moved.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - was watching a sea snail move very, very slowly across a rock. "How long have you been watching?" asked [CHARACTER_NAME]. "Since breakfast," said Coral. [CHARACTER_NAME] sat down to watch too.`,
        `In the cave, a shell was slowly opening. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to help it open faster. It closed up tighter. She tried again. It closed further. Coral shook her head. "It opens when it's ready." [CHARACTER_NAME] put her hands in her lap and watched.`,
        `The sleeping coral at the castle did not wake up when she first touched it. She kept her hands there and waited. Nothing happened for a long time. Then, very slowly, [SPECIAL_ABILITY] came back. It grew from the inside out, slow and pink, until the whole formation was awake.`,
        `"The best things in the ocean take their time," said Coral. [CHARACTER_NAME] looked at the now-glowing reef and understood. She had not rushed it. And it was more beautiful for that.`
      ],
      bedtime: [
        `[CHARACTER_NAME] could feel the ocean getting quieter. The fish were finding their beds in the coral. The water was going dark and soft. It was time.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - swam in a slow circle. "Even dolphins sleep," she said. "We just do it with one eye open." [CHARACTER_NAME] giggled. Then she yawned, which proved the point.`,
        `In the cave, the creatures were already asleep in their spots. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] to keep going. Nothing came. Her body had reached its limit for the day. She moved quietly so as not to wake them.`,
        `She touched the coral castle goodnight. She kept her hand there and waited. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. One soft pulse, like a nightlight. She pressed her hand there a moment longer. Then she turned toward home.`,
        `Back home, [CHARACTER_NAME] changed and climbed into bed. She thought about the reef falling asleep beneath the waves. She tucked herself in too. Goodnight.`
      ]
    },
    '7-10': {
      courage: [
        `[CHARACTER_NAME] had been hovering at the edge of the sandy ocean floor for ten minutes, watching the dark drop off below her feet. Something below was wrong: she could feel it in the current, in the way the fish were moving away from a specific direction. The light barely reached the tunnel entrance. She went there anyway.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - appeared from below, her markings flickering urgently. "The coral castle has gone dark," she said. "Without its light, the reef can't function. I think you can reach the heart of it." [CHARACTER_NAME] looked at her hands. "What if it stops working in there?" Coral's eyes were steady. "I know. I also know you haven't quit yet." That was accurate. She followed Coral into the tunnel.`,
        `The cave was a different kind of dark than surface dark: heavier, with pressure behind it. [CHARACTER_NAME] reached for [SPECIAL_ABILITY]. Nothing came. She tried again and felt a faint warmth that didn't quite make it. "Coral." "Keep swimming," said the dolphin, voice calm from the dark. "Don't stop moving." That was different from "try again." It was better advice. She kept moving.`,
        `The castle's heart was a formation of coral as old as the reef itself, and it had gone completely grey. [CHARACTER_NAME] pressed both hands flat against it. Nothing. She kept her hands there anyway. Ten seconds. Twenty. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. Not all at once. One degree at a time, until the whole structure was awake in full color.`,
        `Swimming out through the restored reef, [CHARACTER_NAME] felt the current moving correctly again. Coral swam beside her. "Whatever you were reaching for in there - it stopped working." "I know," said [CHARACTER_NAME]. "And you kept your hands on it anyway." "Yes." Coral clicked softly: her version of approval. At the grand arch, the full reef was visible, lit and alive. [CHARACTER_NAME] didn't feel proud, exactly. She felt like someone who now knew something true about herself.`
      ],
      kindness: [
        `[CHARACTER_NAME] noticed the young octopus at the edge of the sandy floor before anyone else did, because she had been sitting still long enough to notice things that moved at a different speed. It was tangled in debris that had drifted down from the surface. No one else was paying attention. She moved toward it.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - helped her work through it. The creature panicked at first touch and needed to be approached again with a different angle. "It doesn't know you yet," Coral said. [CHARACTER_NAME] thought about what it would feel like to be stuck and have a stranger reach for you. She slowed down.`,
        `The cave held an ecosystem disrupted by the castle's darkness: creatures off their patterns, feeding cycles broken. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to fix it all at once. Nothing came. She tried again. Still nothing. She moved to the most urgent need first and worked methodically from there, not reacting to the loudest problem but assessing properly.`,
        `The juvenile fish needed warmth. [CHARACTER_NAME] held a section of cold coral in both hands and waited. She kept her hands there anyway. Ten seconds. Twenty. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. She let it work the warmth in slowly. Too fast would damage what she was trying to restore. She noticed herself wanting it to be faster, which was useful data. She kept her hands where they were.`,
        `"The creatures you helped won't know specifically what you did," Coral said. "They'll just know things got better." [CHARACTER_NAME] thought about the octopus, now moving freely somewhere in the reef. She thought about kindness that didn't announce itself. That seemed like the right kind.`
      ],
      connection: [
        `[CHARACTER_NAME] had been in the ocean for a month and still moved through the water the way she moved through crowds on land: present but not quite part of what was happening. She watched Coral weave through a group of sea creatures who parted and closed around the dolphin like water, and felt the specific ache of someone who doesn't know how to do that.`,
        `Coral said, "You move like you're passing through. Not like you belong here." [CHARACTER_NAME] said, "I don't know how to change that." Coral considered this seriously. "You could start by going toward something instead of around it." It was the most useful piece of advice she had received in months. She tried it immediately.`,
        `The creatures in the cave were organized in a way that made sense once she stopped observing from a distance and swam into the middle of it. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] to light the way. Nothing came. She tried again. Still nothing. She swam into the center anyway and began moving with the current instead of across it.`,
        `She pressed her hands to the coral castle and kept them there. Nothing happened for a long time. Then, so quietly she almost missed it, [SPECIAL_ABILITY] began to return. It traveled through the formation in pulses she hadn't felt before because she had never put her hands on it long enough. The reef communicated back. She had never felt it before because she had never stayed still enough to receive it.`,
        `"You were inside things tonight," Coral said. "Not outside." [CHARACTER_NAME] thought about that as they swam through the grand arch, the reef moving around them and with them at the same time. She had not solved anything about herself. But she had located the direction she needed to move in, and that felt like enough for one night.`
      ],
      patience: [
        `[CHARACTER_NAME] had been trying to get things to work with precision for thirty minutes. They kept shifting. She understood technically why. She had accounted for all the variables and it was still not right. She sat at the bottom of the sandy floor, looked at her hands, and decided the ocean was deliberately testing her.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - was watching a sea turtle lay eggs on a sandbar nearby and had been for two hours. "Is it almost finished?" [CHARACTER_NAME] asked. "Probably another forty minutes," Coral said. "Do you want to watch?" [CHARACTER_NAME] sat down. After about ten minutes, she realized she was not bored.`,
        `The cave held a section of reef in delicate regrowth: new coral polyps extending their first structures. Moving fast through the area would damage them. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and it came, but faintly. She held it at the exact level the polyps needed and slowed her swimming to a fraction of her normal speed, reading the resistance instead of pushing through it.`,
        `[CHARACTER_NAME] rested her hands on the ancient coral and stopped expecting anything. This was different from waiting: waiting had a direction to it, a lean toward the future. She tried to stop leaning and just be there. She kept her hands there for a long time. Then, so quietly she almost missed it, [SPECIAL_ABILITY] fully returned. She wasn't sure who had moved toward whom.`,
        `"Patience in the ocean isn't slow motion," Coral said on the swim back. "It's full attention at whatever speed the thing in front of you needs." [CHARACTER_NAME] thought about the turtle, the polyps, the ancient coral. She had been at full attention for all of them. That, she thought, was the most efficient she had been all month.`
      ],
      bedtime: [
        `[CHARACTER_NAME] knew the signs by now: the water temperature dropping a degree, the fish schooling tighter, the ocean moving into its evening register. It was nearly time. She sat with that instead of fighting it.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - went to her nighttime pattern: slower pulses, deeper blue. "Everything that burns bright needs a dark period," she said. [CHARACTER_NAME] had never thought about rest as conservation. That framing was less annoying than "you're tired and should sleep."`,
        `The cave at this hour held day creatures and night creatures passing each other in perfect choreography. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] one last time. Nothing came. Her body had reached its limit. She moved through the shift change without analyzing it, just letting it be what it was.`,
        `At the coral castle she rested her hands on the formation and felt its nighttime rhythm: slower, deeper, fully alive but at a different register. She kept her hands there and matched her breathing to it. Then, very slowly, [SPECIAL_ABILITY] came back - just enough. The castle pulsed once under her palms, like a goodnight.`,
        `[CHARACTER_NAME] swam back through the grand arch, through the evening reef, to her sleeping place. She went through her routine: rinsing off, changing, lying down. The current rocked her slightly. Sleep came before she expected it.`
      ]
    },
    '11-12': {
      courage: [
        `[CHARACTER_NAME] had been mapping the ocean floor long enough to know the difference between normal underwater silence and the kind that meant something was wrong. Tonight it was the second kind: the fish had changed their routes, the current had shifted direction slightly, and the water pressure at the deep edge felt like a held breath. She went to the tunnel entrance anyway.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - was waiting at the tunnel mouth in her alert pattern. "The coral castle's central formation has gone dark," she said. "If it doesn't come back before the morning tide, the thermal balance of this section of reef fails." [CHARACTER_NAME] gave her the honest assessment: she wasn't confident she could sustain what was needed at that depth. Coral said, "I'll tell you if it matters. Right now we just need to move." That was enough.`,
        `The cave at depth was genuinely disorienting: no light reference, pressure changes, Coral's bioluminescence the only fixed point. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She noticed the part of her that wanted to announce this failure and ask permission to turn back, and recognized it as the part that had turned back before. She kept the information to herself and kept swimming. The not-announcing was the hardest part.`,
        `The central formation was older than anything she had touched before. She placed her hands on it and felt the absence in it: not emptiness, but the quality of something that had been full and was no longer. Coral stayed visible at the edge of her sight without touching her or speaking: the specific kindness of presence without demand. She held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way something does when it was always going to but needed her to stay long enough. The formation's colour returned the same way.`,
        `Swimming back through the restored reef, [CHARACTER_NAME] thought about the thing she had not said in the cave: that she had wanted permission to stop. She was glad she hadn't said it. Not because silence was the right policy, but because in that specific moment the most honest thing she could do was stay. Coral said, at the grand arch: "You know what you did in there." "Yes," said [CHARACTER_NAME]. That was all. The arch framed the full reef behind them, awake and lit and asking nothing of her.`
      ],
      kindness: [
        `[CHARACTER_NAME] had made a habit of moving slowly across the sandy floor on the way to every mission, not for efficiency reasons but because slow movement showed her things that faster transit missed. Tonight it showed her a juvenile seahorse wedged between two rocks in a way that would have become dangerous within the hour. She stopped.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - confirmed the current patterns around the rock. [CHARACTER_NAME] worked the angle for a few minutes before touching: she needed to understand the geometry before applying any force, because the wrong point would make it worse. She had learned that from a mistake the month before. She moved in from the correct angle on the first attempt.`,
        `The cave disruption had affected more than the visible creatures: the chemical balance of the water was off, which was affecting the organisms the visible creatures depended on. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She addressed the root cause first, then the organisms, then the visible creatures. The most important kindness in a system is often invisible.`,
        `The coral castle's central formation needed a specific kind of warmth. She held on through thirty seconds of nothing. Then [SPECIAL_ABILITY] came back, not dramatically, arriving the way it does when it was always going to. She held it for eighteen minutes at the right frequency and watched the formation respond in exactly the way she had hoped, which was satisfying in the way that competent help is satisfying: not as performance, but as adequacy.`,
        `"You know things about this reef now," Coral said at the grand arch. "Things that make your kindness more effective." [CHARACTER_NAME] thought about that. Kindness without knowledge could cause harm even with good intentions. Knowledge without kindness was just information. She was trying to have both. She wasn't always succeeding. But she was trying on purpose, which probably mattered.`
      ],
      connection: [
        `[CHARACTER_NAME] had been trying to figure out for weeks why her interactions with the reef's creatures felt different from Coral's. Same location, similar frequency of contact, comparable competence. But Coral moved through the reef like someone who belonged to it, and [CHARACTER_NAME] moved through it like someone very good at her job. She had started to understand these were not the same thing.`,
        `"You're very technically correct with the creatures," Coral said, which [CHARACTER_NAME] could tell was a carefully constructed sentence. "What does that mean?" "It means you respond to what they need. You don't respond to what they are." She stayed with that for the entire swim to the tunnel.`,
        `In the cave, she tried something she hadn't done before: she stopped navigating and let the current move her. She stopped assessing and let the ecosystem be what it was in this moment without requiring herself to have an action for it. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and found silence where it should have been. She tried again with the same result. She moved through the cave anyway, without agenda, just present.`,
        `At the coral castle she pressed her hands to the formation without intention about what should happen. She held on through the silence and found, underneath it, [SPECIAL_ABILITY] arriving the way it does when it was always going to: going to a section that had been dim for so long it had stopped asking to be noticed. The formation responded like something that had been waiting to be seen.`,
        `At the grand arch, the reef moved around her with a slightly different quality than she had experienced before. Coral noticed. "You were different tonight," she said. [CHARACTER_NAME] said, "I was less certain." "Yes," said Coral. "That's usually how it starts." She let the current carry her home and for the first time stopped using it as a reference point.`
      ],
      patience: [
        `[CHARACTER_NAME] had spent the afternoon trying to understand why her approach worked on some coral formations and not others. She had a working hypothesis and insufficient data. She had been moving too fast through the collection. She sat on the sandy floor and decided she was going to let herself be wrong about the hypothesis and start again from observation.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - had been monitoring a thermal vent continuously for two months, rotation team and everything. "Two months is a long time," [CHARACTER_NAME] said. "Something significant will happen there," Coral said. "I don't know when. But when it does, I'll be there." [CHARACTER_NAME] asked to join the next watch rotation. Coral accepted without making it a larger thing than it was.`,
        `The cave held a bioluminescent organism that only displayed its full pattern under very specific conditions she had spent three weeks identifying. She had all three conditions tonight. [CHARACTER_NAME] reached for [SPECIAL_ABILITY] and it came, but faintly. She held it at exactly the level the organism needed and positioned herself and waited with full attention, no eye on the time.`,
        `The ancient coral formation had been her study subject for four weeks. She knew its patterns well enough to know that what was happening tonight was new: a very slow response in a section that had been dormant for her entire observation. She held on through the silence and felt, underneath it, [SPECIAL_ABILITY] arriving the way it does when it was always going to but needed her to stay long enough. She let it happen on its own schedule. This was what four weeks of patience had purchased: being there when something new occurred.`,
        `"You saw something tonight that no one has recorded before," Coral said at the grand arch. "Because you've been here long enough." [CHARACTER_NAME] thought about the hypothesis she had set aside that afternoon, and the organism, and the new section of the formation. She had come to the reef wanting to understand it. She was beginning to understand that the reef revealed itself at its own pace and her job was to be there when it did. That was different from understanding. It was better.`
      ],
      bedtime: [
        `[CHARACTER_NAME] had started treating the end of her dive as its own part of the work rather than the end of it. The transition from deep water to shallow, from active engagement to the slow ascent, had its own quality she had begun to pay attention to. Her glow dimmed on the ascent the way it always did. She had stopped finding that irritating.`,
        `Coral - a playful dolphin with bioluminescent markings, graceful and swift - made the ascent with her. "The reef consolidates at night," Coral said. "Everything it learned in the day gets integrated in the dark." [CHARACTER_NAME] thought about her own mind doing the same thing and felt the alignment between them in a way she hadn't when she first arrived.`,
        `She moved through the cave one last time without agenda, because she had learned that presence at the end of the day, without task, showed her things the task-oriented dives missed. [CHARACTER_NAME] tried to use [SPECIAL_ABILITY] one last time. She reached for it and found silence where it should have been. Her body had reached its limit. She moved through anyway, just slowly, just there.`,
        `At the coral castle she held one hand to the formation, not asking it for anything, not assessing. Just acknowledging she had been here with it today. She held on and felt, underneath the stillness, [SPECIAL_ABILITY] returning the way it does at the end: quiet and certain. The formation held her hand's warmth a moment longer than usual before releasing it. She noted that without interpreting it.`,
        `The ascent moved her from the reef's darkness to the soft light of shallow water and then to her sleeping place. She went through her closing routine without rushing any of it. She lay down and felt the day settle in her body the way sediment settles in still water: slowly, to the bottom, into order. The reef was out there in its nighttime version. She was in hers.`
      ]
    }
  }
};

function normalizeStoryWorldKey(storyWorld?: string): StoryWorldKey {
  const normalized = (storyWorld || '').toLowerCase().trim();
  if (normalized.includes('underwater') || normalized.includes('ocean') || normalized.includes('sea')) {
    return 'underwater-kingdom';
  }
  if (normalized.includes('space') || normalized.includes('outer')) {
    return 'outer-space';
  }
  return 'enchanted-forest';
}

function normalizeAgeGroupKey(ageGroup?: string): AgeGroupKey {
  const normalized = (ageGroup || '').trim();
  if (normalized === '3-5' || normalized === '3-6') return '3-6';
  if (normalized === '11-12') return '11-12';
  return '7-10';
}

function normalizeLearningThemeKey(learningTheme?: string): LearningThemeKey {
  const normalized = (learningTheme || '').toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('bedtime') || normalized.includes('sleep')) return 'bedtime';
  if (normalized.includes('patience') || normalized.includes('endurance')) return 'patience';
  if (normalized.includes('connection')) return 'connection';
  if (normalized.includes('courage')) return 'courage';
  if (normalized.includes('kindness') || normalized.includes('empathy')) return 'kindness';
  return 'kindness';
}

function normalizeCharacterGender(gender?: string): CharacterGender {
  const normalized = (gender || '').toLowerCase().trim();
  if (normalized === 'male') return 'male';
  if (normalized === 'non_binary' || normalized === 'non-binary' || normalized === 'nonbinary') return 'non_binary';
  return 'female';
}

function adaptPronounsInCharacterSentence(text: string, gender: CharacterGender): string {
  if (gender === 'female') return text;

  if (gender === 'male') {
    return text
      .replace(/\bherself\b/g, 'himself')
      .replace(/\bHerself\b/g, 'Himself')
      .replace(/\bhers\b/g, 'his')
      .replace(/\bHers\b/g, 'His')
      .replace(/\b(made|found|told|asked|helped|noticed|watched|called|followed|beside|around|behind|before) her\b/gi, (match, prefix) => `${prefix} ${/^[A-Z]/.test(match) ? 'Him' : 'him'}`)
      .replace(/\b(at|to|with|from|for|near|toward|towards|against) her\b(?!\s+[a-z])/gi, (match, prefix) => `${prefix} ${/^[A-Z]/.test(match) ? 'Him' : 'him'}`)
      .replace(/\bher\b/g, 'his')
      .replace(/\bHer\b/g, 'His')
      .replace(/\bshe\b/g, 'he')
      .replace(/\bShe\b/g, 'He');
  }

  return text
    .replace(/\bherself\b/g, 'themself')
    .replace(/\bHerself\b/g, 'Themself')
    .replace(/\bhers\b/g, 'theirs')
    .replace(/\bHers\b/g, 'Theirs')
    .replace(/\bshe was\b/g, 'they were')
    .replace(/\bShe was\b/g, 'They were')
    .replace(/\bshe wasn't\b/g, "they weren't")
    .replace(/\bShe wasn't\b/g, "They weren't")
    .replace(/\bshe is\b/g, 'they are')
    .replace(/\bShe is\b/g, 'They are')
    .replace(/\bshe's\b/g, "they're")
    .replace(/\bShe's\b/g, "They're")
    .replace(/\bshe has\b/g, 'they have')
    .replace(/\bShe has\b/g, 'They have')
    .replace(/\bshe doesn't\b/g, "they don't")
    .replace(/\bShe doesn't\b/g, "They don't")
    .replace(/\b(made|found|told|asked|helped|noticed|watched|called|followed|beside|around|behind|before) her\b/gi, (match, prefix) => `${prefix} ${/^[A-Z]/.test(match) ? 'Them' : 'them'}`)
    .replace(/\b(at|to|with|from|for|near|toward|towards|against) her\b(?!\s+[a-z])/gi, (match, prefix) => `${prefix} ${/^[A-Z]/.test(match) ? 'Them' : 'them'}`)
    .replace(/\bher\b/g, 'their')
    .replace(/\bHer\b/g, 'Their')
    .replace(/\bshe\b/g, 'they')
    .replace(/\bShe\b/g, 'They');
}

function adaptCharacterPronouns(text: string, gender: CharacterGender, storyWorld: StoryWorldKey): string {
  if (gender === 'female') return text;

  const companionName = storyWorld === 'outer-space'
    ? 'Nova'
    : storyWorld === 'underwater-kingdom'
      ? 'Coral'
      : 'Fern';
  let activeSubject: 'character' | 'companion' | null = null;

  return text.replace(/[^.!?]+[.!?"]*\s*|[^.!?]+$/g, (sentence) => {
    const trimmed = sentence.trimStart();
    const hasCharacter = sentence.includes('[CHARACTER_NAME]');
    const hasCompanion = sentence.includes(companionName);
    const startsWithCharacterPronoun = /^(She|she|Her|her)\b/.test(trimmed);
    const startsWithCompanion = trimmed.startsWith(companionName);
    const referencesCharacterAsObject = /\bmade her brave\b/i.test(sentence);
    const shouldTreatPronounAsCharacter =
      startsWithCharacterPronoun &&
      (activeSubject === 'character' || storyWorld !== 'underwater-kingdom' || hasCompanion);

    if (hasCharacter || referencesCharacterAsObject || shouldTreatPronounAsCharacter) {
      activeSubject = 'character';
    } else if (startsWithCompanion || hasCompanion) {
      activeSubject = 'companion';
    }

    return activeSubject === 'character'
      ? adaptPronounsInCharacterSentence(sentence, gender)
      : sentence;
  });
}

function replaceTemplateVariables(text: string, input: AdventureStoryTemplateInput): string {
  const characterName = input.characterName?.trim() || 'Character';
  const specialAbility = input.specialAbility?.trim() || 'their special ability';

  return text
    .split('[CHARACTER_NAME]').join(characterName)
    .split('[SPECIAL_ABILITY]').join(specialAbility);
}

export function getAdventureStoryTemplatePages(input: AdventureStoryTemplateInput): string[] {
  const storyWorld = normalizeStoryWorldKey(input.storyWorld);
  const ageGroup = normalizeAgeGroupKey(input.ageGroup);
  const learningTheme = normalizeLearningThemeKey(input.learningTheme);
  const characterGender = normalizeCharacterGender(input.characterGender);

  return adventureStoryTemplates[storyWorld][ageGroup][learningTheme].map((page) =>
    replaceTemplateVariables(adaptCharacterPronouns(page, characterGender, storyWorld), input)
  );
}
