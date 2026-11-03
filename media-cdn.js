/*!
 * media-cdn.js — 国内访问加速层
 *
 * 作用：把页面里的媒体请求改写到阿里云 OSS（或其他对象存储 / CDN），
 *       绕开 GitHub Pages 在国内约 20KB/s 的下载速度。
 *
 * 用法：把下面的 MEDIA_BASE 填成你的 OSS Bucket 外网地址，结尾不要带斜杠。
 *       留空则一切保持原样（仍然走 GitHub 上的本地文件），不会有任何副作用。
 */
(() => {
  /* ============================================================
   *  ↓↓↓  只需要改这一行  ↓↓↓
   * ============================================================ */
  const MEDIA_BASE = "https://alistair2567-portfolio.oss-cn-hangzhou.aliyuncs.com";
  // 例如：const MEDIA_BASE = "https://alistair-media.oss-cn-hangzhou.aliyuncs.com";
  /* ============================================================ */

  const base = MEDIA_BASE.trim().replace(/\/+$/, "");
  if (!base) return; // 没配置就完全不动，保持原始行为

  const rewrite = (el, attr) => {
    const value = el.getAttribute(attr);
    if (!value || !value.startsWith("media/")) return;
    el.setAttribute(attr, `${base}/${value}`);
  };

  const apply = () => {
    document.querySelectorAll("video").forEach((video) => {
      if (video.getAttribute("src")) rewrite(video, "src");
      if (video.getAttribute("poster")) rewrite(video, "poster");

      video.querySelectorAll("source").forEach((source) => {
        if (source.dataset.src) rewrite(source, "data-src");
        if (source.getAttribute("src")) rewrite(source, "src");
      });

      // 已经带 src 的视频（首屏那个）需要重新加载才会走新地址
      if (video.getAttribute("src")) video.load();
    });

    // 图片（HUD 设计稿等）同样走加速
    document.querySelectorAll("img[src]").forEach((img) => rewrite(img, "src"));

    // CSS 里的背景图（background:url("media/...")）也改写到新地址
    rewriteCss();
  };

  // 遍历样式表，把 url("media/xxx") 换成新地址。跨域样式表读不到 cssRules，跳过即可。
  const rewriteCss = () => {
    const fix = (text) =>
      text.replace(/url\(\s*(["']?)(media\/[^"')]+)\1\s*\)/g, (m, q, path) => `url(${q}${base}/${path}${q})`);

    const walk = (rules) => {
      for (const rule of rules) {
        if (rule.cssRules && rule.cssRules.length) {
          walk(rule.cssRules);
          continue;
        }
        const style = rule.style;
        if (!style) continue;
        for (const prop of ["backgroundImage", "background", "borderImage", "content"]) {
          const value = style.getPropertyValue(
            prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())
          );
          if (value && value.includes("media/")) {
            style.setProperty(
              prop.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
              fix(value)
            );
          }
        }
      }
    };

    for (const sheet of document.styleSheets) {
      try {
        if (sheet.cssRules && sheet.cssRules.length) walk(sheet.cssRules);
      } catch {
        // 跨域样式表受同源策略限制，忽略
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();
