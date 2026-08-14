/**
 * The shared core, compiled for the static GitHub Pages build.
 *
 * This deliberately imports from `web/lib` rather than reimplementing
 * anything. The story format, the Social Stories 10.4 checks and the template
 * catalogue must not drift between the hosted app and the offline one — a
 * story built here has to open unchanged in the web app and on the tablet.
 */
import { checkStory, checkLibrary, classify, SENTENCE_TYPE_LABELS, SENTENCE_TYPE_HELP } from "../../web/lib/quality";
import { TEMPLATES, CATEGORIES } from "../../web/lib/catalog";
import { searchBundled, bundledUrl, isBundled, BUNDLED_COUNT } from "../../web/lib/symbols";
import { emptyStory, migrate, DEFAULT_DISPLAY, SCHEMA_VERSION } from "../../web/lib/types";

declare global {
  interface Window {
    SS: unknown;
  }
}

window.SS = {
  checkStory,
  checkLibrary,
  classify,
  SENTENCE_TYPE_LABELS,
  SENTENCE_TYPE_HELP,
  TEMPLATES,
  CATEGORIES,
  searchBundled,
  bundledUrl,
  isBundled,
  BUNDLED_COUNT,
  emptyStory,
  migrate,
  DEFAULT_DISPLAY,
  SCHEMA_VERSION,
};
