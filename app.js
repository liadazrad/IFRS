const statusLabel = document.getElementById("status-label");
const statusCount = document.getElementById("status-count");
const statusValue = document.getElementById("status-value");
const statusNote = document.getElementById("status-note");
const tabButtons = [...document.querySelectorAll(".tab-button")];
const tabPanels = [...document.querySelectorAll(".tab-panel")];
const latestGrid = document.getElementById("latest-grid");
const latestTemplate = document.getElementById("latest-template");
const browserTemplate = document.getElementById("decision-template");
const globalSearch = document.getElementById("global-search");
const homeSummary = document.getElementById("home-summary");

let activeTab = "home";
let ifricDecisions = [];
let esmaDecisions = [];
let allItems = [];
let browsers = {};
let datasets = {};

const ifricPhraseMap = [
  ["Definition of a Lease", "הגדרת חכירה"],
  ["Substitution Rights", "זכויות החלפה"],
  ["Decision-making Rights", "זכויות קבלת החלטות"],
  ["Recognition of Revenue", "הכרה בהכנסה"],
  ["Revenue from Tuition Fees", "הכנסות משכר לימוד"],
  ["Recognition of Intangible Assets", "הכרה בנכסים בלתי מוחשיים"],
  ["Climate-related Expenditure", "הוצאות אקלים"],
  ["Climate-related Commitments", "התחייבויות אקלים"],
  ["Premiums Receivable from an Intermediary", "פרמיות לקבל ממתווך"],
  ["Homes and Home Loans Provided to Employees", "דיור והלוואות לעובדים"],
  ["Guarantee over a Derivative Contract", "ערבות על חוזה נגזר"],
  ["Guarantees Issued on Obligations of Other Entities", "ערבויות על התחייבויות של אחרים"],
  ["Disclosure of Revenues and Expenses for Reportable Segments", "גילוי הכנסות והוצאות למגזרים"],
  ["Payments Contingent on Continued Employment during Handover Periods", "תשלומים תלויי המשך העסקה"],
  ["Merger between a Parent and Its Subsidiary in Separate Financial Statements", "מיזוג בין אם לבת בדוחות נפרדים"],
  ["Preparation of Financial Statements when an Entity is No Longer a Going Concern", "דוחות כספיים כשאין עסק חי"],
  ["Supply Chain Financing Arrangements- Reverse Factoring", "מימון שרשרת אספקה - פקטורינג הפוך"],
  ["Supply Chain Financing Arrangements-Reverse Factoring", "מימון שרשרת אספקה - פקטורינג הפוך"],
  ["Configuration or Customisation Costs in a Cloud Computing Arrangement", "עלויות התאמה במחשוב ענן"],
  ["Sale and Leaseback with Variable Payments", "מכירה וחכירה חוזרת עם תשלומים משתנים"],
  ["Player Transfer Payments", "תשלומי העברת שחקנים"],
  ["Training Costs to Fulfil a Contract", "עלויות הדרכה לקיום חוזה"],
  ["Holdings of Cryptocurrencies", "החזקות בקריפטו"],
  ["Lessee's Incremental Borrowing Rate", "שיעור ההלוואה השולי של חוכר"],
  ["Compensation for Delays or Cancellations", "פיצוי בגין עיכובים או ביטולים"],
  ["Subsurface Rights", "זכויות תת-קרקעיות"],
  ["Costs to Fulfil a Contract", "עלויות לקיום חוזה"],
  ["Assessment of promised goods or services", "בחינת סחורות או שירותים שהובטחו"],
  ["Special Purpose Acquisition Companies", "חברות SPAC"],
  ["Lessor Forgiveness of Lease Payments", "ויתור מחכיר על תשלומי חכירה"],
  ["Multi-currency Groups of Insurance Contracts", "קבוצות חוזי ביטוח רב-מטבעיות"],
  ["Transfer of Insurance Coverage under a Group of Annuity Contracts", "העברת כיסוי ביטוחי בחוזי אנונה"],
  ["Principal versus Agent: Software Reseller", "עיקרי מול סוכן - משווק תוכנה"],
  ["Demand Deposits with Restrictions on Use arising from a Contract with a Third Party", "פיקדונות עם הגבלות שימוש"],
  ["TLTRO III Transactions", "עסקאות TLTRO III"],
  ["Economic Benefits from Use of a Windfarm", "הטבות כלכליות משימוש בחוות רוח"],
  ["Attributing Benefit to Periods of Service", "שיוך הטבה לתקופות שירות"],
  ["Costs Necessary to Sell Inventories", "עלויות הנחוצות למכירת מלאי"],
  ["Non-refundable Value Added Tax on Lease Payments", "מע״מ שאינו בר-החזר על חכירה"],
  ["Accounting for Warrants that are Classified as Financial Liabilities on Initial Recognition", "כתבי אופציה כהתחייבויות פיננסיות"],
  ["Multiple Tax Consequences of Recovering an Asset", "כמה השלכות מס בעת מימוש נכס"],
  ["Deferred Tax related to an Investment in a Subsidiary", "מס נדחה על השקעה בבת"],
  ["Translation of a Hyperinflationary Foreign Operation", "תרגום פעילות חוץ היפר-אינפלציונית"],
  ["Cumulative Exchange Differences before a Foreign Operation becomes Hyperinflationary", "הפרשי שער מצטברים לפני היפר-אינפלציה"],
  ["Presenting Comparative Amounts when a Foreign Operation first becomes Hyperinflationary", "מספרי השוואה בהיפר-אינפלציה"],
  ["Classification of Cash Flows related to Variation Margin Calls", "סיווג תזרימי מזומנים של variation margin"],
  ["Assessing Indicators of Hyperinflationary Economies", "בחינת אינדיקטורים להיפר-אינפלציה"]
];

