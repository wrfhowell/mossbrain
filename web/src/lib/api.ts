import type { Entry, Media, PaginatedResponse, AuthState, VisitorNote } from "../types";

const headers = { "Content-Type": "application/json" };
const opts: RequestInit = { credentials: "include" };

async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...opts, ...init });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export function fetchEntries(cursor?: string, label?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (label) params.set("label", label);
  const qs = params.toString();
  return json<PaginatedResponse<Entry>>(`/api/entries${qs ? `?${qs}` : ""}`);
}

export function fetchEntry(id: string) {
  return json<Entry>(`/api/entries/${id}`);
}

export function fetchMediaSample() {
  return json<Media[]>("/api/entries/media-sample");
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

export function fetchVisitorNotes() {
  return json<VisitorNote[]>("/api/visitor-notes");
}

export function postVisitorNote(body: string) {
  return json<VisitorNote>("/api/visitor-notes", {
    method: "POST",
    headers,
    body: JSON.stringify({ body }),
  });
}
