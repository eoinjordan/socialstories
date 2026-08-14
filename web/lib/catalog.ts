import type { DisplaySettings, SentenceType, StoryKind, StoryPurpose } from "./types";

/**
 * The starter catalogue.
 *
 * LICENSING — read before adding to this file.
 *
 * All wording below is original, written for this project and released under
 * CC0-1.0 (see catalog/LICENSE). We deliberately did NOT copy text from the
 * "free social story" libraries that inspired this project, nor from Carol
 * Gray's published example stories: those are free to read and all-rights-
 * reserved, so redistributing them inside an app would be infringement. Only
 * add templates here that are (a) written from scratch, (b) public domain /
 * CC0, or (c) published under an open licence permitting redistribution, with
 * the provenance recorded. See catalog/README.md and catalog/SOURCES.md.
 *
 * Pictures are not baked in. Each step carries a `picture` keyword resolved
 * against the ARASAAC symbol library when a carer creates a story from the
 * template, so this file stays text-only and the symbols keep their own
 * CC BY-NC-SA licence rather than being re-hosted by us.
 *
 * STYLE — every template here is checked by lib/quality.ts in CI:
 *  - Story Rating (describing ÷ coaching, title counts as describing) >= 4;
 *  - at most one sentence that coaches the reader;
 *  - no second person, no judging words, no unchecked absolutes;
 *  - at least half the catalogue celebrates rather than instructs.
 *
 * Note that "Social Story" is Carol Gray's term for a document meeting all ten
 * of her criteria. These are picture stories written in that tradition, and
 * several criteria — gathering information about the individual, tailoring the
 * format to them, planning how the story is introduced — can only be met by the
 * person adapting the template. They are starting points, not finished Stories.
 */

export interface TemplateStep {
  text: string;
  /** Search term used to look up an ARASAAC symbol at creation time. */
  picture: string;
  spoken?: string;
  /** Omitted means descriptive, which is the overwhelming majority. */
  sentenceType?: SentenceType;
}

export interface StoryTemplate {
  id: string;
  title: string;
  kind: StoryKind;
  purpose: StoryPurpose;
  category: Category;
  /** Shown on the template card to help a carer choose. */
  summary: string;
  cover: string;
  steps: TemplateStep[];
  display?: Partial<DisplaySettings>;
  /** Where the wording came from. "original" means written for this project. */
  source: "original";
  license: "CC0-1.0";
}

export type Category =
  | "Celebrating"
  | "Daily routines"
  | "Health and care"
  | "School and day service"
  | "Out and about"
  | "Feelings"
  | "Staying safe";

export const CATEGORIES: Category[] = [
  "Celebrating",
  "Daily routines",
  "Health and care",
  "School and day service",
  "Out and about",
  "Feelings",
  "Staying safe",
];

const coach: SentenceType = "coachesAudience";
const team: SentenceType = "coachesTeam";

