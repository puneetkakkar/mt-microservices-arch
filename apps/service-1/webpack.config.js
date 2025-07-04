const { composePlugins, withNx } = require('@nx/webpack');

// // Nx plugins for webpack.
// module.exports = composePlugins(withNx(), (config) => {
//   // Note: This was added by an Nx migration. Webpack builds are required to have a corresponding Webpack config file.
//   // See: https://nx.dev/recipes/webpack/webpack-config-setup

//   config.externals = [nodeExternals()];

//   // Set Webpack target to Node
//   config.target = 'node';

//   // Suppress critical dependency warnings for NestJS dynamic imports
//   config.ignoreWarnings = [
//     {
//       module: /node_modules\/@nestjs/,
//     },
//     {
//       module: /node_modules\/express/,
//     },
//     {
//       module: /node_modules\/keyv/,
//     },
//     {
//       message:
//         /Critical dependency: the request of a dependency is an expression/,
//     },
//   ];

//   return config;
// });

// Nx plugins for webpack.
module.exports = composePlugins(
  withNx({
    target: 'node',
  }),
  (config) => {
    // Update the webpack config as needed here.
    // e.g. `config.plugins.push(new MyPlugin())`

    // Suppress critical dependency warnings for NestJS dynamic imports
    config.ignoreWarnings = [
      {
        module: /node_modules\/@nestjs/,
      },
      {
        module: /node_modules\/express/,
      },
      {
        module: /node_modules\/keyv/,
      },
      {
        message:
          /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
);
