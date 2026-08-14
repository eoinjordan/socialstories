import type { DisplaySettings, StoryKind } from "./types";

/**
 * The starter catalogue.
 *
 * LICENSING — read before adding to this file.
 *
 * All wording below is original, written for this project and released under
 * CC0-1.0 (see catalog/LICENSE). We deliberately did NOT copy text from the
 * "free social story" libraries that inspired this project: those PDFs are
 * free to download but are all-rights-reserved, so redistributing them inside
 * an app would be infringement. Only add templates here that are either
 * (a) written from scratch, (b) public domain / CC0, or (c) published under an
 * open licence compatible with redistribution, with the source recorded in
 * `source` and the attribution recorded in `attribution`.
 *
 * Pictures are not baked in. Each step carries a `picture` keyword which is
 * resolved against the ARASAAC symbol library when a carer creates a story
 * from the template. That keeps this file text-only and means the symbols stay
 * under their own CC BY-NC-SA licence rather than being re-hosted by us.
 *
 * Style follows the well-established descriptive-narrative pattern: short
 * first-person present-tense sentences, mostly describing what happens and how
 * people feel, with at most one or two sentences suggesting what to do. Note
 * that "Social Story" in its capitalised form is a trademark of Carol Gray;
 * these are generically-worded picture stories, not certified Social Stories™.
 */

export interface TemplateStep {
  text: string;
  /** Search term used to look up an ARASAAC symbol at creation time. */
  picture: string;
  spoken?: string;
}

