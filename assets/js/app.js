/* =========================================
   HAMI & SHIFA
   Birthday Story App
========================================= */

/* =========================================
   APP STATE
========================================= */

const state = {
  data: null,

  currentPage: 0,

  totalPages: 0,

  touchStartX: 0,

  touchStartY: 0,

  isAnimating: false,
};

/* =========================================
   DOM
========================================= */

const elements = {};

/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();

  setupEventListeners();

  createFloatingHearts();

  try {
    const data = await loadData();

    state.data = data;

    renderIntro();

    renderBookCover();

    renderDots();

    renderPage();
  } catch (error) {
    console.error("Unable to initialize website:", error);

    showDataError();
  }
}

/* =========================================
   CACHE DOM
========================================= */

function cacheElements() {
  elements.introScreen = document.getElementById("introScreen");

  elements.bookScreen = document.getElementById("bookScreen");

  elements.finalScreen = document.getElementById("finalScreen");

  /* Intro */

  elements.introEyebrow = document.getElementById("introEyebrow");

  elements.introName = document.getElementById("introName");

  elements.introLines = document.getElementById("introLines");

  elements.introHighlight = document.getElementById("introHighlight");

  elements.introDate = document.getElementById("introDate");

  elements.openStoryBtn = document.getElementById("openStoryBtn");

  /* Book */

  elements.leftLabel = document.getElementById("leftLabel");

  elements.leftTitle = document.getElementById("leftTitle");

  elements.leftText = document.getElementById("leftText");

  elements.signature = document.getElementById("signature");

  elements.rightLabel = document.getElementById("rightLabel");

  /* Chapter */

  elements.chapterLabel = document.getElementById("chapterLabel");

  elements.chapterTitle = document.getElementById("chapterTitle");

  elements.chapterText = document.getElementById("chapterText");

  elements.pageCounter = document.getElementById("pageCounter");

  elements.pageProgress = document.getElementById("pageProgress");

  /* Navigation */

  elements.previousBtn = document.getElementById("previousBtn");

  elements.nextBtn = document.getElementById("nextBtn");

  elements.dotsContainer = document.getElementById("dotsContainer");

  /* Book */

  elements.book = document.getElementById("book");

  elements.rightPage = document.querySelector(".right-page");

  /* Chapter image */

  elements.pageImageContainer = document.getElementById("pageImageContainer");

  elements.pageImage = document.getElementById("pageImage");

  /* Final */

  elements.finalLabel = document.getElementById("finalLabel");

  elements.finalTitle = document.getElementById("finalTitle");

  elements.finalLines = document.getElementById("finalLines");

  /*
   * IMPORTANT FIX
   *
   * These two elements were missing
   * from your previous JS.
   */

  elements.finalImageContainer = document.getElementById("finalImageContainer");

  elements.finalImage = document.getElementById("finalImage");

  elements.restartBtn = document.getElementById("restartBtn");

  /* Other */

  elements.heartsContainer = document.getElementById("heartsContainer");

  elements.musicButton = document.getElementById("musicButton");

  elements.backgroundMusic = document.getElementById("backgroundMusic");
}

/* =========================================
   EVENTS
========================================= */

function setupEventListeners() {
  if (elements.openStoryBtn) {
    elements.openStoryBtn.addEventListener("click", openStory);
  }

  if (elements.previousBtn) {
    elements.previousBtn.addEventListener("click", previousPage);
  }

  if (elements.nextBtn) {
    elements.nextBtn.addEventListener("click", nextPage);
  }

  if (elements.restartBtn) {
    elements.restartBtn.addEventListener("click", restartStory);
  }

  if (elements.musicButton) {
    elements.musicButton.addEventListener("click", toggleMusic);
  }

  setupSwipe();

  document.addEventListener("keydown", handleKeyboard);
}

/* =========================================
   LOAD JSON
========================================= */

async function loadData() {
  const response = await fetch("./assets/data/data.json");

  if (!response.ok) {
    throw new Error(`data.json failed to load: ${response.status}`);
  }

  const data = await response.json();

  validateData(data);

  return data;
}

/* =========================================
   VALIDATION
========================================= */

