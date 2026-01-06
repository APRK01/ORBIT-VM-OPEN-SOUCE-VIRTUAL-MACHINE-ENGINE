/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
            },
            colors: {
                orbit: {
                    bg: '#f5f5f7',
                    sidebar: 'rgba(255, 255, 255, 0.72)',
                    card: '#ffffff',
                    accent: '#0071e3',
                    text: '#1d1d1f',
                    muted: '#86868b',
                }
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
