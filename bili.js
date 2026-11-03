/*!
 * bili.js — 国内访问加速层
 * 作用：把 GitHub Pages 上体积较大的 mp4 换成 B 站内嵌播放器。
 * 用法：把每个视频对应的 BV 号填进下面 VIDEO_BV；留空则自动回退到原来的 mp4，不会白屏。
 */
(() => {
  /* ============================================================
   *  ↓↓↓  只需要改这一张表：左边是视频文件名，右边填 B 站 BV 号  ↓↓↓
   * ============================================================ */
  const VIDEO_BV = {
    "hero_gameplay.mp4": "",
    "freeze_control_budget.mp4": "",
    "element_fire.mp4": "",
    "element_thunder.mp4": "",
    "terrain_water.mp4": "",
    "terrain_fire_vine.mp4": "",
    "terrain_thunder_gate.mp4": "",
    "parry_execute.mp4": "",
    "transform_mastery.mp4": "",
    "crystal_defense.mp4": "",
    "crystal_domain.mp4": "",
    "charge_fire_1.mp4": "",
    "charge_fire_2.mp4": "",
    "execute_growth.mp4": "",
    "triad_altar.mp4": "",
    "knight_boss.mp4": ""
  };
  /* ============================================================
   *  ↑↑↑  以上是唯一需要你手动编辑的部分  ↑↑↑
   * ============================================================ */

  const BV_PATTERN = /^BV[0-9A-Za-z]{10}$/;

  const playerUrl = (bv, autoplay) =>
    "https://player.bilibili.com/player.html?bvid=" + bv +
    "&page=1&high_quality=1&danmaku=0&autoplay=" + (autoplay ? 1 : 0) + "&muted=0";

  // 从 <video>/<source> 里取出文件名，例如 "media/hero_gameplay.mp4?v=1" -> "hero_gameplay.mp4"
  const fileNameOf = (video) => {
    const source = video.querySelector("source");
    const raw =
      (source && (source.dataset.src || source.getAttribute("src"))) ||
      video.getAttribute("src") ||
      "";
    return raw.split("?")[0].split("/").pop();
  };

  const bvOf = (video) => {
    const bv = VIDEO_BV[fileNameOf(video)];
    return bv && BV_PATTERN.test(bv.trim()) ? bv.trim() : "";
  };

  const makeIframe = (bv, className) => {
    const iframe = document.createElement("iframe");
    iframe.className = className + " bili-embed";
    iframe.src = playerUrl(bv, true);
    iframe.title = "B 站视频播放器";
    iframe.setAttribute("loading", "lazy");
    iframe.allow = "fullscreen; autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    return iframe;
  };

  /* ---------- 1. 普通视频卡：封面 → 点击 → 原位换成 B 站播放器 ---------- */

  const enhanceCard = (video, bv) => {
    const poster = video.getAttribute("poster");
    const cover = document.createElement("button");
    cover.type = "button";
    cover.className = video.className + " bili-poster";
    cover.setAttribute("aria-label", "播放视频（B 站）");
    if (poster) cover.style.backgroundImage = 'url("' + poster + '")';
    cover.innerHTML = '<span class="bili-play" aria-hidden="true"></span>';

    cover.addEventListener("click", () => {
      const iframe = makeIframe(bv, video.className);
      cover.replaceWith(iframe);
    }, { once: true });

    video.hidden = true;
    video.setAttribute("aria-hidden", "true");
    // 阻止原有懒加载脚本再去拉 mp4
    video.removeAttribute("data-lazy-video");
    video.querySelectorAll("source[data-src]").forEach((s) => s.removeAttribute("data-src"));

    video.parentNode.insertBefore(cover, video);
  };

  /* ---------- 2. 首屏背景视频：换成静态封面 + 右下角播放键，点击弹层播放 ---------- */

  const enhanceHero = (video, bv) => {
    const poster = video.getAttribute("poster");
    const hero = video.closest(".gameplay-hero");
    if (!hero) return;

    if (poster) {
      hero.classList.add("bili-hero");
      hero.style.setProperty("--bili-hero-poster", 'url("' + poster + '")');
    }
    video.hidden = true;
    video.setAttribute("aria-hidden", "true");
    video.removeAttribute("data-lazy-video");
    video.pause();

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "bili-hero-play";
    trigger.innerHTML = '<span class="bili-play" aria-hidden="true"></span><span>看完整演示</span>';
    trigger.addEventListener("click", () => openLightbox(bv));
    hero.appendChild(trigger);
  };

  /* ---------- 3. 弹层 ---------- */

  const openLightbox = (bv) => {
    const wrap = document.createElement("div");
    wrap.className = "bili-lightbox";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-label", "视频播放");
    wrap.innerHTML =
      '<button type="button" class="bili-lightbox-close" aria-label="关闭">×</button>' +
      '<div class="bili-lightbox-stage"></div>';
    wrap.querySelector(".bili-lightbox-stage").appendChild(makeIframe(bv, "bili-lightbox-iframe"));

    const onKey = (e) => { if (e.key === "Escape") close(); };
    const close = () => {
      wrap.remove();
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
    wrap.addEventListener("click", (e) => {
      if (e.target === wrap || e.target.closest(".bili-lightbox-close")) close();
    });
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    document.body.appendChild(wrap);
  };

  /* ---------- 4. 启动 ---------- */

  const start = () => {
    const videos = [...document.querySelectorAll("video")];
    videos.forEach((video) => {
      const bv = bvOf(video);
      if (!bv) return; // 没填 BV 号 → 保持原样，走原来的 mp4 懒加载
      if (video.classList.contains("gameplay-hero-video")) {
        enhanceHero(video, bv);
      } else {
        enhanceCard(video, bv);
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
