const webpack = require('webpack');

module.exports = {
    publicPath: (process.env.VUE_APP_MODE === 'product' || process.env.VUE_APP_MODE === 'check') ? './' : '/',
    devServer: {
        https: true,
        port: 8080,
        watchOptions: {
            poll: true
        },
        overlay: {
            warnings: true,
            errors: true
        }
    },
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'windows.jQuery': 'jquery',
            }),
        ],
    },
};