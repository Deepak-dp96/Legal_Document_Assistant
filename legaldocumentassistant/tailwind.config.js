/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        display: ['SF Pro Display', 'Inter', 'sans-serif'],
      },
      colors: {
        'deep-navy': '#0a1628',
        'royal-blue': '#0D47FF',
        'neon-cyan': '#00E5FF',
        'soft-white': '#F8FAFF',
        'gunmetal': '#505A6B',
        'hologram-purple': '#B026FF',
        'hologram-pink': '#FF006E',
      },
      backgroundImage: {
        'mesh-gradient': 'linear-gradient(135deg, #07131F 0%, #0D47FF 50%, #00E5FF 100%)',
        'holographic': 'linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(13,71,255,0.1) 50%, rgba(176,38,255,0.1) 100%)',
        'agent-clause': 'linear-gradient(135deg, #00E5FF 0%, #0D47FF 100%)',
        'agent-risk': 'linear-gradient(135deg, #FF006E 0%, #07131F 100%)',
        'agent-drafting': 'linear-gradient(135deg, #B026FF 0%, #0D47FF 100%)',
        'agent-summary': 'linear-gradient(135deg, #00FF87 0%, #00E5FF 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.5)',
        'neon-blue': '0 0 20px rgba(13, 71, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(176, 38, 255, 0.5)',
        'glow': '0 0 40px rgba(0, 229, 255, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'mesh-move': 'meshMove 20s linear infinite',
        'particle': 'particle 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.5)',
            transform: 'scale(1)',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(0, 229, 255, 0.8)',
            transform: 'scale(1.02)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        meshMove: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
        particle: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(50px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}