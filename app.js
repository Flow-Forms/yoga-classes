(() => {
  const STORAGE_KEY = "yoga-player:last-played-id";

  const els = {
    search: document.getElementById("search"),
    list: document.getElementById("class-list"),
    empty: document.getElementById("empty-state"),
    count: document.getElementById("class-count"),
    randomBtn: document.getElementById("random-btn"),
    chips: document.querySelectorAll(".chip"),
    playerBar: document.getElementById("player-bar"),
    audio: document.getElementById("audio"),
    nowTitle: document.getElementById("now-playing-title"),
    nowMeta: document.getElementById("now-playing-meta"),
  };

  let classes = [];
  let difficulty = "all";
  let query = "";
  let currentId = null;

  function formatDuration(sec) {
    const s = Math.max(0, Math.round(Number(sec) || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    if (h > 0) {
      return rem >= 30 ? `~${h}h ${m + 1}m` : `~${h}h ${m}m`;
    }
    return `${m}:${String(rem).padStart(2, "0")}`;
  }

  function normalize(str) {
    return String(str || "").toLowerCase().trim();
  }

  function matchesClass(item) {
    const diff = item.difficulty || "";
    if (difficulty !== "all" && normalize(diff) !== normalize(difficulty)) {
      return false;
    }

    const q = normalize(query);
    if (!q) return true;

    const hay = [
      item.title,
      item.difficulty,
      item.notes,
      ...(item.poses || []),
    ]
      .map(normalize)
      .join(" ");

    return hay.includes(q);
  }

  function filtered() {
    return classes.filter(matchesClass);
  }

  function render() {
    const items = filtered();
    els.list.innerHTML = "";
    els.empty.classList.toggle("hidden", items.length > 0);
    const showing =
      items.length === classes.length
        ? `${classes.length} classes available`
        : `${items.length} of ${classes.length} classes`;
    els.count.textContent = showing;

    for (const item of items) {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-row" + (item.id === currentId ? " is-playing" : "");
      btn.setAttribute("aria-label", `Play ${item.title}`);

      const top = document.createElement("div");
      top.className = "row-top";

      const title = document.createElement("div");
      title.className = "row-title";
      title.textContent = item.title;

      const dur = document.createElement("div");
      dur.className = "row-duration";
      dur.textContent = formatDuration(item.durationSec);

      top.append(title, dur);
      btn.append(top);

      const tags = document.createElement("div");
      tags.className = "row-tags";
      let hasTags = false;

      if (item.difficulty) {
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = item.difficulty;
        tags.append(badge);
        hasTags = true;
      }

      for (const pose of item.poses || []) {
        if (!pose) continue;
        const tag = document.createElement("span");
        tag.className = "pose-tag";
        tag.textContent = pose;
        tags.append(tag);
        hasTags = true;
      }

      if (hasTags) btn.append(tags);

      btn.addEventListener("click", () => playClass(item));
      li.append(btn);
      els.list.append(li);
    }
  }

  function playClass(item) {
    currentId = item.id;
    els.playerBar.classList.remove("hidden");
    els.nowTitle.textContent = item.title;

    const bits = [formatDuration(item.durationSec)];
    if (item.difficulty) bits.push(item.difficulty);
    els.nowMeta.textContent = bits.join(" · ");

    els.audio.src = item.audio;
    els.audio.load();
    const playPromise = els.audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }

    try {
      localStorage.setItem(STORAGE_KEY, item.id);
    } catch (_) {}

    render();
    els.playerBar.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function pickRandom() {
    const items = filtered();
    if (!items.length) return;
    let pool = items;
    if (items.length > 1 && currentId) {
      const others = items.filter((c) => c.id !== currentId);
      if (others.length) pool = others;
    }
    playClass(pool[Math.floor(Math.random() * pool.length)]);
  }

  function bind() {
    els.search.addEventListener("input", () => {
      query = els.search.value;
      render();
    });

    els.chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        difficulty = chip.dataset.difficulty || "all";
        els.chips.forEach((c) => c.classList.toggle("is-active", c === chip));
        render();
      });
    });

    els.randomBtn.addEventListener("click", pickRandom);
  }

  async function init() {
    bind();
    try {
      const res = await fetch("classes.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      classes = await res.json();
      if (!Array.isArray(classes)) throw new Error("classes.json must be an array");
    } catch (err) {
      els.count.textContent = "Could not load classes";
      els.empty.textContent = String(err.message || err);
      els.empty.classList.remove("hidden");
      return;
    }

    render();

    let lastId = null;
    try {
      lastId = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    if (lastId) {
      const last = classes.find((c) => c.id === lastId);
      if (last) {
        currentId = last.id;
        els.playerBar.classList.remove("hidden");
        els.nowTitle.textContent = last.title;
        const bits = [formatDuration(last.durationSec)];
        if (last.difficulty) bits.push(last.difficulty);
        els.nowMeta.textContent = bits.join(" · ") + " · last played";
        els.audio.src = last.audio;
        els.audio.preload = "metadata";
        render();
      }
    }
  }

  init();
})();
