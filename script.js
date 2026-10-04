/* ===== pengaturan umum ===== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== menu HP ===== */
const btn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");

if (btn && nav) {
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

/* ===== tahun di footer ===== */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ===== slideshow hero (ganti 5000 untuk durasi per foto, dalam milidetik) ===== */
const slides = document.querySelectorAll(".slide");
let current = 0;

if (slides.length > 1 && !reduceMotion) {
  setInterval(() => {
    slides.forEach((s) => s.classList.remove("prev"));
    slides[current].classList.remove("active");
    slides[current].classList.add("prev");
    current = (current + 1) % slides.length;
    slides[current].classList.add("active");
  }, 5000);
}

/* ===== dropdown menu ===== */
const dropdowns = document.querySelectorAll(".dropdown");

function closeDropdowns() {
  dropdowns.forEach((d) => {
    d.classList.remove("open");
    const b = d.querySelector(".drop-btn");
    if (b) b.setAttribute("aria-expanded", "false");
  });
}

dropdowns.forEach((d) => {
  const b = d.querySelector(".drop-btn");
  if (!b) return;
  b.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !d.classList.contains("open");
    closeDropdowns();
    d.classList.toggle("open", willOpen);
    b.setAttribute("aria-expanded", willOpen);
  });
});

document.addEventListener("click", closeDropdowns);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDropdowns(); });

/* ===== deretan geser (berita, foto, video): tombol panah menggeser 3 kartu =====
   Di HP, panah samping dibuat otomatis (panah header disembunyikan lewat CSS). */
function initCarousel(trackId, prevId, nextId) {
  const track = document.getElementById(trackId);
  const prevTop = document.getElementById(prevId);
  const nextTop = document.getElementById(nextId);
  if (!track || !prevTop || !nextTop || !track.firstElementChild) return;

  /* bungkus deretan kartu dan tambahkan panah samping */
  const box = document.createElement("div");
  box.className = "carousel";
  track.before(box);
  box.appendChild(track);

  const makeSide = (cls, label, arrow) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "side-arrow " + cls;
    b.setAttribute("aria-label", label);
    b.innerHTML = arrow;
    box.appendChild(b);
    return b;
  };
  const prevs = [prevTop, makeSide("side-prev", "Sebelumnya", "&larr;")];
  const nexts = [nextTop, makeSide("side-next", "Berikutnya", "&rarr;")];

  const pageWidth = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = track.firstElementChild.offsetWidth + gap;
    const visible = Math.max(1, Math.round((track.clientWidth + gap) / step));
    return step * visible;
  };
  const update = () => {
    const atStart = track.scrollLeft <= 1;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    prevs.forEach((b) => (b.disabled = atStart));
    nexts.forEach((b) => (b.disabled = atEnd));
  };
  const go = (dir) =>
    track.scrollBy({ left: dir * pageWidth(), behavior: reduceMotion ? "auto" : "smooth" });

  prevs.forEach((b) => b.addEventListener("click", () => go(-1)));
  nexts.forEach((b) => b.addEventListener("click", () => go(1)));
  track.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

initCarousel("newsTrack", "newsPrev", "newsNext");
initCarousel("galleryTrack", "galleryPrev", "galleryNext");
initCarousel("videoTrack", "videoPrev", "videoNext");

/* ===== animasi muncul saat digulir (tambahkan class "reveal" pada elemen) ===== */
const revealEls = document.querySelectorAll(".reveal");
if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -10% 0px" });
  revealEls.forEach((el) => io.observe(el));
}

/* ===== sambutan kepala sekolah: HP = kartu dibalik, laptop = jendela baca ===== */
(function () {
  const card = document.querySelector(".welcome");
  const dlg = document.getElementById("speechDialog");
  if (!card || !dlg) return;
  const mobile = window.matchMedia("(max-width: 860px)");

  /* salin teks sambutan ke sisi belakang kartu (HP) */
  const slot = card.querySelector(".speech-slot");
  const text = dlg.querySelector(".speech");
  if (slot && text) slot.innerHTML = text.innerHTML;

  card.addEventListener("click", (e) => {
    const link = e.target.closest("a");
      if (mobile.matches) {
        if (link) e.preventDefault();
        /* saat membaca, ketukan di area teks tidak membalik kartu */
        if (card.classList.contains("flipped") && e.target.closest(".speech-slot")) return;
        card.classList.toggle("flipped");
      } else if (link && link.classList.contains("more") && typeof dlg.showModal === "function") {
      e.preventDefault();
      dlg.showModal();
    }
  });

  const close = document.getElementById("speechClose");
  if (close) close.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  mobile.addEventListener("change", () => {
    if (!mobile.matches) card.classList.remove("flipped");
    else if (dlg.open) dlg.close();
  });
})();