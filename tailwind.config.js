/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: { nunito: ["Nunito", "sans-serif"] },
            colors: {
                cyan: {
                    50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9",
                    400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490",
                    800: "#155e75", 900: "#164e63",
                },
            },
            keyframes: {
                fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                blob: {
                    "0%": { transform: "translate(0px, 0px) scale(1)" },
                    "33%": { transform: "translate(30px, -50px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
                    "100%": { transform: "translate(0px, 0px) scale(1)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.5s ease-out",
                slideUp: "slideUp 0.8s ease-out",
                blob: "blob 7s infinite",
            },
        },
    },
    plugins: [],
};
