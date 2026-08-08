const { spawnSync } = require('child_process');

const result = spawnSync(
  'npx',
  ['expo', 'export', '--platform', 'web', '--output-dir', 'webdist', '--clear'],
  {
    stdio: 'inherit',
    shell: true,
    cwd: `${__dirname}/..`,
    env: { ...process.env, EXPO_PUBLIC_API_BASE_URL: '/api/v1' },
  }
);

process.exit(result.status ?? 1);
