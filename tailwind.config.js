// tailwind.config.js
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "rose-quartz": {
          500: "#AA98A9", // 원하는 HEX 코드
        },
        "serenity": {
          500: "#92A8D1",
        },
      },
    },
  },
  plugins: [],
};
