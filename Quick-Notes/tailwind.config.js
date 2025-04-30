/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
      maxHeight: {
        "90vh": "90vh",
        "85vh": "85vh",
        "80vh": "80vh",
      },
      minHeight: {
        "screen-75": "75vh",
        "screen-85": "85vh",
      },
      fontSize: {
        xxs: "0.625rem",
      },
    },
  },
  plugins: [
    // Add the scrollbar plugin with proper configuration
    require("tailwind-scrollbar")({
      preferredStrategy: "pseudoelements",
      nocompatible: true,
    }),
  ],
  variants: {
    scrollbar: ["dark", "rounded", "hover"],
  },
};
