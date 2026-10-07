import { createContext, useCallback, useContext, useLayoutEffect, useState } from "react";

const AppearanceContext = createContext(null);

const MIN_FONT_SIZE = 16;
const MAX_FONT_SIZE = 21;
const DEFAULT_FONT_SIZE = 16;
const STORAGE_KEY = "vitta.fontSize";

function clampFontSize(value) {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return DEFAULT_FONT_SIZE;
    }

    return Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, Math.round(numericValue)),
    );
}

function getStoredFontSize() {
    if (typeof window === "undefined") {
        return DEFAULT_FONT_SIZE;
    }

    return clampFontSize(window.localStorage.getItem(STORAGE_KEY));
}

export function AppearanceProvider({ children }) {
    const [fontSize, setFontSizeState] = useState(getStoredFontSize);

    const setFontSize = useCallback((value) => {
        setFontSizeState(clampFontSize(value));
    }, []);

    const resetFontSize = useCallback(() => {
        setFontSizeState(DEFAULT_FONT_SIZE);
    }, []);

    useLayoutEffect(() => {
        const scale = fontSize / DEFAULT_FONT_SIZE;

        document.documentElement.style.setProperty(
            "--font-scale",
            String(scale),
        );

        document.documentElement.style.setProperty(
            "--vitta-font-size",
            `${fontSize}px`,
        );

        window.localStorage.setItem(STORAGE_KEY, String(fontSize));
    }, [fontSize]);

    return (
        <AppearanceContext.Provider
            value={{
                fontSize,
                setFontSize,
                resetFontSize,
                minFontSize: MIN_FONT_SIZE,
                maxFontSize: MAX_FONT_SIZE,
            }}
        >
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const context = useContext(AppearanceContext);

    if (!context) {
        throw new Error(
            "useAppearance deve ser usado dentro de um AppearanceProvider.",
        );
    }

    return context;
}