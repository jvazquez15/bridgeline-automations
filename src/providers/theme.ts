import { createTheme } from "@aws-amplify/ui-react";

export const theme = createTheme({
    name: "hawksearch-theme",

    tokens: {
        fonts: {
            default: {
                variable: {
                    value: "InterVariable, 'Inter var', Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif",
                },
            },
        },

        colors: {
            brand: {
                primary: {
                    10: { value: "#fff7f0" },
                    20: { value: "#ffe9d6" },
                    40: { value: "#ffc799" },
                    60: { value: "#ff9d57" },
                    80: { value: "#ff7a1a" },
                    90: { value: "#e96d12" },
                    100: { value: "#cf5f09" },
                },
                orange: { value: "#f97316" },
            },

            background: {
                primary: { value: "#f5f5f5" },
                secondary: { value: "#ffffff" },
                tertiary: { value: "#dcecf7" },
                orange: { value: "#f97316" },
            },

            border: {
                primary: { value: "#d7dee7" },
                secondary: { value: "#e5e7eb" },
            },

            font: {
                primary: { value: "#111827" },
                secondary: { value: "#6b7280" },
                tertiary: { value: "#374151" },
                orange: { value: "#f97316" },
            },
        },

        components: {
            button: {
                fontWeight: { value: "700" },
                borderRadius: { value: "4px" },
                transitionDuration: { value: "0.2s" },

                primary: {
                    backgroundColor: { value: "{colors.brand.orange}" },
                    color: { value: "#ffffff" },
                    borderWidth: { value: "0" },
                    borderStyle: { value: "solid" },
                    borderColor: { value: "transparent" },

                    _hover: {
                        backgroundColor: { value: "{colors.brand.primary.90}" },
                        color: { value: "{colors.font.inverse}" },
                        borderColor: { value: "inherit" },
                    },

                    _active: {
                        backgroundColor: { value: "{colors.brand.primary.100}" },
                    },

                    _focus: {
                        borderColor: { value: "{colors.border.focus}" },
                        boxShadow: { value: "0 0 0 3px rgba(17,159,247,0.2)" },
                    },
                },
            },
        },
    },
});