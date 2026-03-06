const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');
require('dotenv').config();

const HOST_URL = process.env.HOST_URL || "http://localhost:3000";

module.exports = withModuleFederationPlugin({

  name: 'remote-angular',

  exposes: {

    './AngularRoot': './src/mount.ts',
  },
  remotes: {
    "host_devpulse": `${HOST_URL}/assets/remoteEntry.js`,
  },

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

});
