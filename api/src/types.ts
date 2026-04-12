export interface MediaResponse {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

export interface EntryResponse {
  id: string;
  published_at: string;
  visibility: "public" | "private";
  body: string | null;
  media: MediaResponse[];
  labels: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface VisitorNoteResponse {
  id: string;
  body: string;
  created_at: string;
}
