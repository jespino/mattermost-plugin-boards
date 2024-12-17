// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
const exec = require('child_process').exec;

const path = require('path');

const webpack = require('webpack');

const tsTransformer = require('@formatjs/ts-transformer');

const PLUGIN_ID = require(process.env.APP_TYPE === 'pages' ? '../plugin.pages.json' : '../plugin.json').id;
const NPM_TARGET = process.env.npm_lifecycle_event; //eslint-disable-line no-process-env

let mode = 'production';
let devtool;
const plugins = [];

if (NPM_TARGET === 'debug' || NPM_TARGET === 'debug:watch') {
    mode = 'development';
    devtool = 'source-map';
}

if (NPM_TARGET === 'build:watch' || NPM_TARGET === 'debug:watch' || NPM_TARGET === 'live-watch') {
    plugins.push({
        apply: (compiler) => {
            compiler.hooks.watchRun.tap('WatchStartPlugin', () => {
                // eslint-disable-next-line no-console
                console.log('Change detected. Rebuilding webapp.');
            });
            compiler.hooks.afterEmit.tap('AfterEmitPlugin', () => {
                let command = 'cd .. && make deploy-from-watch';
                if (NPM_TARGET === 'live-watch') {
                    command = 'cd .. && make deploy-to-mattermost-directory';
                }
                exec(command, (err, stdout, stderr) => {
                    if (stdout) {
                        process.stdout.write(stdout);
                    }
                    if (stderr) {
                        process.stderr.write(stderr);
                    }
                });
            });
        },
    });
}

const config = {
    entry: './src/plugin_entry.ts',
    resolve: {
        modules: [
            'src',
            'node_modules',
            path.resolve(__dirname),
        ],
        alias: {
            moment: path.resolve(__dirname, './node_modules/moment/'),
        },
        extensions: ['*', '.js', '.jsx', '.ts', '.tsx'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        getCustomTransformers: {
                            before: [
                                tsTransformer.transform({
                                    overrideIdFn: '[sha512:contenthash:base64:6]',
                                    ast: true,
                                }),
                            ],
                        },
                    },
                },
                exclude: [/node_modules/],

            },
            {
                test: /\.html$/,
                type: 'asset/resource',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    path.resolve(__dirname, 'loaders/globalScssClassLoader'),
                ],
            },
            {
                test: /\.css$/i,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(tsx?|js|jsx|mjs|html)$/,
                use: [
                ],
                exclude: [/node_modules/],
            },
            {
                test: /\.(png|eot|tiff|svg|ttf|jpg|gif)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]',
                    publicPath: '/static/',
                }
            },
            {
                test: /\.(woff2|woff)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[name][ext]',
                    publicPath: '/plugins/focalboard/static/',
                }
            },
        ],
    },
    devtool,
    mode,
    plugins,
};

config.resolve.alias['react-intl'] = path.resolve(__dirname, './node_modules/react-intl/');

config.externals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    redux: 'Redux',
    'react-redux': 'ReactRedux',
    'mm-react-router-dom': 'ReactRouterDom',
    'prop-types': 'PropTypes',
    'react-bootstrap': 'ReactBootstrap',
};

config.output = {
    devtoolNamespace: PLUGIN_ID,
    path: path.join(__dirname, '/dist'),
    publicPath: '/',
    filename: 'main.js',
};

config.plugins.push(new webpack.DefinePlugin({
    'APP_TYPE': JSON.stringify(process.env.APP_TYPE || 'boards'),
    'BASE_URL': JSON.stringify(process.env.APP_TYPE === 'pages' ? '/plugins/com.mattermost.pages' : '/plugins/focalboard'),
    'FRONTEND_URL': JSON.stringify(process.env.APP_TYPE === 'pages' ? '/pages' : '/boards'),
    'RUDDER_KEY': JSON.stringify(process.env.RUDDER_KEY || ''),
    'RUDDER_DATAPLANE_URL': JSON.stringify(process.env.RUDDER_DATAPLANE_URL || ''),
    'NODE_ENV': JSON.stringify(process.env.NODE_ENV || ''),
}));

module.exports = config;
