const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prevent Metro from resolving .node.js files (used by socket.io for Node-specific code)
config.resolver.resolverMainFields = ['browser', 'main'];
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== 'node.js');

module.exports = config;