export const TEMPLATES: StoryTemplate[] = [
  // =====================================================================
  // CELEBRATING — the 7th criterion asks that at least half of the stories
  // written for someone applaud what they already do well. A library that is
  // all instructions tells its reader they are a problem to be managed.
  // =====================================================================
  {
    id: "good-at-waiting",
    title: "I am getting good at waiting",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Names waiting as a skill the reader has built, with evidence.",
    cover: "well done",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Waiting is hard. It is a skill people learn.", picture: "wait" },
      { text: "I used to find waiting very hard.", picture: "sad" },
      { text: "Now I can wait for my turn.", picture: "take turns" },
      { text: "I wait at the shop. I wait for my dinner.", picture: "shop" },
      { text: "Waiting still feels long sometimes. I do it anyway.", picture: "clock" },
      { text: "I am proud of how well I wait.", picture: "proud" },
    ],
  },
  {
    id: "i-use-my-words",
    title: "I tell people what I need",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For anyone building communication, whatever form it takes.",
    cover: "talk",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People let each other know what they need.", picture: "talk" },
      { text: "Some people say it. Some point. Some use a card or a screen.", picture: "communication" },
      { text: "All of those ways work.", picture: "ok" },
      { text: "I let people know what I need.", picture: "me" },
      { text: "When I do, the people around me understand me better.", picture: "family" },
      { text: "That is a real skill, and I have it.", picture: "well done" },
    ],
  },
  {
    id: "kind-friend",
    title: "I am a kind friend",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Collects specific kind things the reader does. Edit with real examples.",
    cover: "friends",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Kindness is noticing what someone else needs.", picture: "help" },
      { text: "I notice when my friend is sad.", picture: "sad" },
      { text: "I share the things I have.", picture: "share" },
      { text: "I let other people have a turn.", picture: "take turns" },
      { text: "My friends like being with me.", picture: "friends" },
      { text: "Being kind is one of the best things about me.", picture: "heart" },
    ],
  },
  {
    id: "tried-something-new",
    title: "I tried something new",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For after a first time — a new food, place, class or person.",
    cover: "new",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "New things can feel uncomfortable at first.", picture: "worried" },
      { text: "Trying a new thing takes courage.", picture: "strong" },
      { text: "I tried something new.", picture: "new" },
      { text: "It felt strange at the start.", picture: "confused" },
      { text: "I stayed, and I found out what it was like.", picture: "look" },
      { text: "Trying takes courage, and I had it.", picture: "well done" },
    ],
  },
  {
    id: "getting-through-hard-day",
    title: "I got through a hard day",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Applauds surviving a bad day without pretending it was fine.",
    cover: "calm",
    display: { highContrast: true },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Some days are harder than others.", picture: "sad" },
      { text: "Today was a hard day.", picture: "difficult" },
      { text: "Hard days end. This one ended too.", picture: "night" },
      { text: "I kept going all the way through it.", picture: "walk" },
      { text: "The people around me are glad I did.", picture: "family" },
      { text: "Getting through a hard day is something to be proud of.", picture: "proud" },
    ],
  },
  {
    id: "i-asked-for-help",
    title: "I asked for help",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Pairs with the “Asking for help” story once the skill is there.",
    cover: "help",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People get stuck sometimes, at any age.", picture: "difficult" },
      { text: "Asking for help is a skill.", picture: "help" },
      { text: "I got stuck, and I asked.", picture: "raise hand" },
      { text: "Someone came and helped me.", picture: "teacher" },
      { text: "Then I carried on with what I was doing.", picture: "work" },
      { text: "Asking was the clever thing to do.", picture: "well done" },
    ],
  },
  {
    id: "i-did-it-myself",
    title: "I did it by myself",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For a newly independent task. Swap in the real one.",
    cover: "me",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People learn to do things for themselves, a bit at a time.", picture: "learn" },
      { text: "Someone used to help me with this.", picture: "adult" },
      { text: "Now I can do it by myself.", picture: "me" },
      { text: "I know each part of it, and what order it goes in.", picture: "list" },
      { text: "That took practice.", picture: "repeat" },
      { text: "I did it by myself, and that is worth celebrating.", picture: "party" },
    ],
  },
  {
    id: "i-know-a-lot",
    title: "I know a lot about the things I love",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Treats a deep interest as an asset. Name the real interest.",
    cover: "book",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People have subjects they love and know well.", picture: "book" },
      { text: "I have a subject like that.", picture: "me" },
      { text: "I know a great deal about it.", picture: "brain" },
      { text: "I notice details in it that other people miss.", picture: "look" },
      { text: "People can learn things from me.", picture: "talk" },
      { text: "Knowing something deeply is a strength.", picture: "star" },
    ],
  },
  {
    id: "i-made-someone-smile",
    title: "I made someone smile",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Very short. Good as a daily radiator on a wall tablet.",
    cover: "happy",
    display: { autoAdvanceSeconds: 12 },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People feel good when someone is glad to see them.", picture: "happy" },
      { text: "Today I made someone smile.", picture: "smile" },
      { text: "They felt better because of me.", picture: "heart" },
      { text: "I can do that.", picture: "me" },
    ],
  },
  {
    id: "i-looked-after",
    title: "I looked after something",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "A pet, a plant, a younger sibling, a job at home.",
    cover: "care",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Living things need someone to look after them.", picture: "care" },
      { text: "Looking after something means remembering it every day.", picture: "calendar" },
      { text: "I remembered.", picture: "me" },
      { text: "It is doing well because of what I did.", picture: "plant" },
      { text: "People can rely on me for this.", picture: "family" },
      { text: "That is something to be proud of.", picture: "proud" },
    ],
  },
  {
    id: "i-shared",
    title: "I shared my things",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Sharing named as generous rather than as a rule obeyed.",
    cover: "share",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sharing means letting someone else use what is mine.", picture: "share" },
      { text: "Sharing is hard when the thing matters to me.", picture: "difficult" },
      { text: "Today I shared.", picture: "me" },
      { text: "The other person was pleased.", picture: "happy" },
      { text: "I still had my thing back afterwards.", picture: "toy" },
      { text: "Sharing was generous, and that was my choice.", picture: "well done" },
    ],
  },
  {
    id: "i-finished-my-work",
    title: "I finished my work",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For school or a day service. Focuses on finishing, not on marks.",
    cover: "work",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Work has a beginning, a middle and an end.", picture: "work" },
      { text: "The middle part is often the hardest.", picture: "difficult" },
      { text: "I kept going through the middle part.", picture: "walk" },
      { text: "Then I reached the end.", picture: "finish" },
      { text: "My work is finished.", picture: "well done" },
      { text: "Finishing is worth as much as starting.", picture: "star" },
    ],
  },

  {
    id: "i-am-good-at-my-job",
    title: "I am good at my job",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For work or a day service placement. Name the real tasks.",
    cover: "work",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "People do jobs that other people rely on.", picture: "work" },
      { text: "I have a job.", picture: "me" },
      { text: "I know what my job needs, and I do it.", picture: "list" },
      { text: "The people I work with count on me.", picture: "team" },
      { text: "The place runs better because I am there.", picture: "building" },
      { text: "I am good at my job.", picture: "well done" },
    ],
  },
  {
    id: "i-helped-at-home",
    title: "I helped at home",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Household jobs as a contribution, not a chore list.",
    cover: "house",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "A home takes work to run.", picture: "house" },
      { text: "The people who live there each do a part of it.", picture: "family" },
      { text: "Today I did my part.", picture: "me" },
      { text: "That was less for someone else to do.", picture: "clean" },
      { text: "My family noticed.", picture: "happy" },
      { text: "Helping at home matters.", picture: "heart" },
    ],
  },
  {
    id: "i-stayed-calm-when-plans-changed",
    title: "The plan changed and I was alright",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For after an unexpected change went better than feared.",
    cover: "calendar",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Plans sometimes change without warning.", picture: "calendar" },
      { text: "A changed plan can feel uncomfortable.", picture: "worried" },
      { text: "Today a plan changed.", picture: "change" },
      { text: "I noticed the uncomfortable feeling.", picture: "body" },
      { text: "The day carried on, and so did I.", picture: "walk" },
      { text: "That was a hard thing done well.", picture: "proud" },
    ],
  },
  {
    id: "i-tried-a-new-food",
    title: "I tried a new food",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Celebrates the trying, whether or not the reader liked it.",
    cover: "eat",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Food comes in many textures, smells and colours.", picture: "food" },
      { text: "A new food is a lot of new information at once.", picture: "eat" },
      { text: "Today I tried one.", picture: "me" },
      { text: "I might have liked it, or I might not have.", picture: "ok" },
      { text: "Either answer is a real answer.", picture: "ok" },
      { text: "Trying it was the brave part, and I did that.", picture: "well done" },
    ],
  },
  {
    id: "i-made-a-choice",
    title: "I made a choice",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Names decision-making as agency worth celebrating.",
    cover: "choose",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Choosing means picking one thing instead of another.", picture: "choose" },
      { text: "Choosing can be hard when more than one looks good.", picture: "difficult" },
      { text: "Today I made my own choice.", picture: "me" },
      { text: "People listened to what I chose.", picture: "listen" },
      { text: "It was my decision, and it counted.", picture: "ok" },
      { text: "Making choices is part of running my own life.", picture: "star" },
    ],
  },
  {
    id: "i-remembered",
    title: "I remembered by myself",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "For the first time something was remembered without a prompt.",
    cover: "brain",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Remembering a thing at the right moment takes practice.", picture: "brain" },
      { text: "Someone used to remind me about this.", picture: "adult" },
      { text: "Today I did it without a reminder.", picture: "me" },
      { text: "I remembered on my own.", picture: "idea" },
      { text: "That is my memory getting stronger.", picture: "strong" },
      { text: "I am pleased about that, and so are the people around me.", picture: "family" },
    ],
  },
  {
    id: "i-belong-here",
    title: "I am part of my family",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "A belonging story. Works well with real photos of everyone.",
    cover: "family",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "A family is a group of people who belong together.", picture: "family" },
      { text: "I am one of the people in mine.", picture: "me" },
      { text: "My family knows what I like and what I find hard.", picture: "heart" },
      { text: "They are glad I am here on easy days and on hard days.", picture: "happy" },
      { text: "My place in my family stays mine.", picture: "house" },
      { text: "I belong here.", picture: "hug" },
    ],
  },
  {
    id: "i-made-someone-laugh",
    title: "I made someone laugh",
    kind: "story",
    purpose: "celebrate",
    category: "Celebrating",
    summary: "Short, light, and easy to re-read. Good on a wall tablet.",
    cover: "laugh",
    display: { autoAdvanceSeconds: 12 },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Laughing feels good.", picture: "laugh" },
      { text: "Today I said something funny.", picture: "talk" },
      { text: "Someone laughed.", picture: "happy" },
      { text: "I did that.", picture: "me" },
    ],
  },

  // =====================================================================
  // DAILY ROUTINES
  // =====================================================================
  {
    id: "brush-teeth",
    title: "Brushing my teeth",
    kind: "pathway",
    purpose: "explain",
    category: "Daily routines",
    summary: "Six steps from picking up the brush to putting it away.",
    cover: "toothbrush",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I brush my teeth in the morning and at night.", picture: "toothbrush" },
      { text: "I pick up my toothbrush.", picture: "toothbrush" },
      { text: "I put a small blob of toothpaste on it.", picture: "toothpaste" },
      { text: "I brush the top teeth and the bottom teeth.", picture: "brush teeth" },
      { text: "I spit into the sink.", picture: "sink" },
      { text: "I put my toothbrush back. My teeth feel clean.", picture: "clean" },
    ],
  },
  {
    id: "getting-dressed",
    title: "Getting dressed",
    kind: "pathway",
    purpose: "explain",
    category: "Daily routines",
    summary: "Clothes in order, one item per screen.",
    cover: "get dressed",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "In the morning I put on my clothes.", picture: "get dressed" },
      { text: "First my underwear.", picture: "underwear" },
      { text: "Then my top.", picture: "t-shirt" },
      { text: "Then my trousers.", picture: "trousers" },
      { text: "Then my socks.", picture: "socks" },
      { text: "Last, my shoes. Now I am dressed.", picture: "shoes" },
    ],
  },
  {
    id: "washing-hands",
    title: "Washing my hands",
    kind: "pathway",
    purpose: "explain",
    category: "Daily routines",
    summary: "A short hand-washing sequence with a counting step.",
    cover: "wash hands",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I wash my hands before I eat.", picture: "wash hands" },
      { text: "I turn on the tap.", picture: "tap" },
      { text: "I put soap on my hands.", picture: "soap" },
      {
        text: "I rub my hands together while I count to twenty.",
        picture: "wash hands",
        spoken: "Rub your hands together while we count to twenty.",
      },
      { text: "I rinse the soap off.", picture: "water" },
      { text: "I dry my hands on the towel.", picture: "towel" },
    ],
  },
  {
    id: "bedtime",
    title: "Going to bed",
    kind: "pathway",
    purpose: "explain",
    category: "Daily routines",
    summary: "A calm wind-down sequence for the end of the day.",
    cover: "bed",
    display: { highContrast: true },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "When it is dark outside, it is nearly bedtime.", picture: "night" },
      { text: "I put on my pyjamas.", picture: "pyjamas" },
      { text: "I brush my teeth.", picture: "brush teeth" },
      { text: "I go to the toilet.", picture: "toilet" },
      { text: "I climb into bed.", picture: "bed" },
      { text: "The light goes off. I can rest now.", picture: "sleep" },
    ],
  },

  // =====================================================================
  // HEALTH AND CARE
  // =====================================================================
  {
    id: "doctor-visit",
    title: "Going to the doctor",
    kind: "pathway",
    purpose: "explain",
    category: "Health and care",
    summary: "What happens from the waiting room to going home.",
    cover: "doctor",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Today I am going to see the doctor.", picture: "doctor" },
      { text: "We wait in the waiting room. Sometimes waiting takes a while.", picture: "waiting room" },
      { text: "Someone calls my name. We walk to the doctor's room.", picture: "walk" },
      { text: "The doctor asks how I am feeling.", picture: "talk" },
      { text: "The doctor may listen to my chest. It feels a bit cold.", picture: "stethoscope" },
      { text: "When we are finished, we go home.", picture: "home" },
    ],
  },
  {
    id: "dentist-visit",
    title: "Going to the dentist",
    kind: "story",
    purpose: "explain",
    category: "Health and care",
    summary: "Prepares for the chair, the light and the mirror.",
    cover: "dentist",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "The dentist checks that my teeth are healthy.", picture: "dentist" },
      { text: "I sit in a big chair. The chair leans back.", picture: "chair" },
      { text: "A bright light shines above me.", picture: "light" },
      { text: "The dentist looks at my teeth with a little mirror.", picture: "dentist" },
      { text: "It might feel strange. Most of the time it does not hurt.", picture: "calm" },
      { text: "When it is finished I can sit up.", picture: "well done" },
    ],
  },
  {
    id: "blood-test",
    title: "Having a blood test",
    kind: "pathway",
    purpose: "explain",
    category: "Health and care",
    summary: "Honest about the sharp feeling, and short.",
    cover: "blood test",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "A nurse needs to take a little bit of my blood.", picture: "nurse" },
      { text: "I sit down and roll up my sleeve.", picture: "sit" },
      { text: "The nurse wipes my arm. It feels cold.", picture: "arm" },
      { text: "There is a quick sharp feeling.", picture: "injection" },
      { text: "I can look away while it happens.", picture: "look", sentenceType: coach },
      { text: "It is over quickly, and then there is a plaster.", picture: "plaster" },
      { text: "After that I am finished.", picture: "well done" },
    ],
  },
  {
    id: "hospital-day",
    title: "A day at the hospital",
    kind: "pathway",
    purpose: "explain",
    category: "Health and care",
    summary: "For a planned day appointment. Edit the middle steps to match.",
    cover: "hospital",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Today I am going to the hospital.", picture: "hospital" },
      { text: "The hospital is big and busy. There are lots of people.", picture: "people" },
      { text: "We check in at the desk.", picture: "reception" },
      { text: "We wait until someone calls my name.", picture: "wait" },
      { text: "A doctor or nurse explains what happens next.", picture: "nurse", sentenceType: team },
      { text: "When everything is done, we go home.", picture: "home" },
    ],
  },
  {
    id: "taking-medicine",
    title: "Taking my medicine",
    kind: "pathway",
    purpose: "explain",
    category: "Health and care",
    summary: "A daily medication routine. Supervision is not optional here.",
    cover: "medicine",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I take my medicine at the same time every day.", picture: "medicine" },
      { text: "A grown-up brings the right medicine for me.", picture: "adult", sentenceType: team },
      { text: "The medicine helps my body.", picture: "heart" },
      { text: "I take it with a drink of water.", picture: "drink water" },
      { text: "Then I carry on with my day.", picture: "happy" },
    ],
  },

  // =====================================================================
  // SCHOOL AND DAY SERVICE
  // =====================================================================
  {
    id: "school-morning",
    title: "My school morning",
    kind: "pathway",
    purpose: "explain",
    category: "School and day service",
    summary: "Arrival routine — good as an always-on status radiator.",
    cover: "school",
    display: { autoAdvanceSeconds: 20, lockOpen: true },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I arrive at school.", picture: "school" },
      { text: "I hang up my coat and bag.", picture: "coat" },
      { text: "I say hello to my teacher.", picture: "teacher" },
      { text: "I sit down in my place.", picture: "sit" },
      { text: "Then the first activity starts.", picture: "classroom" },
    ],
  },
  {
    id: "asking-for-help",
    title: "Asking for help",
    kind: "story",
    purpose: "explain",
    category: "School and day service",
    summary: "Names the feeling of being stuck and gives one clear action.",
    cover: "help",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes work is hard and I am stuck.", picture: "difficult" },
      { text: "Being stuck is uncomfortable. Lots of people feel it.", picture: "sad" },
      { text: "There are ways to let someone know.", picture: "help" },
      { text: "I can put my hand up, or show my help card.", picture: "raise hand", sentenceType: coach },
      { text: "Teachers expect people to ask when they are stuck.", picture: "teacher" },
      { text: "Then the work is easier.", picture: "work" },
      { text: "Asking for help is a sensible thing to do.", picture: "well done" },
    ],
  },
  {
    id: "taking-turns",
    title: "Taking turns",
    kind: "story",
    purpose: "explain",
    category: "School and day service",
    summary: "Explains waiting for a turn without telling the reader off.",
    cover: "take turns",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "When people play together, they take turns.", picture: "play" },
      { text: "Taking turns means one person goes, then the next person goes.", picture: "take turns" },
      { text: "While I wait, it is my friend's turn.", picture: "wait" },
      { text: "Waiting can feel long.", picture: "clock" },
      { text: "Then it is my turn again.", picture: "happy" },
    ],
  },

  // =====================================================================
  // OUT AND ABOUT
  // =====================================================================
  {
    id: "supermarket",
    title: "Going to the supermarket",
    kind: "story",
    purpose: "explain",
    category: "Out and about",
    summary: "Covers the noise, the queue and leaving without buying everything.",
    cover: "supermarket",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "We are going to the supermarket to buy food.", picture: "supermarket" },
      { text: "The supermarket is bright, and often noisy.", picture: "noise" },
      { text: "I can wear my ear defenders if it is too loud.", picture: "ear defenders", sentenceType: coach },
      { text: "We put the food we need in the trolley.", picture: "trolley" },
      { text: "We buy the things on our list. Other things stay in the shop.", picture: "list" },
      { text: "We wait in the queue and pay. Then we go home.", picture: "pay" },
    ],
  },
  {
    id: "bus-journey",
    title: "Taking the bus",
    kind: "pathway",
    purpose: "explain",
    category: "Out and about",
    summary: "Stop, ticket, seat, bell, off — five clear stages.",
    cover: "bus",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "We are taking the bus.", picture: "bus" },
      { text: "We wait at the bus stop.", picture: "bus stop" },
      { text: "When the bus arrives, we climb on and pay.", picture: "pay" },
      { text: "We find a seat and sit down.", picture: "sit" },
      { text: "The bus moves. I can look out of the window.", picture: "window" },
      { text: "We press the bell before our stop, then we climb off.", picture: "bus stop" },
    ],
  },
  {
    id: "haircut",
    title: "Getting a haircut",
    kind: "story",
    purpose: "explain",
    category: "Out and about",
    summary: "For the sounds and sensations that make haircuts hard.",
    cover: "hairdresser",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "My hair grows, so sometimes it is cut.", picture: "hair" },
      { text: "I sit in the chair. A cape goes around me.", picture: "hairdresser" },
      { text: "The scissors make a snipping sound near my ears.", picture: "scissors" },
      { text: "Little bits of hair can feel itchy. That feeling stops.", picture: "itch" },
      { text: "Cutting hair does not hurt. Hair has no feeling in it.", picture: "calm" },
      { text: "When it is finished, I can climb down.", picture: "well done" },
    ],
  },

  // =====================================================================
  // FEELINGS
  // =====================================================================
  {
    id: "feeling-angry",
    title: "When I feel angry",
    kind: "story",
    purpose: "explain",
    category: "Feelings",
    summary: "Normalises the feeling, then offers one thing to try.",
    cover: "angry",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes I feel angry.", picture: "angry" },
      { text: "Anger is a strong feeling. Lots of people have it.", picture: "people" },
      { text: "When it comes, my body warms up and my heart beats fast.", picture: "body" },
      { text: "Being angry is allowed. Hurting people is not allowed.", picture: "stop" },
      { text: "I can take three slow breaths.", picture: "breathe", sentenceType: coach },
      { text: "There is a quieter place nearby.", picture: "quiet" },
      { text: "After a while the angry feeling is smaller.", picture: "calm" },
      { text: "Then I feel more like myself again.", picture: "me" },
    ],
  },
  {
    id: "too-loud",
    title: "When it is too loud",
    kind: "story",
    purpose: "explain",
    category: "Feelings",
    summary: "Sensory overload, and the options available right now.",
    cover: "noise",
    display: { highContrast: true },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Some places are very loud.", picture: "noise" },
      { text: "Loud noise can hurt my ears and make me feel worried.", picture: "worried" },
      { text: "That is a real feeling, not a small one.", picture: "body" },
      { text: "I can put on my ear defenders.", picture: "ear defenders", sentenceType: coach },
      { text: "There is usually a quieter place nearby.", picture: "quiet" },
      { text: "When it is quieter, my body settles down.", picture: "calm" },
    ],
  },
  {
    id: "waiting",
    title: "Waiting",
    kind: "story",
    purpose: "explain",
    category: "Feelings",
    summary: "Makes waiting concrete and finite.",
    cover: "wait",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes I have to wait.", picture: "wait" },
      { text: "Waiting means the thing happens later. It still happens.", picture: "clock" },
      { text: "Waiting can feel hard.", picture: "sad" },
      { text: "While I wait I can look at a book or hold my fidget.", picture: "book", sentenceType: coach },
      { text: "Then it is my turn.", picture: "happy" },
    ],
  },

  // =====================================================================
  // STAYING SAFE
  //
  // The criteria are explicit that a story never replaces supervision, and
  // road safety is the example they give. The story check flags these topics
  // so the supervision plan gets written down rather than assumed.
  // =====================================================================
  {
    id: "crossing-road",
    title: "Crossing the road with my grown-up",
    kind: "pathway",
    purpose: "explain",
    category: "Staying safe",
    summary: "Stop, hold hands, look, cross — always with an adult.",
    cover: "pedestrian crossing",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "To reach the other side, people cross the road.", picture: "pedestrian crossing" },
      { text: "Roads have cars on them. Cars are heavy and fast.", picture: "car" },
      { text: "I cross the road with my grown-up.", picture: "hold hands" },
      { text: "We stop at the edge of the pavement.", picture: "stop" },
      { text: "We look and listen for cars.", picture: "look" },
      { text: "My grown-up says when it is clear, and we walk across together.", picture: "walk", sentenceType: team },
      { text: "Then we are safely on the other side.", picture: "well done" },
    ],
  },
  {
    id: "if-i-get-lost",
    title: "If I cannot find my grown-up",
    kind: "story",
    purpose: "explain",
    category: "Staying safe",
    summary: "Stay still, find a worker. Add your own photos and phone number.",
    cover: "lost",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Busy places have a lot of people moving about.", picture: "people" },
      { text: "Sometimes people are separated from each other.", picture: "lost" },
      { text: "If my grown-up is not beside me, I stop where I am.", picture: "stop" },
      { text: "Staying in one place makes me easier to find.", picture: "wait" },
      { text: "I can look for someone who works there.", picture: "shop assistant", sentenceType: coach },
      { text: "People who work there know how to find my grown-up.", picture: "help" },
      { text: "My grown-up is looking for me too.", picture: "family" },
    ],
  },
];

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