const ifricTopicPatterns = [
  [/tuition fees/i, "הכרה בהכנסות משכר לימוד"],
  [/climate-related expenditure/i, "הכרה בהוצאות אקלים כנכס"],
  [/climate-related commitments/i, "התחייבויות אקלים והפרשות"],
  [/substitution rights/i, "זכויות החלפה בחכירה"],
  [/decision-making rights/i, "שליטה ושיקול דעת בחכירה"],
  [/sale and leaseback/i, "מכירה וחכירה חוזרת"],
  [/lease term/i, "תקופת חכירה ושיפורי מושכר"],
  [/lease payments/i, "טיפול בתשלומי חכירה"],
  [/incremental borrowing rate/i, "קביעת שיעור היוון לחוכר"],
  [/reverse factoring|supply chain financing/i, "פקטורינג הפוך ותזרים"],
  [/guarantee/i, "ערבויות ומדידת התחייבות"],
  [/derivative/i, "חוזים נגזרים"],
  [/segments?/i, "גילוי למגזרי פעילות"],
  [/employees?|employment/i, "הטבות עובדים או תשלומי העסקה"],
  [/premiums receivable/i, "פרמיות לקבל בביטוח"],
  [/insurance coverage|insurance contracts|annuity/i, "כיסוי ביטוחי וחוזי ביטוח"],
  [/cryptocurrenc/i, "החזקות במטבעות קריפטוגרפיים"],
  [/cloud computing|cloud/i, "עלויות ענן ותוכנה"],
  [/training costs/i, "עלויות הדרכה בחוזים"],
  [/intangible/i, "נכסים בלתי מוחשיים"],
  [/deferred tax/i, "מסים נדחים"],
  [/tax/i, "סוגיות מס"],
  [/joint operation|joint operator/i, "מיזמים משותפים"],
  [/hyperinflation/i, "היפר-אינפלציה ותרגום מטבע"],
  [/exchange differences|foreign operation/i, "הפרשי שער ופעילות חוץ"],
  [/cash flows|cash equivalents|deposits/i, "תזרים מזומנים וסיווג מזומן"],
  [/revenue|principal versus agent|promised goods/i, "הכרה בהכנסה ובחוזים עם לקוחות"],
  [/inventories/i, "מלאי ועלויות מכירה"],
  [/warrants/i, "כתבי אופציה וסיווג"],
  [/spac/i, "עסקאות SPAC וסיווג מכשירים"],
  [/windfarm/i, "חוות רוח וזכויות שימוש"],
  [/player transfer/i, "תשלומי העברת שחקנים"],
  [/business combination|acquisition|handover/i, "צירופי עסקים ותמורה לעובדים"],
  [/merger/i, "מיזוגים בדוחות נפרדים"],
  [/going concern/i, "עסק חי ועריכת דוחות"],
  [/hedg/i, "חשבונאות גידור"],
  [/credit losses|credit-impaired/i, "הפסדי אשראי וירידת ערך"],
  [/transaction costs/i, "עלויות עסקה"],
  [/prepayment option/i, "אופציית פירעון מוקדם"],
  [/employee benefits|benefit/i, "הטבות עובדים"],
  [/biological assets/i, "נכסים ביולוגיים"],
  [/fair value/i, "שווי הוגן וגילוי"],
  [/provision|obligation/i, "התחייבויות והפרשות"]
];

function extractNumber(label) {
  const match = String(label).match(/(\d+)/);
  return match ? Number(match[1]) : -1;
}

function getStandardSortKey(standard) {
  const match = String(standard).match(/\b(IAS|IFRS)\s+(\d+)\b/i);

  if (!match) {
    return { group: 99, number: Number.MAX_SAFE_INTEGER, label: standard };
  }

  return {
    group: match[1].toUpperCase() === "IAS" ? 0 : 1,
    number: Number(match[2]),
    label: standard
  };
}

