/**
 * Forma Favicon — PostCSS Configuration
 *
 * @package FormaFavicon
 */
const path = require('path');
const postcssPlugins = require('@wordpress/postcss-plugins-preset');

let unoPluginPromise = null;

module.exports = {
    plugins: [
        {
            postcssPlugin: 'unocss-wrapper',
            async Once(root, { result }) {
                if (!unoPluginPromise) {
                    unoPluginPromise = import('@unocss/postcss/esm').then(async ({ createPlugin }) => {
                        return createPlugin({
                            configOrPath: path.resolve(__dirname, 'uno.config.ts'),
                        });
                    });
                }
                const unoPlugin = await unoPluginPromise;
                await unoPlugin(root, result);
            }
        },
        ...postcssPlugins,
    ],
};
