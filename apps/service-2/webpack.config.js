const { composePlugins, withNx } = require('@nx/webpack');

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