export interface StoryTemplate {
  id: string;
  title: string;
  kind: StoryKind;
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
  | "Daily routines"
  | "Health and care"
  | "School and day service"
  | "Out and about"
  | "Feelings"
  | "Staying safe";

export const CATEGORIES: Category[] = [
  "Daily routines",
  "Health and care",
  "School and day service",
  "Out and about",
  "Feelings",
  "Staying safe",
];

export const TEMPLATES: StoryTemplate[] = [
  // ---------------------------------------------------------------- routines
  {
    id: "brush-teeth",
    title: "Brushing my teeth",
    kind: "pathway",
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
    category: "Daily routines",
    summary: "Clothes in order, one item per screen.",
    cover: "get dressed",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "In the morning I get dressed.", picture: "get dressed" },
      { text: "First I put on my underwear.", picture: "underwear" },
      { text: "Then my top.", picture: "t-shirt" },
      { text: "Then my trousers.", picture: "trousers" },
      { text: "Then my socks.", picture: "socks" },
      { text: "Last, my shoes.", picture: "shoes" },
      { text: "I am dressed and ready.", picture: "happy" },
    ],
  },
  {
    id: "washing-hands",
    title: "Washing my hands",
    kind: "pathway",
    category: "Daily routines",
    summary: "A short hand-washing sequence with a counting step.",
    cover: "wash hands",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I wash my hands before I eat.", picture: "wash hands" },
      { text: "I turn on the tap.", picture: "tap" },
      { text: "I put soap on my hands.", picture: "soap" },
      { text: "I rub my hands together while I count to twenty.", picture: "wash hands", spoken: "Rub your hands together while we count to twenty." },
      { text: "I rinse the soap off.", picture: "water" },
      { text: "I dry my hands on the towel.", picture: "towel" },
    ],
  },
  {
    id: "bedtime",
    title: "Going to bed",
    kind: "pathway",
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
      { text: "I get into bed.", picture: "bed" },
      { text: "The light goes off. I can rest now.", picture: "sleep" },
    ],
  },

  // ------------------------------------------------------------ health/care
  {
    id: "doctor-visit",
    title: "Going to the doctor",
    kind: "pathway",
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
      { text: "It might feel strange. It does not usually hurt.", picture: "calm" },
      { text: "When it is finished I can sit up. I did it.", picture: "well done" },
    ],
  },
  {
    id: "blood-test",
    title: "Having a blood test",
    kind: "pathway",
    category: "Health and care",
    summary: "Honest about the sharp feeling, and short.",
    cover: "blood test",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "A nurse needs to take a little bit of my blood.", picture: "nurse" },
      { text: "I sit down and roll up my sleeve.", picture: "sit" },
      { text: "The nurse wipes my arm. It feels cold.", picture: "arm" },
      { text: "There is a quick sharp feeling. I can look away.", picture: "injection" },
      { text: "It is over quickly. I get a plaster.", picture: "plaster" },
      { text: "I am finished. I did a hard thing.", picture: "well done" },
    ],
  },
  {
    id: "hospital-day",
    title: "A day at the hospital",
    kind: "pathway",
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
      { text: "A doctor or nurse will explain what happens next.", picture: "nurse" },
      { text: "When everything is done, we go home.", picture: "home" },
    ],
  },
  {
    id: "taking-medicine",
    title: "Taking my medicine",
    kind: "pathway",
    category: "Health and care",
    summary: "A daily medication routine that can sit on a wall tablet.",
    cover: "medicine",
    display: { autoAdvanceSeconds: 0 },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "I take my medicine at the same time every day.", picture: "medicine" },
      { text: "A grown-up gets the right medicine for me.", picture: "adult" },
      { text: "I take it with a drink of water.", picture: "drink water" },
      { text: "Then I can carry on with my day.", picture: "happy" },
    ],
  },

  // ------------------------------------------------------------------ school
  {
    id: "school-morning",
    title: "My school morning",
    kind: "pathway",
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
      { text: "We start the first activity.", picture: "classroom" },
    ],
  },
  {
    id: "asking-for-help",
    title: "Asking for help",
    kind: "story",
    category: "School and day service",
    summary: "Names the feeling of being stuck and gives one clear action.",
    cover: "help",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes work is hard and I get stuck.", picture: "difficult" },
      { text: "Feeling stuck is uncomfortable. Lots of people feel it.", picture: "sad" },
      { text: "When I am stuck, I can put my hand up.", picture: "raise hand" },
      { text: "Or I can show my help card.", picture: "help" },
      { text: "A grown-up will come and help me.", picture: "teacher" },
      { text: "Asking for help is a good thing to do.", picture: "well done" },
    ],
  },
  {
    id: "taking-turns",
    title: "Taking turns",
    kind: "story",
    category: "School and day service",
    summary: "Explains waiting for a turn without telling the reader off.",
    cover: "take turns",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "When we play together, we take turns.", picture: "play" },
      { text: "Taking turns means one person goes, then the next person goes.", picture: "take turns" },
      { text: "While I wait, it is my friend's turn.", picture: "wait" },
      { text: "Waiting can feel long. I can count or hold something in my hands.", picture: "wait" },
      { text: "Then it is my turn again.", picture: "happy" },
    ],
  },

  // ------------------------------------------------------------- out & about
  {
    id: "supermarket",
    title: "Going to the supermarket",
    kind: "story",
    category: "Out and about",
    summary: "Covers the noise, the queue and leaving without buying everything.",
    cover: "supermarket",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "We are going to the supermarket to buy food.", picture: "supermarket" },
      { text: "The supermarket can be bright and noisy.", picture: "noise" },
      { text: "If it is too loud, I can wear my ear defenders.", picture: "ear defenders" },
      { text: "We put the things we need in the trolley.", picture: "trolley" },
      { text: "We buy the things on our list. Other things stay in the shop.", picture: "list" },
      { text: "We wait in the queue and pay. Then we go home.", picture: "pay" },
    ],
  },
  {
    id: "bus-journey",
    title: "Taking the bus",
    kind: "pathway",
    category: "Out and about",
    summary: "Stop, ticket, seat, bell, off — five clear stages.",
    cover: "bus",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "We are taking the bus.", picture: "bus" },
      { text: "We wait at the bus stop.", picture: "bus stop" },
      { text: "When the bus comes, we get on and pay.", picture: "pay" },
      { text: "We find a seat and sit down.", picture: "sit" },
      { text: "The bus moves. I can look out of the window.", picture: "window" },
      { text: "We press the bell before our stop, then we get off.", picture: "bus stop" },
    ],
  },
  {
    id: "haircut",
    title: "Getting a haircut",
    kind: "story",
    category: "Out and about",
    summary: "For the sounds and sensations that make haircuts hard.",
    cover: "hairdresser",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "My hair grows, so sometimes it needs cutting.", picture: "hair" },
      { text: "I sit in the chair. A cape goes around me.", picture: "hairdresser" },
      { text: "The scissors make a snipping sound near my ears.", picture: "scissors" },
      { text: "Little bits of hair can feel itchy. That feeling stops.", picture: "itch" },
      { text: "Cutting hair does not hurt. Hair has no feeling.", picture: "calm" },
      { text: "When it is finished, I can get down.", picture: "well done" },
    ],
  },

  // ---------------------------------------------------------------- feelings
  {
    id: "feeling-angry",
    title: "When I feel angry",
    kind: "story",
    category: "Feelings",
    summary: "Normalises the feeling, then offers three things to try.",
    cover: "angry",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes I feel angry.", picture: "angry" },
      { text: "Anger is a strong feeling. Everybody has it sometimes.", picture: "people" },
      { text: "When it comes, my body warms up and my heart beats fast.", picture: "body" },
      { text: "Being angry is allowed. Hurting people is not allowed.", picture: "stop" },
      { text: "I can take three slow breaths.", picture: "breathe" },
      { text: "I can go somewhere quiet, or tell someone how I feel.", picture: "quiet" },
      { text: "The angry feeling gets smaller. I feel calmer.", picture: "calm" },
    ],
  },
  {
    id: "too-loud",
    title: "When it is too loud",
    kind: "story",
    category: "Feelings",
    summary: "Sensory overload, and the options available right now.",
    cover: "noise",
    display: { highContrast: true },
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes places are very loud.", picture: "noise" },
      { text: "Loud noise can hurt my ears and make me feel worried.", picture: "worried" },
      { text: "I can put on my ear defenders.", picture: "ear defenders" },
      { text: "I can ask to go somewhere quieter.", picture: "quiet" },
      { text: "A grown-up will help me.", picture: "adult" },
      { text: "When it is quieter, my body feels better.", picture: "calm" },
    ],
  },
  {
    id: "waiting",
    title: "Waiting",
    kind: "story",
    category: "Feelings",
    summary: "Makes waiting concrete and finite.",
    cover: "wait",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes I have to wait.", picture: "wait" },
      { text: "Waiting means the thing happens later. It still happens.", picture: "clock" },
      { text: "Waiting can feel hard.", picture: "sad" },
      { text: "While I wait I can look at a book or hold my fidget.", picture: "book" },
      { text: "Then it is my turn.", picture: "happy" },
    ],
  },

  // ------------------------------------------------------------ staying safe
  {
    id: "crossing-road",
    title: "Crossing the road",
    kind: "pathway",
    category: "Staying safe",
    summary: "Stop, look, listen, hold hands, cross.",
    cover: "pedestrian crossing",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "To get to the other side, we cross the road.", picture: "pedestrian crossing" },
      { text: "We stop at the edge of the pavement.", picture: "stop" },
      { text: "We hold hands.", picture: "hold hands" },
      { text: "We look left and right for cars.", picture: "look" },
      { text: "When there are no cars, we walk across together.", picture: "walk" },
      { text: "We are safely on the other side.", picture: "well done" },
    ],
  },
  {
    id: "if-i-get-lost",
    title: "If I get lost",
    kind: "story",
    category: "Staying safe",
    summary: "Stay still, find a safe adult. Add your own photos and phone number.",
    cover: "lost",
    source: "original",
    license: "CC0-1.0",
    steps: [
      { text: "Sometimes people get separated in a busy place.", picture: "people" },
      { text: "If my grown-up is not beside me, I stop where I am.", picture: "stop" },
      { text: "I stay still so they can find me.", picture: "wait" },
      { text: "I can look for someone who works there.", picture: "shop assistant" },
      { text: "I can show my card with my name and phone number.", picture: "card" },
      { text: "My grown-up will come and find me.", picture: "family" },
    ],
  },
];

export function templateById(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
