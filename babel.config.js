module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.js', '.jsx', '.json'],
          alias: {
            '@assets': './src/assets',
            '@components': './src/components',
            '@config': './src/config',
            '@context': './src/context',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@providers': './src/providers',
            '@screens': './src/screens',
            '@services': './src/services',
            '@theme': './src/theme',
            '@utils': './src/utils',
            '@validation': './src/validation',
          },
        },
      ],
    ],
  };
};
