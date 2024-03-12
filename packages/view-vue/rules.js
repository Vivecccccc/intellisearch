[
  /* config.module.rule('esm') */
  {
    test: /\.m?jsx?$/,
    resolve: {
      fullySpecified: false
    }
  },
  /* config.module.rule('vue') */
  {
    test: /\.vue$/,
    use: [
      /* config.module.rule('vue').use('vue-loader') */
      {
        loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-loader\\dist\\index.js',
        options: {
          cacheDirectory: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\.cache\\vue-loader',
          cacheIdentifier: 'd987f514',
          babelParserPlugins: [
            'jsx',
            'classProperties',
            'decorators-legacy'
          ]
        }
      }
    ]
  },
  /* config.module.rule('vue-style') */
  {
    test: /\.vue$/,
    resourceQuery: /type=style/,
    sideEffects: true
  },
  /* config.module.rule('pug') */
  {
    test: /\.pug$/,
    oneOf: [
      /* config.module.rule('pug').oneOf('pug-vue') */
      {
        resourceQuery: /vue/,
        use: [
          /* config.module.rule('pug').oneOf('pug-vue').use('pug-plain-loader') */
          {
            loader: 'pug-plain-loader'
          }
        ]
      },
      /* config.module.rule('pug').oneOf('pug-template') */
      {
        use: [
          /* config.module.rule('pug').oneOf('pug-template').use('raw') */
          {
            loader: 'raw-loader'
          },
          /* config.module.rule('pug').oneOf('pug-template').use('pug-plain-loader') */
          {
            loader: 'pug-plain-loader'
          }
        ]
      }
    ]
  },
  /* config.module.rule('svg') */
  {
    test: /\.(svg)(\?.*)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'img/[name].[hash:8][ext]'
    }
  },
  /* config.module.rule('images') */
  {
    test: /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/,
    type: 'asset',
    generator: {
      filename: 'img/[name].[hash:8][ext]'
    }
  },
  /* config.module.rule('media') */
  {
    test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
    type: 'asset',
    generator: {
      filename: 'media/[name].[hash:8][ext]'
    }
  },
  /* config.module.rule('fonts') */
  {
    test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
    type: 'asset',
    generator: {
      filename: 'fonts/[name].[hash:8][ext]'
    }
  },
  /* config.module.rule('css') */
  {
    test: /\.css$/,
    oneOf: [
      /* config.module.rule('css').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('css').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('css').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('css').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('css').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('css').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('css').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('css').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('css').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('css').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('css').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('css').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('css').oneOf('normal') */
      {
        use: [
          /* config.module.rule('css').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('css').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('css').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      }
    ]
  },
  /* config.module.rule('postcss') */
  {
    test: /\.p(ost)?css$/,
    oneOf: [
      /* config.module.rule('postcss').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('postcss').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('postcss').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('postcss').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('postcss').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('postcss').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('postcss').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('postcss').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('postcss').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('postcss').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('postcss').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('postcss').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      },
      /* config.module.rule('postcss').oneOf('normal') */
      {
        use: [
          /* config.module.rule('postcss').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('postcss').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('postcss').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          }
        ]
      }
    ]
  },
  /* config.module.rule('scss') */
  {
    test: /\.scss$/,
    oneOf: [
      /* config.module.rule('scss').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('scss').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('scss').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('scss').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('scss').oneOf('vue-modules').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('scss').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('scss').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('scss').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('scss').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('scss').oneOf('vue').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('scss').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('scss').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('scss').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('scss').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('scss').oneOf('normal-modules').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('scss').oneOf('normal') */
      {
        use: [
          /* config.module.rule('scss').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('scss').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('scss').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('scss').oneOf('normal').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  /* config.module.rule('sass') */
  {
    test: /\.sass$/,
    oneOf: [
      /* config.module.rule('sass').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('sass').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('sass').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('sass').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('sass').oneOf('vue-modules').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      },
      /* config.module.rule('sass').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('sass').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('sass').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('sass').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('sass').oneOf('vue').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      },
      /* config.module.rule('sass').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('sass').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('sass').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('sass').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('sass').oneOf('normal-modules').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      },
      /* config.module.rule('sass').oneOf('normal') */
      {
        use: [
          /* config.module.rule('sass').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('sass').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('sass').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('sass').oneOf('normal').use('sass-loader') */
          {
            loader: 'sass-loader',
            options: {
              sourceMap: false,
              sassOptions: {
                indentedSyntax: true
              }
            }
          }
        ]
      }
    ]
  },
  /* config.module.rule('less') */
  {
    test: /\.less$/,
    oneOf: [
      /* config.module.rule('less').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('less').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('less').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('less').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('less').oneOf('vue-modules').use('less-loader') */
          {
            loader: 'less-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('less').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('less').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('less').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('less').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('less').oneOf('vue').use('less-loader') */
          {
            loader: 'less-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('less').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('less').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('less').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('less').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('less').oneOf('normal-modules').use('less-loader') */
          {
            loader: 'less-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('less').oneOf('normal') */
      {
        use: [
          /* config.module.rule('less').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('less').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('less').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('less').oneOf('normal').use('less-loader') */
          {
            loader: 'less-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  },
  /* config.module.rule('stylus') */
  {
    test: /\.styl(us)?$/,
    oneOf: [
      /* config.module.rule('stylus').oneOf('vue-modules') */
      {
        resourceQuery: /module/,
        use: [
          /* config.module.rule('stylus').oneOf('vue-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('stylus').oneOf('vue-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2,
              modules: {
                localIdentName: '[name]_[local]_[hash:base64:5]',
                auto: () => true
              }
            }
          },
          /* config.module.rule('stylus').oneOf('vue-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('stylus').oneOf('vue-modules').use('stylus-loader') */
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('stylus').oneOf('vue') */
      {
        resourceQuery: /\?vue/,
        use: [
          /* config.module.rule('stylus').oneOf('vue').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('stylus').oneOf('vue').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('stylus').oneOf('vue').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('stylus').oneOf('vue').use('stylus-loader') */
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('stylus').oneOf('normal-modules') */
      {
        test: /\.module\.\w+$/,
        use: [
          /* config.module.rule('stylus').oneOf('normal-modules').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('stylus').oneOf('normal-modules').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('stylus').oneOf('normal-modules').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('stylus').oneOf('normal-modules').use('stylus-loader') */
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      },
      /* config.module.rule('stylus').oneOf('normal') */
      {
        use: [
          /* config.module.rule('stylus').oneOf('normal').use('vue-style-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\vue-style-loader\\index.js',
            options: {
              sourceMap: false,
              shadowMode: false
            }
          },
          /* config.module.rule('stylus').oneOf('normal').use('css-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\css-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              importLoaders: 2
            }
          },
          /* config.module.rule('stylus').oneOf('normal').use('postcss-loader') */
          {
            loader: 'E:\\dev\\codesearch\\intelliSearch\\packages\\view-vue\\node_modules\\postcss-loader\\dist\\cjs.js',
            options: {
              sourceMap: false,
              postcssOptions: {
                plugins: [
                  function () { /* omitted long function */ }
                ]
              }
            }
          },
          /* config.module.rule('stylus').oneOf('normal').use('stylus-loader') */
          {
            loader: 'stylus-loader',
            options: {
              sourceMap: false
            }
          }
        ]
      }
    ]
  }
]
