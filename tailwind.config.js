/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '!./app/virtual-experiences/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'ping-slow': 'ping 5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        morph: {
          '0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
          '100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' }
        },
        float: {
          '0%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
          '100%': { transform: 'translateY(0px) rotate(360deg)' }
        },
        twinkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.2, transform: 'scale(0.5)' }
        }
      },
      transitionDelay: {
        '2000': '2000ms',
        '4000': '4000ms',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        russo: ['var(--font-russo)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 