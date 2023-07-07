const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = function (options, {HotModuleReplacementPlugin, WatchIgnorePlugin}) {
    return {
        ...options,
        entry: ['webpack/hot/poll?100', options.entry],
        externals: [
            nodeExternals({
                allowlist: ['webpack/hot/poll?100'],
            }),
        ],
        node: {
            __dirname: true,
            __filename: true,
        },
        plugins: [
            ...options.plugins,
            require('unplugin-auto-import/webpack')({
                imports: [{
                    'rxjs': ['from','zip','map','of', 'switchMap', 'throwError','Observable' ,'catchError','tap'],
                    
                }],
                presets: [],
                dts: 'src/generated/auto-imports.d.ts',
            }),
            new HotModuleReplacementPlugin(),
            new WatchIgnorePlugin({
                paths: [/\.js$/, /\.d\.ts$/],
            }),
            new RunScriptWebpackPlugin({ name: options.output.filename, autoRestart: false }),
        ],
    };
};
