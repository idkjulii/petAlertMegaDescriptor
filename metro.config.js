const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración adicional para resolver problemas de módulos
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Resolver extensiones de archivo
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Configuración para evitar errores de bytecode
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;



