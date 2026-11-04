/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/chat-assistant/**/*.{js,jsx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0c0a08',
        panel: '#14110d',
        line: '#2c241a',
        gold: '#d6ae67',
        goldsoft: '#f0d9a4',
        bone: '#efe6d6',
        mute: '#9a8f7d',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Jost', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        ping2: {
          '0%': { transform: 'scale(1)', opacity: '.55' },
          '80%,100%': { transform: 'scale(1.7)', opacity: '0' },
        },
        rise: {
          '0%': { transform: 'translateY(14px) scale(.97)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
        msg: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'none', opacity: '1' },
        },
      },
      animation: {
        ping2: 'ping2 2.6s cubic-bezier(0,0,.2,1) infinite',
        rise: 'rise .32s cubic-bezier(.2,.8,.2,1) both',
        msg: 'msg .25s ease-out both',
      },
    },
  },
  plugins: [],
};