function validateData(data) {
  if (!data) {
    throw new Error("Data is empty.");
  }

  if (!data.intro) {
    throw new Error("Missing intro data.");
  }

  if (!data.book) {
    throw new Error("Missing book data.");
  }

  if (!Array.isArray(data.chapters)) {
    throw new Error("chapters must be an array.");
  }

  if (!data.birthday) {
    throw new Error("Missing birthday data.");
  }

  if (!data.final) {
    throw new Error("Missing final data.");
  }

  state.totalPages = data.chapters.length + 1;
}

/* =========================================
   INTRO
========================================= */

function renderIntro() {
  const intro = state.data.intro;

  if (elements.introEyebrow) {
    elements.introEyebrow.textContent = intro.eyebrow || "";
  }

  if (elements.introName) {
    elements.introName.textContent = intro.name || "";
  }

  if (elements.introHighlight) {
    elements.introHighlight.textContent = intro.highlight || "";
  }

  if (elements.introDate) {
    elements.introDate.textContent = intro.date || "";
  }

  if (elements.openStoryBtn) {
    elements.openStoryBtn.textContent =
      intro.button || "Hamari kahani kholo ❤️";
  }

  if (elements.introLines) {
    elements.introLines.innerHTML = "";

    const lines = Array.isArray(intro.lines) ? intro.lines : [];

    lines.forEach((line, index) => {
      const paragraph = document.createElement("p");

      paragraph.textContent = line;

      paragraph.style.animationDelay = `${index * 0.15}s`;

      elements.introLines.appendChild(paragraph);
    });
  }
}

/* =========================================
   BOOK COVER
========================================= */

function renderBookCover() {
  const book = state.data.book;

  if (elements.leftLabel) {
    elements.leftLabel.textContent = book.leftLabel || book.coverTitle || "";
  }

  if (elements.leftTitle) {
    elements.leftTitle.textContent = book.leftTitle || book.coverTitle || "";
  }

  if (elements.leftText) {
    elements.leftText.textContent = book.leftText || book.coverSubtitle || "";
  }

  if (elements.signature) {
    elements.signature.textContent = book.signature || "— Hami ❤️";
  }

  if (elements.rightLabel) {
    elements.rightLabel.textContent = book.rightLabel || "Sirf tumhare liye";
  }
}

/* =========================================
   OPEN STORY
========================================= */

function openStory() {
  if (!elements.introScreen || !elements.bookScreen) {
    return;
  }

  elements.introScreen.classList.add("hidden");

  elements.bookScreen.classList.remove("hidden");

  state.currentPage = 0;

  renderPage();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  startHeartAnimation();
}

/* =========================================
   CURRENT CONTENT
========================================= */

function getCurrentContent() {
  if (!state.data) {
    return null;
  }

  const chapters = state.data.chapters || [];

  if (state.currentPage < chapters.length) {
    return chapters[state.currentPage];
  }

  return state.data.birthday;
}

/* =========================================
   RENDER PAGE
========================================= */

function renderPage(direction = "next") {
  if (!state.data || !elements.chapterTitle) {
    return;
  }

  const content = getCurrentContent();

  if (!content) {
    return;
  }

  animatePage(direction);

  if (elements.chapterLabel) {
    elements.chapterLabel.textContent = content.label || "";
  }

  if (elements.chapterTitle) {
    elements.chapterTitle.textContent = content.title || "";
  }

  if (elements.chapterText) {
    elements.chapterText.textContent = content.text || "";
  }

  if (elements.pageCounter) {
    elements.pageCounter.textContent = `${state.currentPage + 1} / ${
      state.totalPages
    }`;
  }

  if (elements.pageProgress) {
    elements.pageProgress.textContent = state.currentPage + 1;
  }

  /*
   * Image can be:
   *
   * ""
   *
   * "./assets/images/photo.jpg"
   *
   * "https://..."
   */

  renderOptionalImage(content.image, "chapter");

  updateNavigation();

  updateDots();
}

/* =========================================
   UNIVERSAL IMAGE RENDERER
========================================= */

