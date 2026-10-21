export interface Media {
  id: string;
  url: string;
  width: number;
  height: number;
  sort_order?: number;
  entry_id?: string;
}

export interface Entry {
  id: string;
  entry_number: number;
  published_at: string;
  visibility: "public" | "private";
  body: string | null;
  media: Media[];
  labels: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface AuthState {
  admin: boolean;
  email?: string;
}
