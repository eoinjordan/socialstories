/*
 * The offline builder.
 *
 * Everything here runs in the browser with no server: stories live in
 * localStorage and pictures come from the symbol set bundled with the page. It
 * exists so someone can write a usable story without an account, without a
 * database, and — after the first load — without a network.
 *
 * The story format, the Social Stories 10.4 checks and the template catalogue
 * all come from core.js, compiled from the same `web/lib` sources the hosted
 * app uses. Nothing about the format is reimplemented here, so a story
 * exported from this page opens unchanged in the web app and on the tablet.
 *
 * Known limitation, stated plainly in the UI: photographs are not supported
 * here. Embedding one would mean a data URL inside the document, which would
 * break format compatibility with the two apps that read these files. Symbols
 * only; add photos in the full app.
 */
(function () {
  "use strict";

  var SS = window.SS;
  var KEY = "social-stories/v2";
  var view = document.getElementById("view");
  var topbar = document.getElementById("topbar");

  // ---------------------------------------------------------------- storage

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw).map(SS.migrate) : [];
    } catch (e) {
      return [];
    }
  }

  function save(stories) {
    try {
      localStorage.setItem(KEY, JSON.stringify(stories));
      return true;
    } catch (e) {
      // A quota failure must not look like success — the whole point of this
      // page is that the work is not silently lost.
      alert(
        "This browser could not save your stories (storage is full). " +
          "Export them to a file before you close the tab.",
      );
      return false;
    }
  }

  function upsert(story) {
    var stories = load();
    var i = stories.findIndex(function (s) {
      return s.id === story.id;
    });
    story.updatedAt = new Date().toISOString();
    if (i === -1) stories.unshift(story);
    else stories[i] = story;
    save(stories);
  }

  function find(id) {
    return load().find(function (s) {
      return s.id === id;
    });
  }

  // ------------------------------------------------------------- DOM helper

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined) return;
      if (k === "class") node.className = v;
      else if (k === "style") node.setAttribute("style", v);
      else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function field(labelText, control) {
    var id = "f" + Math.random().toString(36).slice(2);
    control.id = id;
    return el("div", { class: "field" }, [
      el("label", { for: id }, [labelText]),
      control,
    ]);
  }

  function pictureUrl(media) {
    return media && media.kind === "pictogram"
      ? "../symbols/" + media.id + ".png"
      : null;
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 3) | 8).toString(16);
    });
  }

  // ---------------------------------------------------------------- routing

  function route() {
    var parts = (location.hash.slice(1) || "library").split("/");
    var player = document.querySelector(".player");
    if (player) player.remove();
    view.classList.remove("hidden");
    topbar.classList.remove("hidden");
    view.innerHTML = "";

    if (parts[0] === "edit") renderEditor(parts[1]);
    else if (parts[0] === "play") renderPlayer(parts[1]);
    else if (parts[0] === "templates") renderTemplates();
    else renderLibrary();
    window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- library

  function renderLibrary() {
    var stories = load();

    view.appendChild(
      el("div", { class: "row", style: "margin-bottom:24px" }, [
        el("h1", { style: "margin:0" }, ["My stories"]),
        el("span", { class: "spacer" }),
        el("a", { class: "btn", href: "#templates" }, ["Browse templates"]),
        newButton("+ New story", "explain"),
        newButton("+ New celebration", "celebrate"),
      ]),
    );

    // The 7th criterion is about a whole collection, so it has no other home.
    SS.checkLibrary(
      stories.map(function (s) {
        return { purpose: s.purpose, audience: s.audience };
      }),
    ).forEach(function (r) {
      view.appendChild(
        el("p", { class: "notice" }, [
          r.audience +
            " has " +
            r.total +
            " stories and " +
            (r.celebrating === 0 ? "none" : "only " + r.celebrating) +
            " of them celebrate something they already do well. The criteria " +
            "ask for at least half.",
        ]),
      );
    });

    if (stories.length === 0) {
      view.appendChild(
        el("div", { class: "card" }, [
          el("h2", {}, ["Nothing here yet"]),
          el("p", { class: "muted" }, [
            "Start from a template, or build your own. Everything is saved in " +
              "this browser only — export to a file to keep it safe or move it " +
              "to the full app.",
          ]),
        ]),
      );
    } else {
      var grid = el("div", { class: "grid" });
      stories.forEach(function (s) {
        grid.appendChild(storyCard(s));
      });
      view.appendChild(grid);
    }

    view.appendChild(
      el("section", { class: "card", style: "margin-top:32px" }, [
        el("h2", {}, ["Keep your work"]),
        el("p", { class: "muted" }, [
          "These stories live in this browser. Clearing site data deletes them. " +
            "Export writes a file that the web app and the Android app both read.",
        ]),
        el("div", { class: "row" }, [
          el("button", { class: "btn secondary", onclick: exportAll }, [
            "Export all to a file",
          ]),
          el("button", { class: "btn secondary", onclick: importFile }, [
            "Import from a file",
          ]),
        ]),
      ]),
    );
  }

  function newButton(label, purpose) {
    return el(
      "button",
      {
        class: "btn secondary",
        onclick: function () {
          var s = SS.emptyStory("story", purpose);
          upsert(s);
          location.hash = "edit/" + s.id;
        },
      },
      [label],
    );
  }

  function storyCard(s) {
    var cover = pictureUrl(s.cover);
    return el("article", { class: "story-card" }, [
      el("div", { class: "thumb" }, [
        cover
          ? el("img", { alt: "", src: cover })
          : el("span", { class: "muted" }, ["No picture"]),
      ]),
      el("div", { class: "body" }, [
        el("span", { class: s.purpose === "celebrate" ? "tag good" : "tag" }, [
          s.purpose === "celebrate"
            ? "Celebrates"
            : s.kind === "pathway"
              ? "Pathway"
              : "Story",
        ]),
        el("h3", {}, [s.title]),
        el("p", { class: "muted" }, [
          s.steps.length + (s.steps.length === 1 ? " step" : " steps"),
        ]),
        el("span", { class: "spacer" }),
        el("div", { class: "row" }, [
          el("a", { class: "btn", href: "#play/" + s.id }, ["Play"]),
          el("a", { class: "btn secondary", href: "#edit/" + s.id }, ["Edit"]),
          el(
            "button",
            {
              class: "btn danger",
              onclick: function () {
                if (!confirm("Delete “" + s.title + "”? This cannot be undone.")) {
                  return;
                }
                save(
                  load().filter(function (x) {
                    return x.id !== s.id;
                  }),
                );
                route();
              },
            },
            ["Delete"],
          ),
        ]),
      ]),
    ]);
  }

  function exportAll() {
    var blob = new Blob([JSON.stringify(load(), null, 2)], {
      type: "application/json",
    });
    var a = el("a", {
      href: URL.createObjectURL(blob),
      download: "social-stories.json",
    });
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function importFile() {
    var input = el("input", { type: "file", accept: "application/json" });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(String(reader.result));
          var incoming = (Array.isArray(parsed) ? parsed : [parsed]).map(SS.migrate);
          var existing = load();
          incoming.forEach(function (s) {
            // Re-importing should update rather than duplicate.
            var i = existing.findIndex(function (x) {
              return x.id === s.id;
            });
            if (i === -1) existing.unshift(s);
            else existing[i] = s;
          });
          save(existing);
          route();
        } catch (e) {
          alert("That file could not be read as a story file.");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  // -------------------------------------------------------------- templates

  function renderTemplates() {
    view.appendChild(
      el("div", { class: "row", style: "margin-bottom:16px" }, [
        el("h1", { style: "margin:0" }, ["Templates"]),
        el("span", { class: "spacer" }),
        el("a", { class: "btn secondary", href: "#library" }, ["My stories"]),
      ]),
    );
    view.appendChild(
      el("p", { class: "muted", style: "max-width:70ch" }, [
        "Ready-made starting points. Copying one gives you your own editable " +
          "copy — change the words to match the person you are writing for.",
      ]),
    );

    var grid = el("div", { class: "grid" });
    SS.TEMPLATES.forEach(function (t) {
      grid.appendChild(
        el("article", { class: "story-card" }, [
          el("div", { class: "body" }, [
            el("span", { class: t.purpose === "celebrate" ? "tag good" : "tag" }, [
              t.purpose === "celebrate"
                ? "Celebrates"
                : t.kind === "pathway"
                  ? "Pathway"
                  : "Story",
            ]),
            el("h3", {}, [t.title]),
            el("p", { class: "muted" }, [t.summary]),
            el("p", { class: "muted" }, [
              t.steps.length + " steps · " + t.category,
            ]),
            el("span", { class: "spacer" }),
            el(
              "button",
              {
                class: "btn",
                onclick: function () {
                  var story = fromTemplate(t);
                  upsert(story);
                  location.hash = "edit/" + story.id;
                },
              },
              ["Use this"],
            ),
          ]),
        ]),
      );
    });
    view.appendChild(grid);
  }

  function fromTemplate(t) {
    var now = new Date().toISOString();
    return {
      schemaVersion: SS.SCHEMA_VERSION,
      id: uuid(),
      kind: t.kind,
      purpose: t.purpose,
      title: t.title,
      carerNotes:
        'Started from the "' +
        t.title +
        '" template. Change the words to match the person, and swap in photos ' +
        "of the real people and places in the full app.",
      cover: symbolFor(t.cover),
      steps: t.steps.map(function (s) {
        return {
          id: uuid(),
          text: s.text,
          spoken: s.spoken,
          sentenceType: s.sentenceType,
          media: symbolFor(s.picture),
        };
      }),
      display: Object.assign({}, SS.DEFAULT_DISPLAY, t.display || {}),
      createdAt: now,
      updatedAt: now,
    };
  }

  /** Resolves a template keyword against the bundled set only — no network. */
  function symbolFor(keyword) {
    var hits = SS.searchBundled(keyword, 1);
    return hits.length
      ? { kind: "pictogram", id: hits[0].id, label: hits[0].label }
      : { kind: "none" };
  }

  // ----------------------------------------------------------------- editor

  function renderEditor(id) {
    var story = find(id);
    if (!story) {
      location.hash = "library";
      return;
    }

    var checkSection = el("section", { class: "card" });

    function update(fn) {
      fn(story);
      upsert(story);
      renderCheck();
    }

    view.appendChild(
      el("div", { class: "row", style: "margin-bottom:20px" }, [
        el("h1", { style: "margin:0" }, ["Edit"]),
        el("span", { class: "spacer" }),
        el("span", { class: "muted" }, ["Saved in this browser"]),
        el("a", { class: "btn", href: "#play/" + story.id }, ["Play"]),
        el("a", { class: "btn secondary", href: "#library" }, ["My stories"]),
      ]),
    );

    var about = el("section", { class: "card" }, [
      field("Title", textInput(story, "title", update)),
      field(
        "What is this story for?",
        selectInput(
          story,
          "purpose",
          [
            ["explain", "Explaining a situation"],
            ["celebrate", "Celebrating what they do well"],
          ],
          update,
        ),
      ),
      field("Who is this for?", textInput(story, "audience", update)),
      field(
        "Type",
        selectInput(
          story,
          "kind",
          [
            ["story", "Social story"],
            ["pathway", "Care pathway"],
          ],
          update,
        ),
      ),
    ]);
    about.appendChild(el("label", {}, ["Cover picture"]));
    about.appendChild(
      picker(story.cover, function (m) {
        update(function (d) {
          d.cover = m;
        });
        route();
      }),
    );
    view.appendChild(about);
    view.appendChild(checkSection);

    function renderCheck() {
      var report = SS.checkStory(story);
      var musts = report.findings.filter(function (f) {
        return f.severity === "must";
      });
      checkSection.innerHTML = "";
      checkSection.appendChild(
        el("div", { class: "row" }, [
          el("h2", { style: "margin:0" }, ["Story check"]),
          el("span", { class: "spacer" }),
          el("span", { class: musts.length ? "tag warn" : "tag good" }, [
            musts.length ? musts.length + " to fix" : "Looks good",
          ]),
        ]),
      );
      checkSection.appendChild(
        el("p", { class: "muted" }, [
          "Story Rating: " +
            (report.storyRating === null
              ? "nothing coaches — that is fine"
              : report.storyRating.toFixed(1) +
                (report.storyRating >= 4
                  ? " (at or above the required 4)"
                  : " (needs 4 or more)")),
        ]),
      );

      if (report.findings.length) {
        var list = el("ul", { style: "padding-left:1.2em" });
        report.findings.forEach(function (f) {
          list.appendChild(
            el("li", { style: "margin-bottom:12px" }, [
              el("strong", {}, [
                (f.severity === "must"
                  ? "Fix"
                  : f.severity === "should"
                    ? "Worth changing"
                    : "Idea") +
                  ": " +
                  f.title,
              ]),
              f.steps && f.steps.length
                ? el("span", { class: "muted" }, [
                    " (step" +
                      (f.steps.length > 1 ? "s " : " ") +
                      f.steps
                        .map(function (i) {
                          return i + 1;
                        })
                        .join(", ") +
                      ")",
                  ])
                : null,
              el("br"),
              el("span", { class: "muted" }, [f.detail]),
            ]),
          );
        });
        checkSection.appendChild(list);
      }

      checkSection.appendChild(
        el("p", { class: "muted", style: "font-size:0.85rem" }, [
          "These follow the Social Stories 10.4 criteria. Passing them does not " +
            "make this a Social Story — gathering information about the " +
            "person, and planning how the story is introduced, are human work " +
            "no checker can see.",
        ]),
      );
    }
    renderCheck();

    view.appendChild(el("h2", {}, ["Steps"]));
    story.steps.forEach(function (step, i) {
      view.appendChild(stepCard(story, step, i, update));
    });

    view.appendChild(
      el(
        "button",
        {
          class: "btn big",
          onclick: function () {
            update(function (d) {
              d.steps.push({ id: uuid(), text: "", media: { kind: "none" } });
            });
            route();
          },
        },
        ["+ Add step"],
      ),
    );
  }

  function stepCard(story, step, i, update) {
    var text = el("textarea", {
      placeholder: "One short sentence, e.g. “I sit in the big chair.”",
    });
    text.value = step.text;
    text.addEventListener("input", function () {
      update(function () {
        step.text = text.value;
      });
    });

    var type = el("select");
    Object.keys(SS.SENTENCE_TYPE_LABELS).forEach(function (k) {
      var opt = el("option", { value: k }, [SS.SENTENCE_TYPE_LABELS[k]]);
      if ((step.sentenceType || SS.classify(step.text)) === k) opt.selected = true;
      type.appendChild(opt);
    });
    type.addEventListener("change", function () {
      update(function () {
        step.sentenceType = type.value;
      });
    });

    var right = el("div", {}, [
      field("Step " + (i + 1) + " — what it says", text),
      field("This sentence…", type),
      el("p", { class: "muted" }, [SS.SENTENCE_TYPE_HELP[step.sentenceType || SS.classify(step.text)]]),
      el("div", { class: "row" }, [
        moveButton("↑ Up", i === 0, function (d) {
          d.steps.splice(i - 1, 0, d.steps.splice(i, 1)[0]);
        }, update),
        moveButton("↓ Down", i === story.steps.length - 1, function (d) {
          d.steps.splice(i + 1, 0, d.steps.splice(i, 1)[0]);
        }, update),
        el(
          "button",
          {
            class: "btn danger",
            disabled: story.steps.length === 1 ? "disabled" : null,
            onclick: function () {
              update(function (d) {
                d.steps.splice(i, 1);
              });
              route();
            },
          },
          ["Delete step"],
        ),
      ]),
    ]);

    return el("section", { class: "card" }, [
      el("div", { class: "step" }, [
        picker(step.media, function (m) {
          update(function () {
            step.media = m;
          });
          route();
        }),
        right,
      ]),
    ]);
  }

  function moveButton(label, disabled, mutate, update) {
    return el(
      "button",
      {
        class: "btn secondary",
        disabled: disabled ? "disabled" : null,
        onclick: function () {
          update(mutate);
          route();
        },
      },
      [label],
    );
  }

  function picker(media, onChange) {
    var url = pictureUrl(media);
    var slot = el("div", { class: "media-slot" }, [
      url
        ? el("img", { alt: media.label || "", src: url })
        : el("span", { class: "muted" }, ["No picture"]),
    ]);

    var results = el("div", { class: "picker-grid" });
    var search = el("input", { type: "text", placeholder: "e.g. brush teeth" });
    search.addEventListener("input", function () {
      results.innerHTML = "";
      var hits = SS.searchBundled(search.value, 60);
      hits.forEach(function (hit) {
        results.appendChild(
          el(
            "button",
            {
              title: hit.label,
              onclick: function () {
                onChange({ kind: "pictogram", id: hit.id, label: hit.label });
              },
            },
            [el("img", { alt: hit.label, src: "../symbols/" + hit.id + ".png" })],
          ),
        );
      });
      if (!hits.length && search.value.trim().length >= 2) {
        results.appendChild(
          el("p", { class: "muted" }, [
            "Nothing in the offline set matches that word.",
          ]),
        );
      }
    });

    var panel = el("div", { class: "card hidden", style: "margin-top:12px" }, [
      field("Search the bundled symbols", search),
      results,
      el("p", { class: "muted" }, [
        "Symbols only here. Photographs of the real people and places work far " +
          "better, and you can add them in the full app.",
      ]),
    ]);

    return el("div", {}, [
      slot,
      el("div", { class: "row", style: "margin-top:10px" }, [
        el(
          "button",
          {
            class: "btn secondary",
            onclick: function () {
              panel.classList.toggle("hidden");
            },
          },
          ["Choose picture"],
        ),
        media && media.kind !== "none"
          ? el(
              "button",
              {
                class: "btn danger",
                onclick: function () {
                  onChange({ kind: "none" });
                },
              },
              ["Remove"],
            )
          : null,
      ]),
      panel,
    ]);
  }

  function textInput(obj, key, update) {
    var input = el("input", { type: "text" });
    input.value = obj[key] || "";
    input.addEventListener("input", function () {
      update(function () {
        obj[key] = input.value;
      });
    });
    return input;
  }

  function selectInput(obj, key, options, update) {
    var select = el("select");
    options.forEach(function (o) {
      var opt = el("option", { value: o[0] }, [o[1]]);
      if (obj[key] === o[0]) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener("change", function () {
      update(function () {
        obj[key] = select.value;
      });
    });
    return select;
  }

  // ----------------------------------------------------------------- player

  function renderPlayer(id) {
    var story = find(id);
    if (!story || story.steps.length === 0) {
      location.hash = "library";
      return;
    }

    topbar.classList.add("hidden");
    view.classList.add("hidden");

    var index = 0;
    var advanceTimer = null;
    var holdTimer = null;

    var root = el("div", {
      class: "player" + (story.display.highContrast ? " contrast" : ""),
    });
    root.style.setProperty("--text-scale", String(story.display.textScale));
    document.body.appendChild(root);

    function exit() {
      clearTimeout(advanceTimer);
      clearInterval(holdTimer);
      if (window.speechSynthesis) speechSynthesis.cancel();
      location.hash = "library";
    }

    function draw() {
      var step = story.steps[index];
      var last = index === story.steps.length - 1;
      root.innerHTML = "";
      root.appendChild(exitControl());

      var url = pictureUrl(step.media);
      root.appendChild(
        el("div", { class: "stage" }, [
          url ? el("img", { alt: step.media.label || "", src: url }) : null,
          el("p", { class: "caption" }, [step.text || story.title]),
        ]),
      );

      var dots = el("div", { class: "progress", "aria-hidden": "true" });
      story.steps.forEach(function (_, i) {
        dots.appendChild(
          el("span", { class: i === index ? "current" : i < index ? "done" : "" }),
        );
      });
      root.appendChild(dots);

      root.appendChild(
        el("div", { class: "controls" }, [
          el(
            "button",
            {
              class: "btn secondary",
              disabled: index === 0 ? "disabled" : null,
              onclick: function () {
                if (index > 0) {
                  index--;
                  draw();
                }
              },
            },
            ["← Back"],
          ),
          el(
            "button",
            {
              class: "btn",
              onclick: function () {
                if (!last) {
                  index++;
                  draw();
                } else if (story.display.lockOpen) {
                  index = 0;
                  draw();
                } else {
                  exit();
                }
              },
            },
            [last ? (story.display.lockOpen ? "Start again" : "Finished") : "Next →"],
          ),
        ]),
      );

      speak(step);

      clearTimeout(advanceTimer);
      if (story.display.autoAdvanceSeconds > 0) {
        advanceTimer = setTimeout(function () {
          index = (index + 1) % story.steps.length;
          draw();
        }, story.display.autoAdvanceSeconds * 1000);
      }
    }

    function speak(step) {
      if (!story.display.readAloud || !window.speechSynthesis) return;
      var phrase = [step.text, step.spoken].filter(Boolean).join(". ").trim();
      if (!phrase) return;
      speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(phrase);
      utter.rate = 0.85;
      speechSynthesis.speak(utter);
    }

    /**
     * When the story is set to stay open, exiting needs a three-second hold, so
     * a single accidental tap cannot close it.
     */
    function exitControl() {
      if (!story.display.lockOpen) {
        return el("button", { class: "hold-exit", onclick: exit }, ["Exit"]);
      }
      var fill = el("span", { class: "fill", style: "width:0%" });
      var button = el("button", { class: "hold-exit" }, ["Hold to exit", fill]);
      var held = 0;

      function start() {
        held = 0;
        clearInterval(holdTimer);
        holdTimer = setInterval(function () {
          held += 100;
          fill.style.width = Math.min(100, (held / 3000) * 100) + "%";
          if (held >= 3000) {
            clearInterval(holdTimer);
            exit();
          }
        }, 100);
      }
      function stop() {
        clearInterval(holdTimer);
        fill.style.width = "0%";
      }

      button.addEventListener("pointerdown", start);
      button.addEventListener("pointerup", stop);
      button.addEventListener("pointerleave", stop);
      button.addEventListener("pointercancel", stop);
      return button;
    }

    draw();
  }

  window.addEventListener("hashchange", route);
  route();
})();
