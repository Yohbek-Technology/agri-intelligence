const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Explicitly scope watchFolders to only the mobile app and its shared dependency
// Avoids watching apps/web, apps/server, and unnecessary workspace node_modules
config.watchFolders = [
  projectRoot,
  path.resolve(monorepoRoot, 'packages/shared'),
];

module.exports = config;