function renderOptionalImage(imagePath, type = "chapter") {
  let container;

  let image;

  if (type === "final") {
    container = elements.finalImageContainer;

    image = elements.finalImage;
  } else {
    container = elements.pageImageContainer;

    image = elements.pageImage;
  }

  if (!container || !image) {
    return;
  }

  /*
   * Reset old image first.
   */

  image.onload = null;

  image.onerror = null;

  image.removeAttribute("src");

  image.alt = "";

  container.classList.add("hidden");

  /*
   * Empty image
   */

  if (typeof imagePath !== "string" || imagePath.trim() === "") {
    return;
  }

  const cleanPath = imagePath.trim();

  /*
   * Valid image
   */

  image.onload = () => {
    container.classList.remove("hidden");
  };

  /*
   * Broken image
   */

  image.onerror = () => {
    console.warn(`Image failed to load: ${cleanPath}`);

    container.classList.add("hidden");

    image.removeAttribute("src");
  };

  image.alt = state.data?.intro?.name || "Memory ❤️";

  image.src = cleanPath;
}

/* =========================================
   PAGE ANIMATION
========================================= */

function animatePage(direction) {
  if (!elements.rightPage) {
    return;
  }

  elements.rightPage.classList.remove("page-changing");

  void elements.rightPage.offsetWidth;

  elements.rightPage.classList.add("page-changing");
}

/* =========================================
   NEXT PAGE
========================================= */

function nextPage() {
  if (state.isAnimating) {
    return;
  }

  if (state.currentPage < state.totalPages - 1) {
    state.currentPage++;

    renderPage("next");

    return;
  }

  showFinal();
}

/* =========================================
   PREVIOUS PAGE
========================================= */

function previousPage() {
  if (state.isAnimating) {
    return;
  }

  if (state.currentPage > 0) {
    state.currentPage--;

    renderPage("previous");

    return;
  }

  if (elements.bookScreen) {
    elements.bookScreen.classList.add("hidden");
  }

  if (elements.introScreen) {
    elements.introScreen.classList.remove("hidden");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================================
   NAVIGATION
========================================= */

function updateNavigation() {
  if (elements.previousBtn) {
    elements.previousBtn.disabled = false;
  }

  if (elements.nextBtn) {
    elements.nextBtn.textContent =
      state.currentPage >= state.totalPages - 1 ? "♥" : "→";
  }
}

/* =========================================
   DOTS
========================================= */

function renderDots() {
  if (!elements.dotsContainer) {
    return;
  }

  elements.dotsContainer.innerHTML = "";

  for (let index = 0; index < state.totalPages; index++) {
    const dot = document.createElement("button");

    dot.type = "button";

    dot.className = "page-dot";

    dot.setAttribute("aria-label", `Page ${index + 1}`);

    dot.addEventListener("click", () => {
      if (index === state.currentPage) {
        return;
      }

      const direction = index > state.currentPage ? "next" : "previous";

      state.currentPage = index;

      renderPage(direction);
    });

    elements.dotsContainer.appendChild(dot);
  }

  updateDots();
}

function updateDots() {
  if (!elements.dotsContainer) {
    return;
  }

  const dots = elements.dotsContainer.querySelectorAll(".page-dot");

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === state.currentPage);
  });
}

/* =========================================
   SWIPE
========================================= */

function setupSwipe() {
  const book = elements.book || document.getElementById("book");

  if (!book) {
    return;
  }

  book.addEventListener("touchstart", handleTouchStart, {
    passive: true,
  });

  book.addEventListener("touchend", handleTouchEnd, {
    passive: true,
  });
}

function handleTouchStart(event) {
  if (!event || !event.changedTouches || !event.changedTouches[0]) {
    return;
  }

  state.touchStartX = event.changedTouches[0].clientX;

  state.touchStartY = event.changedTouches[0].clientY;
}

function handleTouchEnd(event) {
  if (!event || !event.changedTouches || !event.changedTouches[0]) {
    return;
  }

  const endX = event.changedTouches[0].clientX;

  const endY = event.changedTouches[0].clientY;

  const diffX = endX - state.touchStartX;

  const diffY = endY - state.touchStartY;

  if (Math.abs(diffY) > Math.abs(diffX)) {
    return;
  }

  if (Math.abs(diffX) < 50) {
    return;
  }

  if (diffX < 0) {
    nextPage();
  } else {
    previousPage();
  }
}

