const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  context: __dirname,
  mode: 'production',
  plugins: [new CleanWebpackPlugin()],
  devtool: 'source-map',
  entry: './src/*.ts',
  resolve: {
    extensions: ['.tsx', '.ts', '.mjs', '.json'],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: 'commonjs',
    filename: 'index.js',
    path: path.join(__dirname, 'lib'),
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, 'lib'),
          ],
        ],
        options: {
          transpileOnly: false,
          experimentalWatchApi: true,
        },
      },
    ],
  },
}
