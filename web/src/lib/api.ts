import type { Entry, Media, PaginatedResponse, AuthState } from "../types";

const opts: RequestInit = { credentials: "include" };

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...opts, ...init });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// Pages warmed by prefetchEntries, keyed by cursor; each is handed out once so later visits refetch
const prefetched = new Map<string, Promise<PaginatedResponse<Entry>>>();

/** Walk the whole unlabelled archive in the background so the thoughts page opens instantly. */
export async function prefetchEntries() {
  let cursor: string | undefined;
  for (;;) {
    const key = cursor ?? "";
    if (prefetched.has(key)) return;
    const page = fetchEntries(cursor);
    prefetched.set(key, page);
    try {
      const res = await page;
      if (!res.has_more || !res.next_cursor) return;
      cursor = res.next_cursor;
    } catch {
      prefetched.delete(key);
      return;
    }
  }
}

export function fetchEntries(cursor?: string, label?: string) {
  if (!label) {
    const hit = prefetched.get(cursor ?? "");
    if (hit) {
      prefetched.delete(cursor ?? "");
      return hit;
    }
  }
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (label) params.set("label", label);
  const qs = params.toString();
  return json<PaginatedResponse<Entry>>(`/api/entries${qs ? `?${qs}` : ""}`);
}

export function fetchEntry(id: string) {
  return json<Entry>(`/api/entries/${id}`);
}

let prefetchedMedia: Promise<Media[]> | null = null;

/** Warm the thoughts page's photo graph alongside its entries. */
export function prefetchMediaSample() {
  prefetchedMedia ??= fetchMediaSample();
  prefetchedMedia.catch(() => (prefetchedMedia = null));
}

export function fetchMediaSample() {
  const hit = prefetchedMedia;
  prefetchedMedia = null;
  return hit ?? json<Media[]>("/api/entries/media-sample");
}

export function fetchAuth() {
  return json<AuthState>("/api/auth/me");
}

export function login() {
  window.location.href = "/api/auth/login";
}

export async function logout() {
  await fetch("/api/auth/logout", { ...opts, method: "POST" });
}
