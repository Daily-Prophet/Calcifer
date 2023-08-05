module.exports = {
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.{html,js}"],
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
