/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(240, 152, 19)",
        },
      },
      animation: {
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideDown: {
          "0%": { transform: "translateY(-100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
      screens: {
        xs: '475px',
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        '2.5': '0.625rem',
        '3.5': '0.875rem',
        18: "4.5rem",
        22: "5.5rem",
      },
      maxHeight: {
        "90vh": "90vh",
        "85vh": "85vh",
        "80vh": "80vh",
        "75vh": "75vh",
        "70vh": "70vh",
        "60vh": "60vh",
      },
      minHeight: {
        chat: "400px",
        "chat-sm": "500px",
        "chat-md": "600px",
      },
      scrollbar: {
        thin: {
          width: "6px",
          height: "6px",
        },
      },
    },
  },
  plugins: [
    // Add the scrollbar plugin with proper configuration
    require("tailwind-scrollbar")({ preferredStrategy: "pseudoelements", nocompatible: true }),
  ],
  variants: {
    scrollbar: ["dark", "rounded", "hover"],
  },
};
