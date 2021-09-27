const path = require('path');
const fs = require('fs');

// measure webpack speed https://github.com/stephencookdev/speed-measure-webpack-plugin
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const { exit } = require('process');
const smp = new SpeedMeasurePlugin();

const APP_DIR = path.dirname(__dirname); // webapp
const BUILD_DIR = path.resolve(APP_DIR, 'build');

module.exports = smp.wrap({
  entry: path.join(APP_DIR, 'src', 'index.ts'),
  output: {
    path: BUILD_DIR,
    publicPath: '/',
    // filename: 'bundle.js',
    filename: 'index.js',
    libraryTarget: "umd"
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        // exclude: /node_modules/,
        use: [ "ts-loader" ],
        // use: [{ loader: "ts-loader", options: { allowTsInNodeModules: true }} ],
      },
      {
        test: /\.jsx?/,
        include: APP_DIR,
        // exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.svg$/,
        // use: ["@svgr/webpack"]
        use:["raw-loader"]
      },
      {
        test: /\.scss$/,
        include: APP_DIR,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        include: APP_DIR,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    // modules: ["node_modules", "node_modules/chonky/dist"],
    // alias: {
    //   "chonky/dist" : "node_modules/chonky/dist"
    // },
    fallback: {
      // required for chonky
      "path": require.resolve("path-browserify")
    }
  },
  externals: [
    // exclude peer dependencies from bundle
    // may want to move this to it's own webpack config that is specific for the jupyter widget
    /^@lumino\/.+$/,
    /^@jupyterlab\/.+$/,
    /^react$/
  ]
});
