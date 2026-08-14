# The starter catalogue — licensing and provenance

The catalogue lives in [`../web/lib/catalog.ts`](../web/lib/catalog.ts). This
file explains the rules it follows, because getting this wrong would be both a
legal problem and a betrayal of the people whose work we would be taking.

## What we did

Every template in the catalogue was **written from scratch for this project**
and is released under **CC0-1.0** (public domain dedication). You may copy,
adapt, translate, print or sell them with no obligation to us.

The catalogue holds *text only*. Each step names a plain-English keyword like
`"brush teeth"`, which is looked up against the ARASAAC symbol library when a
carer creates their copy. No pictures are stored in this repository.

## What we deliberately did not do

The two libraries that prompted this project —
[Autism Little Learners](https://autismlittlelearners.com/the-social-story-library/)
and [Autism Behavior Services](https://autismbehaviorservices.com/social-stories/)
— publish social stories **free of charge**, but free is not the same as openly
licensed. Their material is all-rights-reserved: free to download and use with
the children you support, not free to redistribute inside an app. None of their
wording, artwork or structure was copied. Please keep it that way.

The same applies to most "free social story" PDFs you will find. Assume
all-rights-reserved unless the source states a licence.

## Adding to the catalogue

A template may be added only if it is one of:

1. **Written from scratch.** Mark it `source: "original"`, `license: "CC0-1.0"`.
2. **Public domain or CC0** from an identifiable source.
3. **Openly licensed** in a way that permits redistribution and adaptation —
   CC BY, CC BY-SA, or the UK Open Government Licence (a lot of NHS and gov.uk
   easy-read material is OGL v3, which is genuinely reusable with attribution).

Record where it came from and reproduce the required attribution. If you cannot
determine the licence, the answer is no.

## The method

The authoring criteria the editor checks against, and where they come from, are
documented in [`SOURCES.md`](SOURCES.md). Read that before changing
`web/lib/quality.ts`.

## House style

The templates follow the long-established descriptive-narrative pattern:

- short, first-person, present tense — "I sit in the big chair";
- mostly **descriptive** ("what happens") and **perspective** ("people feel…")
  sentences, with at most one or two **directive** sentences ("I can…");
- honest about unpleasant parts rather than reassuring — "there is a quick sharp
  feeling" beats "it doesn't hurt", which is both untrue and destroys trust;
- ends somewhere settled.

Note that **"Social Story™" is a trademark of Carol Gray**, attached to a
specific set of authoring criteria. These templates are generically-worded
picture stories written in a similar tradition; they are not certified Social
Stories and should not be advertised as such.

## A note on the symbols

ARASAAC pictograms are **CC BY-NC-SA**:

- **BY** — attribute Sergio Palao / ARASAAC / Government of Aragón. Both clients
  do this on screen.
- **NC** — non-commercial use only. Selling this app, or bundling it into a paid
  product, needs a different symbol set.
- **SA** — derivatives carry the same licence.

If you need a commercially usable symbol set, look at Mulberry Symbols
(CC BY-SA 2.0 UK) or Sclera (CC BY-NC-SA), or licence PCS/Widgit commercially.
Swapping sets means changing `web/lib/pictograms.ts` and the image proxy — the
`Media` format already stores an opaque id, so nothing else has to change.
