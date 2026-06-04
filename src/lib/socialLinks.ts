import {
    emptySocialLinks,
    SOCIAL_PLATFORMS,
    type SocialLinkEntry,
    type SocialLinksMap,
    type SocialPlatformId,
} from "@/constants/socialPlatforms";

export function parseSocialLinks(raw: string | undefined): SocialLinksMap {
  const base = emptySocialLinks();
  if (!raw?.trim()) return base;
  try {
    const parsed = JSON.parse(raw) as Partial<
      Record<SocialPlatformId, Partial<SocialLinkEntry>>
    >;
    for (const platform of SOCIAL_PLATFORMS) {
      const entry = parsed[platform.id];
      if (!entry) continue;
      base[platform.id] = {
        enabled: Boolean(entry.enabled),
        handle: typeof entry.handle === "string" ? entry.handle.trim() : "",
      };
    }
  } catch {
    // Ignore malformed stored JSON and fall back to defaults.
  }
  return base;
}

export function serializeSocialLinks(links: SocialLinksMap): string {
  return JSON.stringify(links);
}

export function buildSocialUrl(
  platformId: SocialPlatformId,
  handle: string,
): string | null {
  const trimmed = handle.trim().replace(/^@/, "");
  if (!trimmed) return null;
  const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
  if (!platform) return null;
  return `https://${platform.baseUrl}${trimmed}`;
}

export function enabledSocialCount(links: SocialLinksMap): number {
  return SOCIAL_PLATFORMS.filter(
    (p) => links[p.id].enabled && links[p.id].handle.trim(),
  ).length;
}
