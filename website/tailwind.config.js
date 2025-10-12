/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Ahloop Brand Colors from Figma
                ahloop: {
                    void: {
                        DEFAULT: '#100F0E',
                        80: 'rgba(16,15,14,0.93)',
                        60: 'rgba(16,15,14,0.6)',
                        40: 'rgba(16,15,14,0.4)',
                        20: 'rgba(16,15,14,0.2)',
                        10: 'rgba(16,15,14,0.1)',
                    },
                    dusty: {
                        DEFAULT: '#D4C3BF',
                        80: 'rgba(212,195,191,0.8)',
                        60: 'rgba(212,195,191,0.6)',
                        40: 'rgba(212,195,191,0.4)',
                        20: 'rgba(212,195,191,0.2)',
                        10: 'rgba(212,195,191,0.1)',
                    },
                    misty: {
                        DEFAULT: '#ECE8E9',
                        80: 'rgba(236,232,233,0.8)',
                        60: 'rgba(236,232,233,0.6)',
                        40: 'rgba(236,232,233,0.4)',
                        20: 'rgba(236,232,233,0.2)',
                        10: 'rgba(236,232,233,0.1)',
                    },
                },
                // Semantic color mappings for common usage
                primary: {
                    DEFAULT: '#100F0E', // Void Black
                    light: '#D4C3BF',   // Dusty Mauve
                    lighter: '#ECE8E9', // Misty Noir
                },
                secondary: {
                    DEFAULT: '#D4C3BF', // Dusty Mauve
                    light: '#ECE8E9',   // Misty Noir
                },
                neutral: {
                    DEFAULT: '#ECE8E9', // Misty Noir
                    dark: '#D4C3BF',    // Dusty Mauve
                    darker: '#100F0E',  // Void Black
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
                'instrument-sans': ['var(--font-instrument-sans)'],
                'instrument-serif': ['var(--font-instrument-serif)'],
            },
            spacing: {
                // Custom spacing scale based on 0.1rem base unit (1px)
                '0.1': '0.1rem',   // 1px
                '0.2': '0.2rem',   // 2px
                '0.3': '0.3rem',   // 3px
                '0.4': '0.4rem',   // 4px
                '0.5': '0.5rem',   // 5px
                '0.6': '0.6rem',   // 6px
                '0.7': '0.7rem',   // 7px
                '0.8': '0.8rem',   // 8px
                '0.9': '0.9rem',   // 9px
                '1.0': '1.0rem',   // 10px
                '1.1': '1.1rem',   // 11px
                '1.2': '1.2rem',   // 12px
                '1.3': '1.3rem',   // 13px
                '1.4': '1.4rem',   // 14px
                '1.5': '1.5rem',   // 15px
                '1.6': '1.6rem',   // 16px
                '1.7': '1.7rem',   // 17px
                '1.8': '1.8rem',   // 18px
                '1.9': '1.9rem',   // 19px
                '2.0': '2.0rem',   // 20px
                '2.1': '2.1rem',   // 21px
                '2.2': '2.2rem',   // 22px
                '2.3': '2.3rem',   // 23px
                '2.4': '2.4rem',   // 24px
                '2.5': '2.5rem',   // 25px
                '2.6': '2.6rem',   // 26px
                '2.7': '2.7rem',   // 27px
                '2.8': '2.8rem',   // 28px
                '2.9': '2.9rem',   // 29px
                '3.0': '3.0rem',   // 30px
                '3.2': '3.2rem',   // 32px
                '3.6': '3.6rem',   // 36px
                '4.0': '4.0rem',   // 40px
                '4.7': '4.7rem',   // 47px
                '4.9': '4.9rem',   // 49px
                '5.7': '5.7rem',   // 57px
                '6.0': '6.0rem',   // 60px
                '8.0': '8.0rem',   // 80px
                '10.5': '10.5rem', // 105px
                '11.2': '11.2rem', // 112px
                '15.2': '15.2rem', // 152px
                '62.0': '62.0rem', // 620px
                '166.5': '166.5rem', // 1665px
            },
            fontSize: {
                // Custom font sizes in rem units
                '1.2': ['1.2rem', { lineHeight: '1.2' }],
                '1.4': ['1.4rem', { lineHeight: '1.4' }],
                '1.6': ['1.6rem', { lineHeight: '1.3' }],
                '1.7': ['1.7rem', { lineHeight: '1.4' }],
                '2.0': ['2.0rem', { lineHeight: '1.3' }],
                '2.4': ['2.4rem', { lineHeight: '1.3' }],
                '3.2': ['3.2rem', { lineHeight: '1' }],
                '4.0': ['4.0rem', { lineHeight: '1' }],
                '4.8': ['4.8rem', { lineHeight: '1' }],
                '6.0': ['6.0rem', { lineHeight: '1' }],

                // Semantic typography tokens - Updated with more appropriate UI sizes
                'display-xl': ['4.8rem', { lineHeight: '5.6rem' }],  // 48px / 56px
                'display-lg': ['3.2rem', { lineHeight: '3.8rem' }],  // 32px / 38px  
                'display-sm': ['2.4rem', { lineHeight: '2.8rem' }],  // 24px / 28px
                'body': ['1.6rem', { lineHeight: '2.4rem' }],        // 16px / 24px
                'body-sm': ['1.4rem', { lineHeight: '2.0rem' }],     // 14px / 20px
                'body-xs': ['1.2rem', { lineHeight: '1.6rem' }],     // 12px / 16px
            },
            letterSpacing: {
                '0.016': '-0.016rem',
                '0.024': '-0.024rem',
                '0.028': '-0.028rem',
                '0.08': '-0.08rem',
                '0.12': '-0.12rem',
            },
            borderRadius: {
                '1.2': '1.2rem',
                '2.0': '2.0rem',
            },
            backgroundImage: {
                'dot-pattern': 'radial-gradient(circle, #3c403c 1px, transparent 1px)',
                'dot-pattern-light': 'radial-gradient(circle, #D4C3BF 1px, transparent 1px)',
            },
            backgroundSize: {
                'dot': '1.2rem 1.2rem',
                'dot-large': '2.0rem 2.0rem',
            },
        },
    },
    plugins: [],
}