function sortStandards(values) {
  return values.sort((a, b) => {
    const left = getStandardSortKey(a);
    const right = getStandardSortKey(b);

    if (left.group !== right.group) return left.group - right.group;
    if (left.number !== right.number) return left.number - right.number;
    return left.label.localeCompare(right.label);
  });
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function cleanTitle(value) {
  return String(value || "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function getHebrewTitle(item) {
  if (item.heTitle) {
    return item.heTitle;
  }

  if (item.sourceType === "ESMA") {
    return item.standard && item.standard !== "ESMA Extract"
      ? `תמצית ${extractNumber(item.standard)} ממאגר החלטות האכיפה של EECS`
      : "תמצית החלטות האכיפה של ESMA";
  }

  let translated = cleanTitle(item.title);
  for (const [english, hebrew] of ifricPhraseMap) {
    translated = translated.replace(english, hebrew);
  }

  return translated === cleanTitle(item.title) ? `תרגום חופשי: ${cleanTitle(item.title)}` : translated;
}

function getHebrewSummary(item) {
  if (item.heSummary) {
    return item.heSummary;
  }

  if (item.sourceType === "ESMA") {
    const tags = (item.tags || []).slice(0, 3);
    return tags.length ? tags.join(", ") : "תמצית החלטות אכיפה של ESMA בנושא יישום IFRS.";
  }

  const title = cleanTitle(item.title);
  for (const [pattern, summary] of ifricTopicPatterns) {
    if (pattern.test(title)) {
      return summary;
    }
  }

  return `סוגיה ב-${item.standard}`;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(new Date(dateValue));
}

function createBrowser(name, config) {
  const root = document.getElementById(`${name}-browser`);
  const searchInput = root.querySelector("[data-role='search']");
  const filterSelect = root.querySelector("[data-role='filter']");
  const clearButton = root.querySelector("[data-role='clear']");
  const summary = root.querySelector("[data-role='summary']");
  const grid = root.querySelector("[data-role='grid']");
  const filterLabel = root.querySelector("[data-role='filter-label']");

  filterLabel.textContent = config.filterLabel;
  populateFilters(filterSelect, config);

  const render = () => {
    const query = normalize(searchInput.value);
    const selectedFilter = filterSelect.value;

    const filtered = config.items.filter((item) => {
      const matchesFilter = selectedFilter === "all" || config.getFilterValue(item) === selectedFilter;
      const matchesQuery = !query || getSearchBlob(item).includes(query);
      return matchesFilter && matchesQuery;
    });

    summary.textContent = filtered.length === 1
      ? `תוצאה אחת מתוך ${config.items.length}`
      : `${filtered.length} תוצאות מתוך ${config.items.length}`;

    renderGrid(grid, filtered);

    if (activeTab === name) {
      updateStatus({
        label: config.title,
        count: config.items.length,
        value: query || selectedFilter !== "all" ? `מוצגות ${filtered.length} תוצאות` : "החלטות זמינות",
        note: config.note
      });
    }
  };

  searchInput.addEventListener("input", render);
  filterSelect.addEventListener("change", render);
  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    filterSelect.value = "all";
    render();
  });

  render();

  return {
    render,
    refreshStatus: () => {
      const query = normalize(searchInput.value);
      const selectedFilter = filterSelect.value;
      const filtered = config.items.filter((item) => {
        const matchesFilter = selectedFilter === "all" || config.getFilterValue(item) === selectedFilter;
        const matchesQuery = !query || getSearchBlob(item).includes(query);
        return matchesFilter && matchesQuery;
      });

      updateStatus({
        label: config.title,
        count: config.items.length,
        value: query || selectedFilter !== "all" ? `מוצגות ${filtered.length} תוצאות` : "החלטות זמינות",
        note: config.note
      });
    }
  };
}

function populateFilters(select, config) {
  select.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = config.filterAllLabel;
  select.appendChild(allOption);

  const values = [...new Set(config.items.map(config.getFilterValue))];
  config.sortFilters(values).forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function getSearchBlob(item) {
  return normalize([
    item.title,
    getHebrewTitle(item),
    item.shortSummary || "",
    getHebrewSummary(item),
    item.standard || "",
    item.volume || "",
    item.sourceType || "",
    ...(item.tags || [])
  ].join(" "));
}

function buildCard(item) {
  const fragment = browserTemplate.content.cloneNode(true);

  fragment.querySelector(".decision-date").textContent = formatDate(item.publishedAt);
  fragment.querySelector(".decision-standard").textContent = item.standard;
  fragment.querySelector(".decision-title").textContent = item.title;
  fragment.querySelector(".volume-pill").textContent = item.volume;
  fragment.querySelector(".tooltip-title").textContent = getHebrewTitle(item);
  fragment.querySelector(".tooltip-summary").textContent = getHebrewSummary(item);

  const sourceLink = fragment.querySelector(".source-link");
  sourceLink.href = item.sourceUrl;

  const tagsContainer = fragment.querySelector(".decision-tags");
  (item.tags || []).slice(0, 4).forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "decision-tag";
    tagElement.textContent = tag;
    tagsContainer.appendChild(tagElement);
  });

  return fragment;
}

