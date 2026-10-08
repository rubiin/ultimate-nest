const { RunScriptWebpackPlugin } = require("run-script-webpack-plugin");

/**
 * Rspack counterpart to the former `webpack-hmr.js`. `@rspack/core` ships no HMR
 * client for a forked Node process, so rebuilds restart the server instead of
 * hot-swapping it.
 */
module.exports = function (options) {
  return {
    // Preserves source directory paths, which `src/lib/i18n` and the serve-static
    // module rely on for `resources/`.
    node: { __dirname: true, __filename: true },
    plugins: [
      ...options.plugins,
      new RunScriptWebpackPlugin({
        autoRestart: true,
        name: options.output.filename,
      }),
    ],
  };
};
