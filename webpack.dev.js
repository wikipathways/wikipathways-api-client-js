const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx", "json"]
  },
  module: {
    loaders: [
      {
        test: /\.ts(x?)/,
        loaders: [
          "shebang-loader",
          "ts-loader?" +
            JSON.stringify({ configFileName: "tsconfig.webpack.json" })
        ]
      }
    ]
  },
  devtool: "inline-source-map"
};
