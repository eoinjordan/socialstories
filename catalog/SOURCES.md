# Where the method came from

The story-writing rules implemented in
[`../web/lib/quality.ts`](../web/lib/quality.ts) are not invented. They come
from the Social Story authoring criteria developed by **Carol Gray**, which are
publicly described in several places. We implemented the *method* — a described
procedure, which is not itself copyrightable — in our own words, and copied no
text from any of these.

## Primary source

- **Carol Gray, "Social Stories 10.4"** —
  <https://carolgraysocialstories.com/social-stories/social-stories-10-4-updates/>
  The criteria themselves, and the "It's not a Social Story if…" companion.
  Gray's handouts and books are copyrighted; buy *The New Social Stories Book*
  if you are writing stories seriously. **"Social Story™" is her trademark.**

## Secondary sources used while implementing

- **University of Bath / SOFA, "Guidance for writing and delivering Social
  Stories"** —
  <https://www.bath.ac.uk/publications/guide-for-writing-and-delivering-social-stories/>
  A clear twelve-page summary of the ten criteria, produced alongside the free
  [Stories Online For Autism](https://sofa-app.org) app. This was the main
  reference for the checks. Not redistributed here.
- **Kansas TASN resource collection** — <https://ksdetasn.org/resources/3953>
- **Growtale's summary of the methodology** —
  <https://www.growtale.org/blog/how-to-write-social-story-carol-gray-methodology>

## What the checker actually implements

| Criterion | Implemented as |
|---|---|
| 3 — three parts and a title | Warns on a placeholder title and on stories under three steps |
| 4 — format | Flags steps over ~20 words and steps with no picture |
| 5 — voice and vocabulary | Flags "you", commanding/judging words, vague verbs, absolutes |
| 6 — six questions | Notes which of who/what/when/where/why look unanswered |
| 7 — sentence types | Per-step tagging, with an auto-guess; requires ≥1 descriptive |
| 8 — the ratio | Computes (descriptive + perspective + affirmative) ÷ coaching, wants ≥ 2 |
| 9 — make it theirs | Nudges towards real photos over generic symbols |

Criteria 1, 2 and 10 — set a goal, gather information from the people who know
the person, and plan how the story is introduced, reviewed and retired — are
human work that no editor can check. They are the most important ones. The
`carerNotes` field exists to hold that thinking; there is a case for turning it
into a structured goal/observation/review prompt later.

## Things worth knowing that the checker cannot enforce

- **Half of a person's stories should praise something they already do well.**
  A library that is entirely instructions is a library that says "you are a
  problem". This would be a good future check across the whole library, not the
  single story.
- **Gather information first.** The point of the process is understanding the
  situation from the person's point of view, not producing a document.
- **Be honest about unpleasant parts.** "There is a quick sharp feeling" earns
  more trust than "it doesn't hurt", which is untrue and gets found out once.
- **Retire and recycle.** Once a skill is mastered, the story should become one
  that congratulates rather than instructs.

## Sample data / test account

A shared Drive folder was provided for building out a test user:
<https://drive.google.com/drive/folders/1rG5BPD0WAiepRuxTocxnJWHCADPkEpcY>

Note that the app cannot read a folder shared this way. The `drive.file` scope
only grants access to files **the app itself created**, which is the whole point
of choosing it — signing in does not expose the rest of anyone's Drive. To seed
a test account, sign in as that account and copy templates from `/templates`;
the app will create its own `Social Stories` folder.
