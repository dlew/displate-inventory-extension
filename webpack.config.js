const webpack = require('webpack');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/content-script.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'content-script.js',
    clean: true
  },
  plugins: [
    // We copy the manifest/icons manually (since they're not referenced by the source directly)
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/icons", to: "icons" },
      ]
    })
  ]
};