function buildLatestCard(item) {
  const fragment = latestTemplate.content.cloneNode(true);

  fragment.querySelector(".latest-source").textContent = item.sourceType;
  fragment.querySelector(".latest-date").textContent = formatDate(item.publishedAt);
  fragment.querySelector(".latest-title").textContent = getHebrewTitle(item);
  fragment.querySelector(".latest-summary").textContent = getHebrewSummary(item);
  fragment.querySelector(".latest-standard").textContent = item.standard;

  const action = fragment.querySelector(".latest-action");
  action.dataset.targetTab = item.sourceType.toLowerCase();
  action.textContent = item.sourceType === "IFRIC" ? "פתח IFRIC" : "פתח ESMA";

  return fragment;
}

function renderGrid(grid, items) {
  grid.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "לא נמצאו פריטים תואמים. אפשר לנסות חיפוש או סינון אחר.";
    grid.appendChild(empty);
    return;
  }

  items.forEach((item) => grid.appendChild(buildCard(item)));
}

function renderHome() {
  const query = normalize(globalSearch.value);
  const items = !query
    ? allItems.slice(0, 12)
    : allItems.filter((item) => getSearchBlob(item).includes(query)).slice(0, 18);

  latestGrid.innerHTML = "";
  items.forEach((item) => latestGrid.appendChild(buildLatestCard(item)));

  latestGrid.querySelectorAll("[data-target-tab]").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.targetTab));
  });

  homeSummary.textContent = query
    ? `${items.length} תוצאות עבור "${globalSearch.value.trim()}"`
    : "מבט מהיר על ההחלטות האחרונות משני המאגרים";

  if (activeTab === "home") {
    updateStatus({
      label: "דף ראשי",
      count: allItems.length,
      value: query ? `נמצאו ${items.length} תוצאות` : "פריטים בכלל האתר",
      note: query
        ? "החיפוש הראשי סורק את IFRIC ואת ESMA יחד."
        : "הדף הראשי מציג את ההחלטות האחרונות והבולטות מכל המקורות."
    });
  }
}

function updateStatus({ label, count, value, note }) {
  statusLabel.textContent = label;
  statusCount.textContent = String(count);
  statusValue.textContent = value;
  statusNote.textContent = note;
}

function activateTab(tabName) {
  activeTab = tabName;

  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabName);
  });

  tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== tabName;
  });

  if (tabName === "home") {
    renderHome();
    return;
  }

  if (browsers[tabName]) {
    browsers[tabName].refreshStatus();
  }
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

globalSearch.addEventListener("input", renderHome);

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

async function initialize() {
  const [ifricRaw, esmaRaw] = await Promise.all([
    loadJson("./data/ifric.json"),
    loadJson("./data/esma.json")
  ]);

  ifricDecisions = ifricRaw.map((item) => ({ ...item, sourceType: "IFRIC" }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  esmaDecisions = esmaRaw.map((item) => ({ ...item, sourceType: item.sourceType || "ESMA" }))
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  datasets = {
    ifric: {
      title: "IFRIC",
      items: ifricDecisions,
      filterLabel: "סינון לפי תקן",
      filterAllLabel: "כל התקנים",
      note: "מאגר agenda decisions של IFRIC עם חיפוש לפי תקן, כותרת ונושא.",
      getFilterValue: (item) => item.standard,
      sortFilters: sortStandards
    },
    esma: {
      title: "ESMA",
      items: esmaDecisions,
      filterLabel: "סינון לפי Extract",
      filterAllLabel: "כל ה-Extracts",
      note: "מאגר extracts רשמיים של ESMA עם דגש על נושאי אכיפה ויישום IFRS.",
      getFilterValue: (item) => item.standard,
      sortFilters: (values) => values.sort((a, b) => extractNumber(b) - extractNumber(a))
    }
  };

  allItems = [...ifricDecisions, ...esmaDecisions].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  browsers = {
    ifric: createBrowser("ifric", datasets.ifric),
    esma: createBrowser("esma", datasets.esma)
  };

  renderHome();
  activateTab("home");
}

initialize().catch((error) => {
  console.error(error);
  updateStatus({
    label: "שגיאת טעינה",
    count: 0,
    value: "הנתונים לא נטענו",
    note: "בדוק שקבצי JSON קיימים בתיקיית data."
  });
  homeSummary.textContent = "טעינת הנתונים נכשלה.";
});
