/* =====================================================
   data.js — demo data + storage layer
   -----------------------------------------------------
   All family data here is FICTIONAL and de-identified.
   The Store object is the only thing that touches
   persistence. To connect Firebase later, replace the
   bodies of Store.load / Store.save with Firestore
   reads/writes — the rest of the app won't change.
   ===================================================== */

(function (global) {
  "use strict";

  var STORAGE_KEY = "chan_cases_v1";

  // --- date helpers: demo dates are relative to "today"
  // so follow-ups always look current in a portfolio demo.
  function daysFromNow(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  function seedCases() {
    return [
      {
        id: "CASE-001",
        familyName: "R. Family",
        language: "Spanish",
        householdSize: 5,
        contactMethod: "Phone call",
        needs: ["Medi-Cal", "CalFresh", "Food distribution"],
        urgency: "high",
        status: "in-progress",
        consent: true,
        followUpDate: daysFromNow(1),
        createdAt: daysFromNow(-9),
        referrals: [
          { need: "Medi-Cal", org: "County HHSA eligibility office", status: "Referred" },
          { need: "Food distribution", org: "Saturday pantry site", status: "Completed" }
        ],
        notes: [
          { date: daysFromNow(-9), author: "A. Hassan", text: "Walk-in intake. Household of 5, two children under 10. Medi-Cal coverage lapsed last month after a missed renewal packet. Family relies on weekly pantry." },
          { date: daysFromNow(-4), author: "A. Hassan", text: "Called family — they found the renewal packet. Explained which documents to gather. They prefer Spanish for all written materials." }
        ]
      },
      {
        id: "CASE-002",
        familyName: "K. Family",
        language: "English",
        householdSize: 2,
        contactMethod: "Text message",
        needs: ["Covered California"],
        urgency: "medium",
        status: "waiting",
        consent: true,
        followUpDate: daysFromNow(3),
        createdAt: daysFromNow(-12),
        referrals: [
          { need: "Covered California", org: "Certified enrollment counselor (partner org)", status: "Referred" }
        ],
        notes: [
          { date: daysFromNow(-12), author: "J. Lee", text: "Lost employer coverage after job change. Interested in Covered California plans. Sent list of documents to bring." },
          { date: daysFromNow(-5), author: "J. Lee", text: "Texted a reminder. Waiting for the family to confirm an appointment time with the enrollment counselor." }
        ]
      },
      {
        id: "CASE-003",
        familyName: "M. Family",
        language: "Arabic",
        householdSize: 6,
        contactMethod: "WhatsApp",
        needs: ["CalFresh", "Transportation", "Caregiver support"],
        urgency: "high",
        status: "new",
        consent: true,
        followUpDate: daysFromNow(0),
        createdAt: daysFromNow(-2),
        referrals: [],
        notes: [
          { date: daysFromNow(-2), author: "A. Hassan", text: "Referred by mosque community liaison. Grandmother is primary caregiver for four grandchildren and needs respite support. No car; nearest CalFresh office requires two buses. Prefers Arabic." }
        ]
      },
      {
        id: "CASE-004",
        familyName: "T. Family",
        language: "English",
        householdSize: 3,
        contactMethod: "Email",
        needs: ["Food distribution"],
        urgency: "low",
        status: "closed",
        consent: true,
        followUpDate: "",
        createdAt: daysFromNow(-20),
        referrals: [
          { need: "Food distribution", org: "Tuesday produce distribution", status: "Completed" }
        ],
        notes: [
          { date: daysFromNow(-20), author: "J. Lee", text: "One-time request for produce distribution info. Sent schedule and location." },
          { date: daysFromNow(-14), author: "J. Lee", text: "Family attended distribution and confirmed no other needs right now. Closing case; they know how to reach us." }
        ]
      },
      {
        id: "CASE-005",
        familyName: "S. Family",
        language: "Punjabi",
        householdSize: 4,
        contactMethod: "Phone call",
        needs: ["Medi-Cal", "Housing referral"],
        urgency: "medium",
        status: "in-progress",
        consent: false,
        followUpDate: daysFromNow(5),
        createdAt: daysFromNow(-6),
        referrals: [
          { need: "Housing referral", org: "2-1-1 housing resource line", status: "Not started" }
        ],
        notes: [
          { date: daysFromNow(-6), author: "R. Gonzalez", text: "Phone intake with help from a Punjabi-speaking volunteer. Rent burden is high; family asked about housing programs and whether the children qualify for Medi-Cal. Need to re-confirm consent — call dropped before we finished the consent script." }
        ]
      },
      {
        id: "CASE-006",
        familyName: "D. Family",
        language: "English",
        householdSize: 1,
        contactMethod: "In person / walk-in",
        needs: ["CalFresh", "Transportation"],
        urgency: "medium",
        status: "referred",
        consent: true,
        followUpDate: daysFromNow(-2),
        createdAt: daysFromNow(-15),
        referrals: [
          { need: "CalFresh", org: "County CalFresh application desk", status: "Referred" },
          { need: "Transportation", org: "Paratransit application", status: "Referred" }
        ],
        notes: [
          { date: daysFromNow(-15), author: "R. Gonzalez", text: "Older adult living alone; recently stopped driving. Helped start CalFresh application and paratransit paperwork." },
          { date: daysFromNow(-8), author: "R. Gonzalez", text: "County requested one more income document. Left voicemail explaining what to bring." }
        ]
      },
      {
        id: "CASE-007",
        familyName: "B. Family",
        language: "Farsi/Dari",
        householdSize: 7,
        contactMethod: "Through partner organization",
        needs: ["Medi-Cal", "CalFresh", "Food distribution", "Other"],
        urgency: "high",
        status: "new",
        consent: true,
        followUpDate: daysFromNow(2),
        createdAt: daysFromNow(-1),
        referrals: [],
        notes: [
          { date: daysFromNow(-1), author: "J. Lee", text: "Newly arrived family referred by resettlement partner. Needs full benefits screening. 'Other' = school enrollment questions for three children. Interpreter needed for all calls." }
        ]
      },
      {
        id: "CASE-008",
        familyName: "CASE-008 (name withheld)",
        language: "English",
        householdSize: 2,
        contactMethod: "Phone call",
        needs: ["Caregiver support"],
        urgency: "low",
        status: "in-progress",
        consent: true,
        followUpDate: daysFromNow(10),
        createdAt: daysFromNow(-11),
        referrals: [
          { need: "Caregiver support", org: "Caregiver resource center", status: "Confirmed" }
        ],
        notes: [
          { date: daysFromNow(-11), author: "A. Hassan", text: "Caring for spouse after hospital discharge. Connected to caregiver resource center; first support group session scheduled." }
        ]
      }
    ];
  }

  // --- Storage adapter -------------------------------
  // Uses localStorage when available; falls back to an
  // in-memory copy so the demo still works in previews
  // or browsers where storage is blocked.
  var memoryStore = null;

  function storageAvailable() {
    try {
      var t = "__chan_test__";
      global.localStorage.setItem(t, "1");
      global.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  var Store = {
    load: function () {
      if (storageAvailable()) {
        try {
          var raw = global.localStorage.getItem(STORAGE_KEY);
          if (raw) return JSON.parse(raw);
        } catch (e) { /* fall through to seed */ }
      } else if (memoryStore) {
        return memoryStore;
      }
      var seeded = seedCases();
      Store.save(seeded);
      return seeded;
    },
    save: function (cases) {
      memoryStore = cases;
      if (storageAvailable()) {
        try {
          global.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
        } catch (e) { /* memory copy still works */ }
      }
      // FIREBASE HOOK: replace/augment with a Firestore
      // write, e.g. setDoc(doc(db, "cases", c.id), c)
    },
    reset: function () {
      memoryStore = null;
      if (storageAvailable()) {
        try { global.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      }
      return Store.load();
    }
  };

  global.CHAN_DATA = { Store: Store, seedCases: seedCases, daysFromNow: daysFromNow };
})(window);
