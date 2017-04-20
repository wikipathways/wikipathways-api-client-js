const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: "bundle.min.js"
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
    /*
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        enforce: "pre",
        test: /\.tsx?$/,
        use: "source-map-loader"
      }
    ]
    //*/
  },
  devtool: "source-map",
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      sourceMap: true
    })
  ]
};
