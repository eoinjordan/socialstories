/**
 * The vocabulary bundled with the app.
 *
 * Every term here is resolved to an ARASAAC pictogram and the image is
 * committed to the repository (see `scripts/fetch-symbols.mts`), so that:
 *
 *  - the symbol picker works with no network and no dependency on ARASAAC
 *    being up, which matters because carers write these stories in hospital
 *    waiting rooms and school corridors;
 *  - the Android app ships with a usable symbol set rather than an empty
 *    picker until its first sync;
 *  - a story built from these symbols keeps working years from now even if
 *    upstream reorganises its library.
 *
 * The full ARASAAC catalogue is far too large to bundle (tens of thousands of
 * images), so this is a deliberately chosen core: the words the shipped
 * templates need, plus a general-purpose vocabulary covering the domains this
 * app is for. Live search against ARASAAC is still available and still the way
 * to find anything not listed here.
 *
 * LICENCE: the bundled images are ARASAAC pictograms, author Sergio Palao,
 * origin ARASAAC (https://arasaac.org), owner Government of Aragón, licensed
 * CC BY-NC-SA. Redistribution is permitted on those terms — attribution, same
 * licence, non-commercial. See public/symbols/LICENSE.txt.
 */

export interface VocabularyGroup {
  name: string;
  terms: string[];
}

export const VOCABULARY: VocabularyGroup[] = [
  {
    name: "People",
    terms: [
      "me", "family", "mum", "dad", "brother", "sister", "grandmother",
      "grandfather", "friend", "friends", "people", "adult", "child", "baby",
      "teacher", "doctor", "nurse", "dentist", "carer", "shop assistant",
      "bus driver", "hairdresser", "neighbour", "boy", "girl", "man", "woman",
    ],
  },
  {
    name: "Feelings",
    terms: [
      "happy", "sad", "angry", "worried", "scared", "tired", "excited",
      "proud", "calm", "confused", "surprised", "bored", "lonely", "sick",
      "pain", "hurt", "love", "heart", "smile", "laugh", "cry", "hug",
      "difficult", "strong", "brave",
    ],
  },
  {
    name: "Body and health",
    terms: [
      "body", "head", "hand", "arm", "leg", "foot", "eye", "ear", "mouth",
      "nose", "hair", "teeth", "tummy", "brain", "medicine", "injection",
      "plaster", "blood test", "thermometer", "stethoscope", "hospital",
      "ambulance", "wheelchair", "glasses", "hearing aid", "itch",
    ],
  },
  {
    name: "Daily routine",
    terms: [
      "wake up", "get dressed", "wash hands", "brush teeth", "toothbrush",
      "toothpaste", "shower", "bath", "toilet", "soap", "towel", "tap",
      "water", "sink", "clean", "pyjamas", "bed", "sleep", "night",
      "morning", "breakfast", "lunch", "dinner", "eat", "drink",
      "drink water", "food", "clothes", "t-shirt", "trousers", "socks",
      "shoes", "coat", "underwear",
    ],
  },
  {
    name: "School and work",
    terms: [
      "school", "classroom", "work", "learn", "book", "read", "write",
      "pencil", "paper", "computer", "table", "chair", "sit", "stand",
      "raise hand", "help", "listen", "look", "talk", "question", "answer",
      "finish", "start", "break time", "playground", "line up", "homework",
    ],
  },
  {
    name: "Out and about",
    terms: [
      "home", "house", "garden", "shop", "supermarket", "trolley", "list",
      "pay", "money", "bus", "bus stop", "car", "train", "walk", "bicycle",
      "park", "playground", "swimming pool", "library", "church", "cinema",
      "restaurant", "pedestrian crossing", "traffic light", "road", "window",
      "door", "building", "reception", "waiting room", "lift",
    ],
  },
  {
    name: "Time and sequence",
    terms: [
      "clock", "calendar", "today", "tomorrow", "yesterday", "wait", "first",
      "next", "last", "before", "after", "now", "later", "day", "week",
      "weekend", "birthday", "holiday", "change", "repeat", "finished",
    ],
  },
  {
    name: "Actions and needs",
    terms: [
      "go", "stop", "come", "give", "take", "open", "close", "put", "play",
      "share", "take turns", "choose", "hold hands", "breathe", "quiet",
      "noise", "ear defenders", "toy", "more", "again", "please",
      "thank you", "yes", "no", "ok", "want", "need", "like", "sorry",
      "hello", "goodbye", "communication",
    ],
  },
  {
    name: "Encouragement",
    terms: [
      "well done", "good", "star", "party", "idea", "new", "care", "plant",
      "team", "lost", "safe", "danger", "rules", "secret", "truth",
    ],
  },
];

/** Flat, de-duplicated list of every bundled term. */
export const VOCABULARY_TERMS: string[] = [
  ...new Set(VOCABULARY.flatMap((g) => g.terms)),
];
