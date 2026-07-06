/* =====================================================
   app.js — Community Health Access Navigator
   -----------------------------------------------------
   Frontend-only prototype. All "AI" features are
   copyable prompt templates; nothing here calls an API.
   Decision-support only: the tool organizes information
   and flags gaps — trained staff make all decisions.
   ===================================================== */

(function () {
  "use strict";

  var Store = window.CHAN_DATA.Store;
  var cases = Store.load();

  // ---------- tiny helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function fmtDate(iso) {
    if (!iso) return "—";
    var parts = iso.split("-");
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function daysUntil(iso) {
    if (!iso) return null;
    var ms = new Date(iso + "T00:00:00") - new Date(todayStr() + "T00:00:00");
    return Math.round(ms / 86400000);
  }

  var STATUS_LABELS = {
    "new": "New",
    "in-progress": "In progress",
    "waiting": "Waiting on family",
    "referred": "Referred out",
    "closed": "Closed"
  };
  var URGENCY_LABELS = { high: "High urgency", medium: "Medium urgency", low: "Low urgency" };

  function isOpen(c) { return c.status !== "closed"; }

  function saveAndRefresh() {
    Store.save(cases);
    renderDashboard();
    renderCaseList();
    populateAiCaseSelect();
  }

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  // ---------- missing info & next steps (rule-based) ----------
  function missingInfo(c) {
    var gaps = [];
    if (!c.consent) gaps.push("Consent is not confirmed — complete the consent script before making referrals.");
    if (!c.followUpDate && isOpen(c)) gaps.push("No follow-up date is set.");
    if (!c.contactMethod) gaps.push("No contact method recorded.");
    if (!c.notes || c.notes.length === 0) gaps.push("No intake notes recorded.");
    if (!c.needs || c.needs.length === 0) gaps.push("No needs selected.");
    (c.needs || []).forEach(function (need) {
      var hasReferral = (c.referrals || []).some(function (r) { return r.need === need; });
      if (!hasReferral && isOpen(c)) gaps.push('Need "' + need + '" has no referral started yet.');
    });
    if (c.needs && c.needs.indexOf("Other") !== -1) {
      var otherExplained = (c.notes || []).some(function (n) { return /other/i.test(n.text); });
      if (!otherExplained) gaps.push('"Other" need is selected but not explained in the notes.');
    }
    return gaps;
  }

  function nextSteps(c) {
    var steps = [];
    if (!c.consent) steps.push("Re-contact the family to complete the consent conversation before anything else.");
    var due = daysUntil(c.followUpDate);
    if (due !== null && due < 0) steps.push("Follow-up is overdue — reach out via " + (c.contactMethod || "the family's preferred method") + " today.");
    else if (due === 0) steps.push("Follow-up is due today via " + (c.contactMethod || "the family's preferred method") + ".");
    (c.needs || []).forEach(function (need) {
      var r = (c.referrals || []).filter(function (x) { return x.need === need; })[0];
      if (!r) steps.push("Start a referral for " + need + " and record the partner organization.");
      else if (r.status === "Referred") steps.push("Check whether the " + need + " referral to " + r.org + " was received.");
    });
    if (c.language && c.language !== "English") steps.push("Prepare materials and interpretation in " + c.language + " before the next contact.");
    if (c.urgency === "high") steps.push("Bring this case to a coordinator or supervisor for human review at the next check-in.");
    if (steps.length === 0) steps.push("No flagged actions. Review notes at the next scheduled follow-up.");
    return steps;
  }

  function reviewReasons(c) {
    var reasons = [];
    if (!isOpen(c)) return reasons;
    if (c.urgency === "high") reasons.push("High urgency");
    if (!c.consent) reasons.push("Consent not confirmed");
    var due = daysUntil(c.followUpDate);
    if (due !== null && due < 0) reasons.push("Follow-up overdue");
    if ((c.referrals || []).length === 0 && (c.needs || []).length > 0) reasons.push("No referrals started");
    return reasons;
  }

  // ---------- navigation ----------
  function showView(name) {
    $all(".view").forEach(function (v) { v.classList.remove("is-visible"); });
    $("#view-" + name).classList.add("is-visible");
    $all(".nav-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.view === name);
    });
    $("#main").focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  $all(".nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { showView(btn.dataset.view); });
  });
  $all("[data-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () { showView(btn.dataset.goto); });
  });

  // ---------- dashboard ----------
  function renderDashboard() {
    var open = cases.filter(isOpen);
    var followupsDue = open.filter(function (c) {
      var d = daysUntil(c.followUpDate);
      return d !== null && d <= 7;
    });
    var referrals = cases.reduce(function (sum, c) { return sum + (c.referrals || []).length; }, 0);
    var foodCount = cases.filter(function (c) {
      return (c.needs || []).some(function (n) { return n === "CalFresh" || n === "Food distribution"; });
    }).length;
    var coverageCount = cases.filter(function (c) {
      return (c.needs || []).some(function (n) { return n === "Medi-Cal" || n === "Covered California"; });
    }).length;
    var needReview = open.filter(function (c) { return reviewReasons(c).length > 0; });

    var stats = [
      { num: cases.length, lbl: "Families served (all time)", tone: "good" },
      { num: open.length, lbl: "Open cases", tone: "" },
      { num: followupsDue.length, lbl: "Follow-ups due in 7 days", tone: "warn" },
      { num: referrals, lbl: "Referrals made", tone: "good" },
      { num: foodCount, lbl: "Food support requests", tone: "" },
      { num: coverageCount, lbl: "Health coverage requests", tone: "" },
      { num: needReview.length, lbl: "High-priority: needs human review", tone: "alert" }
    ];

    $("#statGrid").innerHTML = stats.map(function (s) {
      return '<div class="stat-card' + (s.tone ? " tone-" + s.tone : "") + '">' +
        '<span class="num">' + s.num + '</span>' +
        '<span class="lbl">' + esc(s.lbl) + '</span></div>';
    }).join("");

    // review list
    var reviewHtml = needReview
      .sort(function (a, b) { return (b.urgency === "high") - (a.urgency === "high"); })
      .map(function (c) {
        return '<li class="review-item"><span>' +
          '<button class="link-btn" data-open-case="' + esc(c.id) + '">' + esc(c.familyName) + '</button>' +
          '<span class="why">' + esc(reviewReasons(c).join(" · ")) + '</span></span>' +
          '<span class="chip chip-' + esc(c.urgency) + '">' + esc(URGENCY_LABELS[c.urgency]) + '</span></li>';
      }).join("");
    $("#reviewList").innerHTML = reviewHtml || '<li class="empty-hint">Nothing is flagged for review right now.</li>';

    // follow-up list
    var fuHtml = followupsDue
      .sort(function (a, b) { return daysUntil(a.followUpDate) - daysUntil(b.followUpDate); })
      .map(function (c) {
        var d = daysUntil(c.followUpDate);
        var dueTxt = d < 0 ? "Overdue by " + Math.abs(d) + (Math.abs(d) === 1 ? " day" : " days")
          : d === 0 ? "Due today" : "Due in " + d + (d === 1 ? " day" : " days");
        return '<li class="followup-item' + (d < 0 ? " is-overdue" : "") + '"><span>' +
          '<button class="link-btn" data-open-case="' + esc(c.id) + '">' + esc(c.familyName) + '</button>' +
          '<span class="why">' + esc((c.needs || []).join(", ")) + '</span></span>' +
          '<span class="due">' + esc(dueTxt) + '</span></li>';
      }).join("");
    $("#followupList").innerHTML = fuHtml || '<li class="empty-hint">No follow-ups due in the next 7 days.</li>';
  }

  // ---------- intake form ----------
  $("#intakeForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    var err = $("#formError");
    err.hidden = true;

    var needs = $all('input[name="needs"]:checked', f).map(function (i) { return i.value; });
    var problems = [];
    if (!f.familyName.value.trim()) problems.push("family name or case ID");
    if (!f.language.value) problems.push("preferred language");
    if (!f.householdSize.value) problems.push("household size");
    if (!f.contactMethod.value) problems.push("contact method");
    if (needs.length === 0) problems.push("at least one need");
    if (!f.urgency.value) problems.push("urgency level");
    if (!f.consent.checked) problems.push("the consent checkbox");

    if (problems.length) {
      err.textContent = "Before saving, please complete: " + problems.join(", ") + ".";
      err.hidden = false;
      return;
    }

    var id = "CASE-" + String(cases.length + 1).padStart(3, "0") + "-" + Date.now().toString(36).slice(-4).toUpperCase();
    var newCase = {
      id: id,
      familyName: f.familyName.value.trim(),
      language: f.language.value,
      householdSize: Number(f.householdSize.value),
      contactMethod: f.contactMethod.value,
      needs: needs,
      urgency: f.urgency.value,
      status: "new",
      consent: true,
      followUpDate: f.followUpDate.value || "",
      createdAt: todayStr(),
      referrals: [],
      notes: f.notes.value.trim()
        ? [{ date: todayStr(), author: "Staff", text: f.notes.value.trim() }]
        : []
    };
    cases.unshift(newCase);
    saveAndRefresh();
    f.reset();
    toast("Intake saved as " + newCase.id);
    showView("cases");
    openDrawer(newCase.id);
  });

  // ---------- case list ----------
  function filteredCases() {
    var q = $("#searchInput").value.trim().toLowerCase();
    var st = $("#filterStatus").value;
    var need = $("#filterNeed").value;
    var urg = $("#filterUrgency").value;

    return cases.filter(function (c) {
      if (st && c.status !== st) return false;
      if (need && (c.needs || []).indexOf(need) === -1) return false;
      if (urg && c.urgency !== urg) return false;
      if (q) {
        var hay = (c.familyName + " " + c.id + " " + (c.notes || []).map(function (n) { return n.text; }).join(" ")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderCaseList() {
    var list = filteredCases();
    $("#resultCount").textContent = list.length === 1 ? "1 case" : list.length + " cases";
    $("#caseList").innerHTML = list.map(function (c) {
      var gaps = missingInfo(c).length;
      return '<li><article class="case-card">' +
        '<div>' +
          '<span class="case-name">' + esc(c.familyName) + '</span>' +
          '<div class="meta">' + esc(c.id) + ' · Household of ' + esc(c.householdSize) + ' · ' + esc(c.language) + ' · Opened ' + esc(fmtDate(c.createdAt)) + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost btn-small" data-open-case="' + esc(c.id) + '">Open case</button>' +
        '<div class="chips">' +
          '<span class="chip chip-status' + (c.status === "closed" ? " closed" : "") + '">' + esc(STATUS_LABELS[c.status]) + '</span>' +
          '<span class="chip chip-' + esc(c.urgency) + '">' + esc(URGENCY_LABELS[c.urgency]) + '</span>' +
          (c.needs || []).map(function (n) { return '<span class="chip chip-need">' + esc(n) + '</span>'; }).join("") +
          (gaps ? '<span class="chip chip-missing">' + gaps + ' missing item' + (gaps === 1 ? "" : "s") + '</span>' : "") +
        '</div>' +
      '</article></li>';
    }).join("") || '<li class="empty-hint">No cases match these filters. Try clearing a filter, or add a new intake.</li>';
  }

  ["searchInput", "filterStatus", "filterNeed", "filterUrgency"].forEach(function (id) {
    $("#" + id).addEventListener("input", renderCaseList);
  });

  // ---------- case detail drawer ----------
  var lastFocused = null;

  function openDrawer(caseId) {
    var c = cases.filter(function (x) { return x.id === caseId; })[0];
    if (!c) return;
    lastFocused = document.activeElement;

    var gaps = missingInfo(c);
    var steps = nextSteps(c);

    var referralRows = (c.needs || []).map(function (need) {
      var r = (c.referrals || []).filter(function (x) { return x.need === need; })[0];
      return '<li><span><strong>' + esc(need) + '</strong>' +
        (r ? ' — ' + esc(r.org) : "") + '</span>' +
        '<span class="chip ' + (r ? "chip-status" : "chip-missing") + '">' + esc(r ? r.status : "No referral yet") + '</span></li>';
    }).join("");

    var timeline = (c.notes || []).slice().reverse().map(function (n) {
      return '<li><span class="t-date">' + esc(fmtDate(n.date)) + ' · ' + esc(n.author) + '</span>' + esc(n.text) + '</li>';
    }).join("") || '<li class="empty-hint">No notes yet.</li>';

    $("#drawerContent").innerHTML =
      '<div class="drawer-head">' +
        '<div><h2 id="drawerTitle">' + esc(c.familyName) + '</h2>' +
        '<p class="report-meta">' + esc(c.id) + ' · Opened ' + esc(fmtDate(c.createdAt)) + '</p></div>' +
        '<button class="btn btn-ghost btn-small" id="drawerClose">Close</button>' +
      '</div>' +

      '<div class="drawer-section"><h3>Family profile</h3>' +
        '<dl class="kv">' +
          '<dt>Preferred language</dt><dd>' + esc(c.language) + '</dd>' +
          '<dt>Household size</dt><dd>' + esc(c.householdSize) + '</dd>' +
          '<dt>Contact method</dt><dd>' + esc(c.contactMethod || "—") + '</dd>' +
          '<dt>Consent on file</dt><dd>' + (c.consent ? "Yes" : '<strong style="color:var(--signal)">Not confirmed</strong>') + '</dd>' +
          '<dt>Urgency</dt><dd><span class="chip chip-' + esc(c.urgency) + '">' + esc(URGENCY_LABELS[c.urgency]) + '</span></dd>' +
        '</dl></div>' +

      '<div class="drawer-section"><h3>Status &amp; follow-up</h3>' +
        '<div class="drawer-controls">' +
          '<div class="field"><label for="dStatus">Case status</label>' +
            '<select id="dStatus">' + Object.keys(STATUS_LABELS).map(function (k) {
              return '<option value="' + k + '"' + (c.status === k ? " selected" : "") + '>' + STATUS_LABELS[k] + '</option>';
            }).join("") + '</select></div>' +
          '<div class="field"><label for="dFollowUp">Next follow-up date</label>' +
            '<input type="date" id="dFollowUp" value="' + esc(c.followUpDate) + '" /></div>' +
        '</div></div>' +

      '<div class="drawer-section"><h3>Needs &amp; referral status</h3>' +
        '<ul class="needs-checklist">' + referralRows + '</ul></div>' +

      '<div class="drawer-section"><h3>Missing information</h3>' +
        (gaps.length
          ? '<div class="missing-box"><strong>' + gaps.length + ' item' + (gaps.length === 1 ? "" : "s") + ' to complete:</strong><ul>' +
            gaps.map(function (g) { return "<li>" + esc(g) + "</li>"; }).join("") + '</ul></div>'
          : '<p class="empty-hint">No gaps detected by the checklist rules. Staff should still verify.</p>') +
      '</div>' +

      '<div class="drawer-section"><h3>Suggested next steps (for staff review)</h3>' +
        '<div class="nextsteps-box"><ol>' + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ol></div></div>' +

      '<div class="drawer-section"><h3>Notes timeline</h3>' +
        '<ul class="timeline">' + timeline + '</ul>' +
        '<div class="note-add">' +
          '<label for="dNote" class="report-meta">Add a note (newest appears first)</label>' +
          '<textarea id="dNote" rows="3" placeholder="What happened, what was agreed, what comes next…"></textarea>' +
          '<button class="btn btn-primary btn-small" id="dAddNote">Add note</button>' +
        '</div></div>' +

      '<p class="review-reminder">⚑ Reminder: these checklists and suggestions are decision support, not decisions. ' +
      'A trained staff member reviews every case and makes all eligibility and service determinations.</p>';

    $("#caseDrawer").hidden = false;
    $("#drawerBackdrop").hidden = false;
    document.body.style.overflow = "hidden";
    $("#drawerClose").focus();

    // drawer event wiring
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#dStatus").addEventListener("change", function (e) {
      c.status = e.target.value;
      saveAndRefresh();
      toast("Status updated to “" + STATUS_LABELS[c.status] + "”");
    });
    $("#dFollowUp").addEventListener("change", function (e) {
      c.followUpDate = e.target.value;
      saveAndRefresh();
      toast("Follow-up date updated");
    });
    $("#dAddNote").addEventListener("click", function () {
      var txt = $("#dNote").value.trim();
      if (!txt) { toast("Write a note first"); return; }
      c.notes.push({ date: todayStr(), author: "Staff", text: txt });
      saveAndRefresh();
      openDrawer(c.id); // re-render drawer with new note
      toast("Note added");
    });
  }

  function closeDrawer() {
    $("#caseDrawer").hidden = true;
    $("#drawerBackdrop").hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  $("#drawerBackdrop").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !$("#caseDrawer").hidden) closeDrawer();
  });

  // open-case buttons anywhere in the app (event delegation)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-open-case]");
    if (btn) openDrawer(btn.getAttribute("data-open-case"));
  });

  // ---------- weekly report ----------
  var lastReportText = "";

  function buildReport() {
    var open = cases.filter(isOpen);
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    var newThisWeek = cases.filter(function (c) { return new Date(c.createdAt + "T00:00:00") >= weekAgo; });

    var needCounts = {};
    cases.forEach(function (c) {
      (c.needs || []).forEach(function (n) { needCounts[n] = (needCounts[n] || 0) + 1; });
    });
    var topNeeds = Object.keys(needCounts)
      .sort(function (a, b) { return needCounts[b] - needCounts[a]; })
      .slice(0, 4)
      .map(function (n) { return n + " (" + needCounts[n] + ")"; });

    var followupsDue = open.filter(function (c) {
      var d = daysUntil(c.followUpDate);
      return d !== null && d <= 7;
    });
    var overdue = open.filter(function (c) {
      var d = daysUntil(c.followUpDate);
      return d !== null && d < 0;
    });
    var referrals = cases.reduce(function (s, c) { return s + (c.referrals || []).length; }, 0);
    var needReview = open.filter(function (c) { return reviewReasons(c).length > 0; });
    var noConsent = open.filter(function (c) { return !c.consent; });
    var nonEnglish = open.filter(function (c) { return c.language !== "English"; });

    var improvements = [];
    if (overdue.length) improvements.push(overdue.length + " follow-up(s) are overdue — consider a standing 15-minute morning check of the follow-up list.");
    if (noConsent.length) improvements.push(noConsent.length + " open case(s) lack confirmed consent — review the consent script step in intake training.");
    var unreferredHigh = open.filter(function (c) { return c.urgency === "high" && (c.referrals || []).length === 0; });
    if (unreferredHigh.length) improvements.push(unreferredHigh.length + " high-urgency case(s) have no referrals started — prioritize these in the next team huddle.");
    if (nonEnglish.length) improvements.push(nonEnglish.length + " open case(s) prefer a language other than English — confirm interpreter and translated-materials coverage for the week.");
    if (!improvements.length) improvements.push("No process gaps flagged this week by the checklist rules.");

    var lines = [];
    lines.push("WEEKLY IMPACT REPORT — Community Health Access Navigator (demo data)");
    lines.push("Week ending " + fmtDate(todayStr()));
    lines.push("");
    lines.push("FAMILIES SERVED");
    lines.push("- Total families in system: " + cases.length);
    lines.push("- New intakes this week: " + newThisWeek.length);
    lines.push("- Open cases: " + open.length);
    lines.push("");
    lines.push("MOST COMMON NEEDS");
    topNeeds.forEach(function (n) { lines.push("- " + n); });
    lines.push("");
    lines.push("FOLLOW-UPS & REFERRALS");
    lines.push("- Follow-ups due within 7 days: " + followupsDue.length + (overdue.length ? " (" + overdue.length + " overdue)" : ""));
    lines.push("- Total referrals made: " + referrals);
    lines.push("");
    lines.push("CASES NEEDING HUMAN REVIEW: " + needReview.length);
    needReview.forEach(function (c) {
      lines.push("- " + c.familyName + " (" + c.id + "): " + reviewReasons(c).join(", "));
    });
    lines.push("");
    lines.push("SUGGESTED OPERATIONAL IMPROVEMENTS (for team discussion)");
    improvements.forEach(function (i) { lines.push("- " + i); });
    lines.push("");
    lines.push("Note: This report is generated from case data as decision support. Program staff verify all figures before external sharing.");

    lastReportText = lines.join("\n");

    // render as HTML
    $("#reportOutput").innerHTML =
      '<p class="report-meta">Generated ' + esc(new Date().toLocaleString()) + ' · Demo data only</p>' +
      '<h2>Families served</h2><ul>' +
        '<li>Total families in system: <strong>' + cases.length + '</strong></li>' +
        '<li>New intakes this week: <strong>' + newThisWeek.length + '</strong></li>' +
        '<li>Open cases: <strong>' + open.length + '</strong></li></ul>' +
      '<h2>Most common needs</h2><ul>' + topNeeds.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + '</ul>' +
      '<h2>Follow-ups &amp; referrals</h2><ul>' +
        '<li>Follow-ups due within 7 days: <strong>' + followupsDue.length + '</strong>' + (overdue.length ? ' <span class="chip chip-high">' + overdue.length + ' overdue</span>' : '') + '</li>' +
        '<li>Total referrals made: <strong>' + referrals + '</strong></li></ul>' +
      '<h2>Cases needing human review (' + needReview.length + ')</h2><ul>' +
        (needReview.map(function (c) {
          return '<li><button class="link-btn" data-open-case="' + esc(c.id) + '">' + esc(c.familyName) + '</button> — ' + esc(reviewReasons(c).join(", ")) + '</li>';
        }).join("") || "<li>None flagged.</li>") + '</ul>' +
      '<h2>Suggested operational improvements</h2><ul>' +
        improvements.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + '</ul>' +
      '<p class="report-meta">This report is decision support. Staff verify all figures before sharing externally.</p>';

    $("#copyReportBtn").hidden = false;
  }

  $("#generateReportBtn").addEventListener("click", buildReport);
  $("#copyReportBtn").addEventListener("click", function () {
    copyText(lastReportText, "Report copied — paste it into an email or doc");
  });

  // ---------- AI assistant (prompt templates, no API) ----------
  function caseContext(c) {
    if (!c) return "[Paste de-identified case details here: needs, urgency, language, key dates, and recent notes. Do not include names, addresses, phone numbers, or ID numbers.]";
    return "Case " + c.id + " (" + c.familyName + ")\n" +
      "- Preferred language: " + c.language + "\n" +
      "- Household size: " + c.householdSize + "\n" +
      "- Needs: " + (c.needs || []).join(", ") + "\n" +
      "- Urgency: " + c.urgency + " | Status: " + STATUS_LABELS[c.status] + "\n" +
      "- Follow-up date: " + (c.followUpDate || "not set") + "\n" +
      "- Notes:\n" + (c.notes || []).map(function (n) { return "  " + n.date + ": " + n.text; }).join("\n");
  }

  var PROMPTS = [
    {
      title: "Summarize intake notes",
      use: "Turn long notes into a short, factual summary for the case file.",
      build: function (ctx) {
        return "You are helping a community health worker. Summarize the following de-identified intake notes in 4–5 plain sentences. Include: main needs, urgency, preferred language, and any deadlines. Do not guess at anything not stated, and do not make any eligibility judgments.\n\n" + ctx;
      }
    },
    {
      title: "Identify missing information",
      use: "Spot gaps before the next family contact.",
      build: function (ctx) {
        return "Review this de-identified community health case and list what information appears to be missing or unclear before staff can move it forward (for example: consent, documents, referral details, follow-up date). Phrase each item as a question staff could ask the family. Do not make eligibility determinations.\n\n" + ctx;
      }
    },
    {
      title: "Draft follow-up message",
      use: "A warm, plain-language check-in the family can actually read.",
      build: function (ctx) {
        return "Draft a short, warm follow-up message (under 100 words) from a community health worker to a family, at about a 6th-grade reading level. Confirm the next step, offer help, and invite questions. Do not promise approval of any benefit. Then provide the same message translated into the family's preferred language shown below, and note that a bilingual staff member should verify the translation before sending.\n\n" + ctx;
      }
    },
    {
      title: "Prepare weekly impact report narrative",
      use: "Turn this week's numbers into 2 short paragraphs for funders or leadership.",
      build: function () {
        return "Using the weekly statistics below, write a 2-paragraph impact update for a nonprofit newsletter or funder email. Keep it factual and warm, avoid jargon, and do not invent numbers or outcomes not shown.\n\n[Paste the generated weekly report text here]";
      }
    },
    {
      title: "Translate an eligibility explanation into simple language",
      use: "Explain a program rule without jargon — not a decision about this family.",
      build: function (ctx) {
        return "Rewrite the following program information in plain language at a 6th-grade reading level, in English and in the family's preferred language shown below. Important: explain the general rules only. Do not state or imply whether this specific family qualifies — a trained staff member makes that determination.\n\n[Paste the official program description or notice text here]\n\n" + ctx;
      }
    },
    {
      title: "Create a staff checklist",
      use: "Turn a case into a step-by-step to-do list for the assigned worker.",
      build: function (ctx) {
        return "Based on this de-identified case, create a short numbered checklist of concrete next actions for the assigned community health worker, ordered by priority. Every item that involves an eligibility or service decision should say 'for staff/supervisor review' rather than a conclusion.\n\n" + ctx;
      }
    },
    {
      title: "Review AI output for risk",
      use: "Quality-check any AI draft before it touches a case file or reaches a family.",
      build: function (ctx) {
        return "You are helping a community health worker quality-check a draft that an AI tool produced. Compare the draft against the case record below and flag, quoting the exact wording each time: (1) any fact or detail that does not appear in the case record and may be invented, (2) any statement that makes or implies an eligibility or service decision, or promises an outcome, (3) any name, contact detail, ID number, or other identifying or sensitive information, and (4) any place where the tone sounds more confident or certain than the underlying information supports. Finish with a short list of questions the staff member should resolve before using the draft. Do not rewrite the draft — the staff member makes the corrections and the final judgment.\n\nAI DRAFT TO REVIEW:\n[Paste the AI draft here]\n\nCASE RECORD FOR COMPARISON:\n" + ctx;
      }
    }
  ];

  function populateAiCaseSelect() {
    var sel = $("#aiCaseSelect");
    var current = sel.value;
    sel.innerHTML = '<option value="">No case selected — use blank template</option>' +
      cases.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.familyName) + ' (' + esc(c.id) + ')</option>';
      }).join("");
    sel.value = current;
  }

  function renderPrompts() {
    var selId = $("#aiCaseSelect").value;
    var c = cases.filter(function (x) { return x.id === selId; })[0] || null;
    var ctx = caseContext(c);

    $("#promptGrid").innerHTML = PROMPTS.map(function (p, i) {
      return '<article class="prompt-card">' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p class="use">' + esc(p.use) + '</p>' +
        '<pre id="prompt-' + i + '">' + esc(p.build(ctx)) + '</pre>' +
        '<button class="btn btn-primary btn-small" data-copy-prompt="' + i + '">Copy prompt</button>' +
      '</article>';
    }).join("");
  }

  $("#aiCaseSelect").addEventListener("change", renderPrompts);
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-prompt]");
    if (!btn) return;
    var pre = $("#prompt-" + btn.getAttribute("data-copy-prompt"));
    copyText(pre.textContent, "Prompt copied — paste it into Claude");
  });

  function copyText(text, okMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast(okMsg); },
        function () { fallbackCopy(text, okMsg); });
    } else {
      fallbackCopy(text, okMsg);
    }
  }
  function fallbackCopy(text, okMsg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast(okMsg); }
    catch (e) { toast("Copy failed — select the text and copy manually"); }
    document.body.removeChild(ta);
  }

  // ---------- staff guide ----------
  var GUIDE = [
    {
      title: "How to use this tool day to day",
      items: [
        "Start each shift on the <strong>Dashboard</strong>: check “Needs human review” first, then “Follow-ups due soon.”",
        "Record every new request through <strong>New family intake</strong> — one case per family, even for quick questions.",
        "After every contact with a family, add a note in the case drawer so the next staff member can pick up where you left off.",
        "Update the status and follow-up date before closing the case drawer.",
        "Generate the <strong>Weekly impact report</strong> every Friday and review it as a team before sharing."
      ]
    },
    {
      title: "What NOT to enter in this tool",
      items: [
        "Full legal names — use initials or a case ID (e.g., “R. Family” or “CASE-014”).",
        "Addresses, phone numbers, or email addresses.",
        "Social Security numbers, immigration status details, or ID numbers of any kind.",
        "Medical diagnoses or records — note “health coverage question,” not conditions.",
        "Anything the family asked you not to write down.",
        "This demo stores data in the browser only. Real client data belongs in your organization's approved, access-controlled system."
      ]
    },
    {
      title: "Privacy & consent guidelines",
      items: [
        "Read the consent script with the family before recording anything; check the consent box only after they agree.",
        "If consent wasn't completed, the tool flags it — resolve it before making any referral.",
        "Only share case information with partners named in the consent conversation.",
        "Families can ask to see, correct, or delete their information at any time — route requests to the program coordinator.",
        "When using the AI prompt templates, copy only de-identified details. Never paste names or contact information into an AI tool."
      ]
    },
    {
      title: "Training a new staff member or volunteer",
      items: [
        "Day 1: Tour the Dashboard and Case list together; open two closed cases and read the notes timelines aloud.",
        "Day 2: Have them shadow one real intake, then enter a practice intake in this demo with fictional details.",
        "Day 3: Have them draft a follow-up note and next steps for a practice case; a coordinator reviews before anything is sent.",
        "Week 2: Introduce the AI assistant panel — practice the “summarize notes” prompt with demo data and discuss what to check in the output.",
        "Always pair new staff with an experienced reviewer for their first five cases."
      ]
    },
    {
      title: "Maintaining the workflow",
      items: [
        "Weekly: clear overdue follow-ups, confirm every high-urgency case was reviewed by a coordinator.",
        "Monthly: review the “Suggested operational improvements” from the last four weekly reports and pick one to act on.",
        "Quarterly: prune closed cases per your organization's retention policy, and re-check that the needs list still matches the programs you offer.",
        "Keep this guide updated — if a step changes, change it here the same week.",
        "When ready for multi-user access, connect a backend (see README: Firebase notes) instead of sharing a single browser."
      ]
    },
    {
      title: "The role of AI in this workflow",
      items: [
        "AI helps with <strong>words and organization</strong>: summaries, drafts, checklists, plain-language rewrites.",
        "AI does <strong>not</strong> decide eligibility, prioritize families on its own, or replace a conversation with the family.",
        "Staff read and edit every AI draft before it is saved or sent — treat drafts like a first draft from a new volunteer.",
        "Bilingual staff verify all translations before they reach a family.",
        "If an AI output seems to make a judgment about a family, discard it and bring the case to a supervisor."
      ]
    }
  ];

  function renderGuide() {
    $("#guideContent").innerHTML = GUIDE.map(function (g) {
      return '<div class="panel guide-card"><h2>' + g.title + '</h2><ul>' +
        g.items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + '</ul></div>';
    }).join("");
  }

  // ---------- reset ----------
  $("#resetDemoBtn").addEventListener("click", function () {
    if (window.confirm("Reset all cases back to the original demo data? Anything you added will be removed.")) {
      cases = Store.reset();
      saveAndRefresh();
      renderPrompts();
      toast("Demo data has been reset");
      showView("dashboard");
    }
  });

  // ---------- init ----------
  renderDashboard();
  renderCaseList();
  populateAiCaseSelect();
  renderPrompts();
  renderGuide();
})();
