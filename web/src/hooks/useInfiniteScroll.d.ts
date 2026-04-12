import type { PaginatedResponse } from "../types";
interface Options<T> {
    fetcher: (cursor?: string) => Promise<PaginatedResponse<T>>;
}
export declare function useInfiniteScroll<T>({ fetcher }: Options<T>): {
    items: T[];
    loading: boolean;
    hasMore: boolean;
    error: Error | null;
    loadMore: () => Promise<void>;
    reset: () => void;
};
export {};
