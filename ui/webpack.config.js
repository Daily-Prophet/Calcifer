const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const docsPath = "../docs/";

module.exports = {
  entry: "./src/main.js",
  output: {
    path: path.resolve(__dirname, docsPath),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/sw.js", to: docsPath },
        { from: "src/icon512.png", to: docsPath },
        { from: "src/manifest.json", to: docsPath },
      ],
    }),
  ],
};