/* =========================================
   KEYBOARD
========================================= */

function handleKeyboard(event) {
  if (
    !elements.bookScreen ||
    elements.bookScreen.classList.contains("hidden")
  ) {
    return;
  }

  if (event.key === "ArrowRight") {
    nextPage();
  }

  if (event.key === "ArrowLeft") {
    previousPage();
  }
}

/* =========================================
   FINAL PAGE
========================================= */

function showFinal() {
  if (!elements.bookScreen || !elements.finalScreen) {
    return;
  }

  elements.bookScreen.classList.add("hidden");

  elements.finalScreen.classList.remove("hidden");

  renderFinal();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });

  startHeartAnimation();
}

/* =========================================
   RENDER FINAL
========================================= */

function renderFinal() {
  const final = state.data.final;

  if (elements.finalLabel) {
    elements.finalLabel.textContent = final.label || "";
  }

  if (elements.finalTitle) {
    elements.finalTitle.textContent = final.title || "";
  }

  /*
   * FINAL IMAGE
   *
   * Supports:
   *
   * ""
   *
   * "./assets/images/shifa.jpg"
   *
   * "https://res.cloudinary.com/..."
   */

  renderOptionalImage(final.image, "final");

  /*
   * FINAL TEXT
   */

  if (elements.finalLines) {
    elements.finalLines.innerHTML = "";

    const lines = Array.isArray(final.lines) ? final.lines : [];

    lines.forEach((line, index) => {
      const paragraph = document.createElement("p");

      paragraph.className = "final-line";

      paragraph.textContent = line;

      paragraph.style.animationDelay = `${index * 0.18}s`;

      elements.finalLines.appendChild(paragraph);
    });
  }
}

/* =========================================
   RESTART
========================================= */

function restartStory() {
  if (elements.finalScreen) {
    elements.finalScreen.classList.add("hidden");
  }

  if (elements.bookScreen) {
    elements.bookScreen.classList.remove("hidden");
  }

  state.currentPage = 0;

  renderPage("previous");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

/* =========================================
   FLOATING HEARTS
========================================= */

function createFloatingHearts() {
  if (!elements.heartsContainer) {
    return;
  }

  const symbols = ["❤️", "♥", "♡", "🌸", "✨"];

  setInterval(() => {
    createHeart(symbols);
  }, 1200);
}

function createHeart(symbols) {
  if (!elements.heartsContainer) {
    return;
  }

  const heart = document.createElement("span");

  heart.className = "floating-heart";

  heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

  heart.style.left = `${Math.random() * 100}%`;

  heart.style.fontSize = `${10 + Math.random() * 15}px`;

  heart.style.animationDuration = `${6 + Math.random() * 7}s`;

  elements.heartsContainer.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 14000);
}

function startHeartAnimation() {
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      createHeart(["❤️", "♥", "♡", "🌸", "✨"]);
    }, i * 180);
  }
}

/* =========================================
   MUSIC
========================================= */

function toggleMusic() {
  const music = elements.backgroundMusic;

  if (!music) {
    return;
  }

  /*
   * No music file yet.
   */

  if (!music.src) {
    if (elements.musicButton) {
      elements.musicButton.textContent = "♪";
    }

    return;
  }

  if (music.paused) {
    music
      .play()
      .then(() => {
        elements.musicButton?.classList.add("playing");

        elements.musicButton.textContent = "♫";
      })
      .catch((error) => {
        console.warn("Music could not start:", error);
      });
  } else {
    music.pause();

    elements.musicButton?.classList.remove("playing");

    elements.musicButton.textContent = "♪";
  }
}

/* =========================================
   ERROR
========================================= */

function showDataError() {
  const message = `
    <div
      style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:30px;
        text-align:center;
        color:white;
        font-family:Poppins,sans-serif;
      "
    >

      <div>

        <h1 style="margin-bottom:15px;">
          Oops ❤️
        </h1>

        <p>
          data.json load nahi ho rahi.
        </p>

        <p
          style="
            margin-top:10px;
            opacity:.6;
            font-size:13px;
          "
        >
          Please website ko local server
          se run karein.
        </p>

      </div>

    </div>
  `;

  document.body.innerHTML = message;
}
