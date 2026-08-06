// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ===== Toast =====
const toastEl = $("#toast");
let toastTimer = null;
function toast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.style.display = "none"), 3200);
}

// ===== Year =====
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Smooth scroll for hash links (only same-page hashes) =====
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", id);
  });
});

// ===== Active nav (home page sections) =====
(function initActiveNav() {
  const navLinks = $$(".navlink");
  if (navLinks.length === 0) return;

  // set current page active by data-page
  const page = document.body.getAttribute("data-page");
  navLinks.forEach(a => {
    const p = a.getAttribute("data-page");
    if (p && page && p === page) a.classList.add("active");
  });

  // section observer (only on home)
  if (page !== "home") return;

  const sectionLinks = navLinks.filter(a => (a.getAttribute("href") || "").startsWith("#"));
  const sections = sectionLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (sections.length === 0) return;

  const navIO = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;

    const id = "#" + visible.target.id;
    sectionLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
  }, { threshold: [0.25, 0.4, 0.6] });

  sections.forEach(s => navIO.observe(s));
})();

// ===== Reveal =====
(function initReveal() {
  const revealEls = $$(".reveal");
  if (revealEls.length === 0) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      if (ent.isIntersecting) {
        ent.target.classList.add("show");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));
})();

// ===== Stats animation (home) =====
(function initStats() {
  const s1 = $("#stat1"), s2 = $("#stat2"), s3 = $("#stat3");
  if (!s1 || !s2 || !s3) return;

  function animateNumber(el, to, suffix = "") {
    const start = 0;
    const duration = 900;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(start + (to - start) * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // اعداد را اینجا تغییر بده
  animateNumber(s1, 48, "+");
  animateNumber(s2, 22, "+");
  animateNumber(s3, 96, "%");
})();

// ===== Contact real links (WhatsApp / Telegram / Email) =====
const CONTACT = {
  phoneIntl: "989033655793",       // فقط عدد، بدون +  (نمونه: 98912xxxxxxx)
  telegramUser: "Amirhossein1389117",     // یوزرنیم تلگرام بدون @
  email: "rte.iran2025@gmail.com"        // ایمیل واقعی
};

function buildMessage() {
  const name = ($("#name")?.value || "").trim();
  const service = ($("#service")?.value || "").trim();
  const msg = ($("#msg")?.value || "").trim();

  const parts = [
    "سلام برای همکاری با شرکت پیام می‌دهم.",
    name ? `نام: ${name}` : null,
    service ? `حوزه: ${service}` : null,
    msg ? `توضیح: ${msg}` : null
  ].filter(Boolean);

  return parts.join("\n");
}

function waLink(text) {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${CONTACT.phoneIntl}?text=${encoded}`;
}
function mailLink(text) {
  const subject = encodeURIComponent("درخواست همکاری | RTE");
  const body = encodeURIComponent(text);
  return `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
}
function tgLink() {
  // تلگرام پیش‌فرض: باز کردن پروفایل/چت
  return `https://t.me/${CONTACT.telegramUser}`;
}

(function initContactActions() {
  const copyBtn = $("#copyBtn");
  const copyContact = $("#copyContact");
  const quickMsg = $("#quickMsg");
  const openWA = $("#openWA");
  const openEmail = $("#openEmail");
  const openTG = $("#openTG");
  const form = $("#contactForm");
  const saveDraft = $("#saveDraft");

  const phoneEl = $("#phone"), emailEl = $("#email"), addressEl = $("#address");

  // نمایش اطلاعات تماس در صفحه از روی CONTACT
  if (phoneEl) phoneEl.textContent = "+" + CONTACT.phoneIntl;
  if (emailEl) emailEl.textContent = CONTACT.email;

  const contactText = () => {
    const phone = phoneEl?.textContent?.trim() || ("+" + CONTACT.phoneIntl);
    const email = emailEl?.textContent?.trim() || CONTACT.email;
    const address = addressEl?.textContent?.trim() || "ایران — (شیراز شهرک صنعتی)";
    return `RTE\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}`;
  };

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("کپی شد ✅");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("کپی شد ✅");
    }
  }

  if (copyBtn) copyBtn.addEventListener("click", () => copyToClipboard(contactText()));
  if (copyContact) copyContact.addEventListener("click", () => copyToClipboard(contactText()));

  if (quickMsg) quickMsg.addEventListener("click", () => {
    const msg = "سلام، برای همکاری با شرکت RTE درخواست مشاوره دارم. لطفاً جهت هماهنگی تماس بگیرید.";
    copyToClipboard(msg);
  });

  if (openWA) openWA.addEventListener("click", () => window.open(waLink(buildMessage() || "سلام از طرف سایت RTE"), "_blank"));
  if (openEmail) openEmail.addEventListener("click", () => window.location.href = mailLink(buildMessage() || "سلام از طرف سایت RTE"));
  if (openTG) openTG.addEventListener("click", () => window.open(tgLink(), "_blank"));

  // Draft
  const DRAFT_KEY = "rte_contact_draft";
  function loadDraft() {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!draft) return;
      if ($("#name")) $("#name").value = draft.name || "";
      if ($("#service")) $("#service").value = draft.service || "";
      if ($("#msg")) $("#msg").value = draft.msg || "";
    } catch { }
  }
  if (saveDraft) {
    saveDraft.addEventListener("click", () => {
      const draft = {
        name: ($("#name")?.value || "").trim(),
        service: ($("#service")?.value || "").trim(),
        msg: ($("#msg")?.value || "").trim(),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      toast("پیش‌نویس ذخیره شد 💾");
    });
  }
  loadDraft();

  // Form "واقعی": به جای دمو، سه گزینه ارسال
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      toast("برای ارسال واقعی یکی از گزینه‌ها (واتساپ/ایمیل/تلگرام) را بزنید ✅");
      // اسکرول به دکمه‌ها اگر وجود دارند
      $("#sendOptions")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();

// ===== FAQ accordion =====
(function initFAQ() {
  $$(".faq-q").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      item.classList.toggle("open");
    });
  });
})();

// ===== Projects filters/search (projects page) =====
(function initProjects() {
  const wrap = $("#projectList");
  if (!wrap) return;

  const search = $("#projectSearch");
  const filterBtns = $$(".filter");

  let currentFilter = "all";
  function apply() {
    const q = (search?.value || "").trim().toLowerCase();

    $$(".project", wrap).forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").toLowerCase();
      const text = (card.innerText || "").toLowerCase();

      const matchFilter = currentFilter === "all" ? true : tags.includes(currentFilter);
      const matchSearch = !q ? true : (text.includes(q) || tags.includes(q));

      card.style.display = (matchFilter && matchSearch) ? "" : "none";
    });
  }

  if (search) search.addEventListener("input", apply);

  filterBtns.forEach(b => {
    b.addEventListener("click", () => {
      filterBtns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      currentFilter = b.getAttribute("data-filter") || "all";
      apply();
    });
  });

  apply();
})();
