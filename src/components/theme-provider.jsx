import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
    theme: "system",
    setTheme: () => null,
})

export function ThemeProvider({
    children,
    defaultTheme = "dark",
    storageKey = "vite-ui-theme",
    ...props
}) {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem(storageKey)
        if (stored === "light" || stored === "dark") {
            return stored
        }
        return defaultTheme === "light" ? "light" : "dark"
    })

    useEffect(() => {
        const root = window.document.documentElement

        root.classList.remove("light", "dark")
        const activeTheme = theme === "light" ? "light" : "dark"
        root.classList.add(activeTheme)
    }, [theme])

    const value = {
        theme: theme === "light" ? "light" : "dark",
        setTheme: (newTheme) => {
            const validTheme = newTheme === "light" ? "light" : "dark"
            localStorage.setItem(storageKey, validTheme)
            setTheme(validTheme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
