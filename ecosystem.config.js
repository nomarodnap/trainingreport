module.exports = {
  apps: [
    {
      name: 'training-report',
      script: 'server.js',
      instances: 4,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
    },
  ],
};
