/* ============================================================================
   THE INSTALL SNIPPET
   ----------------------------------------------------------------------------
   One source for the tag, because it is quoted in three places now — the
   settings page, the install modal and the platform guides — and a snippet
   that disagrees with itself between two screens is the kind of thing an owner
   pastes once and then spends an afternoon debugging.
   ========================================================================== */

export const INSTALL_CDN = "cdn.poweredbyconcierge.com";

export const installSnippet = (siteId: string): string =>
  `<script src="https://${INSTALL_CDN}/agent.js"\n  data-site="${siteId}" defer></script>`;
