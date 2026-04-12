import { type ReactNode } from "react";
interface AuthCtx {
    admin: boolean;
    email?: string;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthCtx;
export {};
