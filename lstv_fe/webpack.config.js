const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const dotenv = require('dotenv');
const CopyPlugin = require('copy-webpack-plugin');
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');

// this config can be in webpack.config.js or other file with constants
const API_URL = {
    production: JSON.stringify('https://app.lovestoriestv.com'),
    development: JSON.stringify('http://0.0.0.0:8000'),
    development_mobile: JSON.stringify('http://10.125.63.110:8000'),
    development_ngrok: JSON.stringify('https://lstv2server.ngrok.io'),
    development_ngrok_r: JSON.stringify('https://lstv2server-r.ngrok.io'),
    staging: JSON.stringify('https://app.lstvtest.com'),
    test: JSON.stringify('https://app.lstvtest.com'),
};

module.exports = (env, argv) => {
    // check environment mode
    let environment;
    let publicServer;
    let usePort;    
    const { mode } = argv
    const isDev = mode === 'development'
    const devtool =  isDev ? 'cheap-module-eval-source-map' : 'source-map'

    switch (env.NODE_ENV) {
        case 'development-ngrok':
            environment = 'development_ngrok';
            publicServer = 'https://lstv2web-r.ngrok.io';
            usePort = 8080;
            break;
        case 'development-ngrok-r':
            environment = 'development_ngrok_r';
            publicServer = 'https://lstv2web-r2.ngrok.io';
            usePort = 8080;
            break;
        case 'development-ngrok-b':
            environment = 'test';
            publicServer = '';
            publicServer = 'https://lstv2web-b.ngrok.io';
            usePort = 8080;
            break;
        case 'development-ngrok-t':
            environment = 'staging';
            publicServer = '';
            publicServer = 'https://lstv2web-t.ngrok.io';
            usePort = 8080;
            break;
        case 'development-ngrok-t-2':
            environment = 'staging';
            publicServer = '';
            publicServer = 'https://lstv2web-t-2.ngrok.io';
            usePort = 8081;
            break;
        case 'development-ngrok-e':
            environment = 'test';
            publicServer = '';
            publicServer = 'https://lstv2web-e.ngrok.io';
            usePort = 8080;
            break;
        //duplicate above code
        case 'development-ngrok-i':
            environment = 'test';
            publicServer = '';
            publicServer = 'https://lstv2web-i.ngrok.io';
            usePort = 8080;
            break;
        case 'development-ngrok-a':
            environment = 'test';
            publicServer = '';
            publicServer = 'https://lstv2web-a.ngrok.io';
            usePort = 8080;
            break;
        case 'development-mobile':
            environment = 'development_mobile';
            usePort = 8080;
            break;
        case 'production':
            environment = 'production';
            usePort = 80;
            break;
        case 'staging':
            environment = 'staging';
            usePort = 80;
            break;
        default:
            environment = 'development';
            usePort = 8080;
            break;
    }

    // call dotenv and it will return an Object with a parsed key
    const envstrs = dotenv
        .config({
            path: environment !== 'staging' ? '__current_version_prod__' : '__current_version__'
        })
        .parsed;

    console.log(envstrs);

    // reduce it to a nice object, the same as before
    const envKeys = Object.keys(envstrs).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(envstrs[next]);
        return prev;
    }, {});

    return {
        devtool,
        resolve: {
            alias: {
                // if anyone knows how to make this work in one line with a wildcard, please do ...
                ['/components']: path.resolve(__dirname, 'src/components'),
                ['/global']: path.resolve(__dirname, 'src/global'),
                ['/hooks']: path.resolve(__dirname, 'src/hooks'),
                ['/images']: path.resolve(__dirname, 'src/images'),
                ['/newComponents']: path.resolve(__dirname, 'src/newComponents'),
                ['/rest-api']: path.resolve(__dirname, 'src/rest-api'),
                ['/store']: path.resolve(__dirname, 'src/store'),
                ['/stories']: path.resolve(__dirname, 'src/stories'),
                ['/styles']: path.resolve(__dirname, 'src/styles'),
                ['/utils']: path.resolve(__dirname, 'src/utils')
            },
            extensions: ['*', '.js', '.jsx', '.ts', '.tsx']
        },
        module: {
            rules: [
                {
                    test: /\.(tsx|ts)$/,
                    use: ['ts-loader'],
                    include: path.resolve(__dirname, 'src'),
                },
                {
                    test: /\.js$/,
                    include: path.resolve(__dirname, 'src'),
                    use: {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                isDev && require.resolve('react-refresh/babel'),
                            ].filter(Boolean),
                        }
                    },
                },
                {
                    type: 'javascript/auto',
                    test: '/.(json)/',
                    include: path.resolve(__dirname, 'src'),
                    use: [{
                        loader: 'file-loader',
                        options: { name: '[name].[ext]' },                        
                    }],
                },
                {
                    test: /\.scss$/,
                    use: [
                        'style-loader', // creates style nodes from JS strings
                        'css-loader', // translates CSS into CommonJS
                        'sass-loader', // compiles Sass to CSS, using Node Sass by default
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader', // creates style nodes from JS strings
                        'css-loader', // translates CSS into CommonJS
                    ],
                },
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: ['file-loader'],
                },
            ],
        },
        plugins: [
            env.NODE_ENV === 'staging' &&
                new BugsnagSourceMapUploaderPlugin({
                    apiKey: '1d1bac5918c34e78f7355d7d43846b06',
                    appVersion: envstrs.APP_VERSION,
                    publicPath: 'https://lstvtest.com/',
                }),
            env.NODE_ENV === 'production' &&
                new BugsnagSourceMapUploaderPlugin({
                    apiKey: '1d1bac5918c34e78f7355d7d43846b06',
                    appVersion: envstrs.APP_VERSION,
                    publicPath: 'https://lovestoriestv.com/',
                }),
            // (env.NODE_ENV === 'staging' || env.NODE_ENV === 'production') && new BundleAnalyzerPlugin(),
            // new CompressionPlugin({
            // 	test: /\.js(\?.*)?$/i,
            // }),
            isDev && new ReactRefreshWebpackPlugin(),
            new webpack.DefinePlugin({
                API_URL: API_URL[environment],
                ...envKeys,
            }),
            new HtmlWebPackPlugin({
                template: './src/index.html',
                filename: './index.html',
                title: 'Caching',
                favicon: './src/images/favicon1.ico',
            }),
            new CleanWebpackPlugin(),
            new WebpackPwaManifest({
                name: 'lstv2',
                short_name: 'lstv2',
                description: 'Love Stories TV 2',
                background_color: '#ffffff',
                crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
                icons: [
                    {
                        src: path.resolve('./src/images/lstv-logo.png'),
                        sizes: [96, 128, 192, 256, 384, 512], // multiple sizes
                    },
                ],
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'public/script', to: 'script' },
                    { from: 'public/images', to: 'images' },
                ],
            }),
        ].filter(function (plugin) {
            return plugin !== false;
        }),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'lstv2.[hash].js',
            publicPath: '/',
        },
        optimization: {
            minimize: env.NODE_ENV === 'staging',
            minimizer: [
                //
                // new UglifyJsPlugin({
                // 	uglifyOptions: {
                // 		ecma: 6,
                // 		warning: false,
                // 		comments: false,
                // 		mangle: true,
                // 		compress: {
                // 			sequences: true,
                // 			dead_code: true,
                // 			conditionals: true,
                // 			booleans: true,
                // 			unused: true,
                // 			if_return: true,
                // 			join_vars: true,
                // 			drop_console: true
                // 		}
                // 	},
                // 	parallel: true,
                // 	sourceMap: true,
                // 	cache: true
                // }),
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true, // Must be set to true if using source-maps in production
                    terserOptions: {
                        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                        compress: {
                            drop_console: true,
                        },
                    },
                }),
            ],
        },
        devServer: {
            allowedHosts: [
                'lstv2.loc',
                '0.0.0.0',
                'lovestoriestv.com',
                'lstv2web-t.ngrok.io',
                'lstv2web-e.ngrok.io',
                'lstv2web-b.ngrok.io',
                'lstv2web-r.ngrok.io',
                'lstv2web-e.ngrok.io',
                'lstv2web-a.ngrok.io',
                'devserver-rmagid.ngrok.io',
                'lstv2web2.ngrok.io',
            ],
            hot: true,
            disableHostCheck: true,
            port: usePort,
            historyApiFallback: true,
            // compress: true,
            public: publicServer,
        },
    };
};
