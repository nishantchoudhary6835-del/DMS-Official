const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['webdist/*', 'dist/*', '.expo/*', 'node_modules/*'],
  },
  {
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['preview-proxy.js', 'scripts/**/*.js', 'babel.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        module: 'writable',
        process: 'readonly',
        require: 'readonly',
      },
    },
  },
];
