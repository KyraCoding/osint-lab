/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,js,ejs}"],
  theme: {
    extend: {
      fontFamily: {
        // font_name: ['"official font family name"': "font-name"]
        roboto: ['"roboto mono"', "sans-serif"],
      },
      animation: {
        fadein: "fadein 0.2s ease-in-out",
        longerfadein: "fadein 0.5s ease-in-out",
        fadeout: "fadeout 0.2s ease-in-out",
        longerfadeout: "fadeout 0.5s ease-in-out",
        slidetoleft: "slidetoleft 5.5s linear",
      },
      keyframes: (theme) => ({
        fadein: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeout: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        slidetoleft: {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },
      }),
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
