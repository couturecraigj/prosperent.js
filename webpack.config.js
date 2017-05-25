
const fs = require('fs')
const path = require('path')

function getExternals ()/*: Object */ {
  const nodeModules = fs.readdirSync(path.join(process.cwd(), 'node_modules'))
  return nodeModules.reduce(function (ext/*: Object */, mod/*: string */)/*: Object */ {
    ext[mod] = 'commonjs ' + mod
    return ext
  }, {})
}

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            "presets": [
              [ "es2015", { "modules": false } ],
              "es2017"
            ],
            "plugins": ["transform-flow-strip-types"],
            "env": {
              "test": {
                "plugins": [
                  "transform-es2015-modules-commonjs",
                  "transform-flow-strip-types"
                ]
              }
            }
          }
        }
      }
    ]
  },
  externals: getExternals()
}