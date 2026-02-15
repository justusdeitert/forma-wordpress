/**
 * Forma Favicon — Webpack Configuration
 *
 * Builds the admin-favicon entry point with UnoCSS support.
 * Mirrors the theme webpack setup for consistency.
 *
 * @package FormaFavicon
 */
import type { Configuration, RuleSetRule } from 'webpack';
import defaultConfig from '@wordpress/scripts/config/webpack.config.js';
import path from 'path';
import UnoCSS from '@unocss/webpack';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wpConfig = defaultConfig as Configuration;

const config: Configuration = {
    ...wpConfig,
    entry: {
        'admin-favicon': path.resolve(__dirname, 'src/admin-favicon.tsx'),
    },
    output: {
        ...wpConfig.output,
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },
    plugins: [
        UnoCSS(),
        ...(wpConfig.plugins || []),
    ],
    resolve: {
        ...wpConfig.resolve,
        fullySpecified: false,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    module: {
        ...wpConfig.module,
        rules: [
            {
                test: /\.json$/,
                type: 'json',
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
            },
            ...(wpConfig.module?.rules || []).filter((rule): rule is RuleSetRule => {
                if (rule && typeof rule === 'object' && 'test' in rule && rule.test?.toString().includes('woff')) {
                    return false;
                }
                return true;
            }),
        ],
    },
};

export default config;
