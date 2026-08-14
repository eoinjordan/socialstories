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

| Criterion (10.4) | Implemented as |
|---|---|
| 1 — philosophy, definition, goal | Flags supervision-critical topics (roads, medicines, water, getting lost) with a reminder that a story never replaces an adult being there |
| 3 — structure | Warns on a placeholder title and on stories with fewer than three parts |
| 4 — format | Flags steps over ~20 words, steps with no picture, and stories with no real photos |
| 5 — tone | Flags second person, judging vocabulary, narration of the reader's own difficult behaviour, and unchecked absolutes |
| 6 — WH questions | Notes which of who/what/when/where/why look unanswered |
| 7 — celebrate | Library-wide: warns when under half of a person's stories celebrate them |
| 8 — the formula | Story Rating = describing ÷ coaching, title counted as describing, must reach **4**; and at most **one** sentence that coaches the reader |

Criteria 2, 9 and 10 — gathering information from the people who know the
person, revising until it is right, and planning how the story is introduced,
reviewed and retired — are human work no editor can check. They are the most
important ones. The `carerNotes` field exists to hold that thinking; there is a
case for turning it into a structured goal / observation / review prompt later.

### A correction worth recording

This checker was first written against the University of Bath summary, which
documents an earlier revision of the criteria. Two things differ materially in
10.4 and were wrong until the primary source was read:

- the Story Rating threshold is **4**, not 2;
- there may be **at most one** sentence that coaches the reader, and the title
  counts as a describing sentence in the formula.

10.4 also collapses the seven sentence types to two (Descriptive and Coaching),
which is why `SentenceType` has three values rather than five — we split
Coaching into "coaches the reader" and "says what other people do" only because
the one-sentence cap applies to the former.

## Things worth knowing that the checker cannot enforce

- **A story is never introduced as a consequence for something going wrong.**
  It is read in a calm, positive moment. Nothing in a text editor can enforce
  this, and it is one of the screening questions that disqualifies a story
  outright.
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
