/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        top: {
          DEFAULT: "#9e9fa0ff",
          darker: "#8f8e8eff",
          border: "#838282ff",
          dark: "#1a1a1dff",
          lighter: "#2e2e31ff",
          dborder: "#47474cff",
        },
        dropdown: {
          DEFAULT: "#cacbccff",
          dark: "#222225ff",
        },
        side: {
          DEFAULT: "#afb0b3ff",
          dark: "#1f1f22ff",
        },
        bg: {
          DEFAULT: "#c4c5c7ff",
          dark: "#252529ff",
          hover: "#b9b9bdff",
          dhover: "#1f1f22ff",
          orange: "#aa5e17ff",
        },
        surface: {
          DEFAULT: "#d4d5d8ff",
          dark: "#2f2f35ff",
          hover: "#cecdcdff",
          dhover: "#28282cff",
        },
        table: {
          DEFAULT: "#afafafff",
          dark: "#1f1f22ff",
        },
        grid: {
          DEFAULT: "#c0c1c2ff",
          dark: "#252529ff",
          hover: "#bebfc0ff",
          dhover: "#28282cff",
          top: "#b1b1b1ff",
          dtop: "#1f1f22ff",
          border: "#8e8e8fff",
          dborder: "#3f3f47ff",
          slot: "#ceced1ff",
          dslot: "#2f2f35ff",
          block: "#9e9fa0ff",
          dblock: "#232327ff",
        },
        input: {
          DEFAULT: "#dbd9d9ff",
          light: "#e0ddddff",
          border: "#c9c9c9ff",
          lighter: "#e9e7e7ff",
          dark: "#2f2f35ff",
          dlight: "#3a3a41ff",
          dborder: "#44444cff",
        },
        border: {
          DEFAULT: "#a8a8a8ff",
          dark: "#3f3f47ff",
        },
        mBorder: {
          DEFAULT: "#909092ff",
          lighter: "#b8b8b8ff",
          dark: "#5f5f6bff",
        },
        text: {
          primary: "#1f2937",
          secondary: "#424b57ff",
          muted: "#5b606bff",
          darkPrimary: "#d4d4d4ff",
          darkSecondary: "#cacacaff",
          darkMuted: "#acacb3ff",
        },
        dButton: {
          DEFAULT: "#4d4d57ff",
          border: "#5f5f6bff",
          hover: "#3e3e46ff",
          mbg: "#4a4a53ff",
          mborder: "#575763ff",
          mhover: "#3e3e46ff",
        },
        primary: {
          DEFAULT: "#2563eb",
          light: "#6e95e9ff",
          lighter: "#a1b9ecff",
          dlight: "#5083f1ff",
          dlighter: "#7893ceff",
          ddarker: "#123072ff",
          hover: "#1d4ed8",
        },
        grncon: {
          DEFAULT: "#02a152ff",
          light: "#25eb71ff",
          hover: "#1a9147ff",
        },
        reddel: {
          DEFAULT: "#d40404ff",
          border: "#c50303ff",
          hover: "#be0606ff",
          dark: "#e00505ff",
          dborder: "#c50303ff",
          dhover: "#c70404ff",
        },
        toggle: {
          DEFAULT: "#d4d5d8ff",
          dark: "#80808aff",
        },
      },
      transitionProperty: {
        "opacity-transform": "opacity, transform",
      },
      transitionTimingFunction: {
        "soft-in": "cubic-bezier(0.4, 0, 0.2, 1)",
        "soft-out": "cubic-bezier(0.2, 0, 0, 1)",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "toast-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
        "toast-enter": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        "modal-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "modal-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(20px)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out forwards",
        "toast-out": "toast-out 0.15s ease-in forwards",
        "toast-enter": "toast-enter 0.25s ease-out",
        "modal-in": "modal-in 0.25s ease-out forwards",
        "modal-out": "modal-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
