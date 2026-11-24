module.exports = {
  apps: [
    {
      name: 'training-report',
      script: 'server.js',
      instances: 3,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      kill_timeout: 5000,
      listen_timeout: 8000,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
