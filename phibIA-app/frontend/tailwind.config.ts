/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        function ({ addUtilities }: any) {
            const newUtilities = {
                '.scrollbar-hide': {
                    /* Firefox */
                    'scrollbar-width': 'none',
                    /* Chrome, Safari, Edge */
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                },
            };
            addUtilities(newUtilities);
        },
    ],
};

export default config;
