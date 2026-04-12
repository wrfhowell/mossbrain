import type { Entry, Media, PaginatedResponse, AuthState, VisitorNote } from "../types";
export declare function fetchEntries(cursor?: string, label?: string): Promise<PaginatedResponse<Entry>>;
export declare function fetchEntry(id: string): Promise<Entry>;
export declare function fetchMediaSample(): Promise<Media[]>;
export declare function fetchAuth(): Promise<AuthState>;
export declare function login(): void;
export declare function logout(): Promise<void>;
export declare function fetchVisitorNotes(): Promise<VisitorNote[]>;
export declare function postVisitorNote(body: string): Promise<VisitorNote>;
