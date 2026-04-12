const headers = { "Content-Type": "application/json" };
const opts = { credentials: "include" };
async function json(url, init) {
    const res = await fetch(url, { ...opts, ...init });
    if (!res.ok)
        throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}
export function fetchEntries(cursor, label) {
    const params = new URLSearchParams();
    if (cursor)
        params.set("cursor", cursor);
    if (label)
        params.set("label", label);
    const qs = params.toString();
    return json(`/api/entries${qs ? `?${qs}` : ""}`);
}
export function fetchEntry(id) {
    return json(`/api/entries/${id}`);
}
export function fetchMediaSample() {
    return json("/api/entries/media-sample");
}
export function fetchAuth() {
    return json("/api/auth/me");
}
export function login() {
    window.location.href = "/api/auth/login";
}
export async function logout() {
    await fetch("/api/auth/logout", { ...opts, method: "POST" });
}
export function fetchVisitorNotes() {
    return json("/api/visitor-notes");
}
export function postVisitorNote(body) {
    return json("/api/visitor-notes", {
        method: "POST",
        headers,
        body: JSON.stringify({ body }),
    });
}
