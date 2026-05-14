module.exports = {
  apps: [
    {
      name: "linkkk-frontend-3000",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/linkkk/frontend",
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production",
      },

      error_file: "~/.pm2/logs/linkkk-frontend-3000-error.log",
      out_file: "~/.pm2/logs/linkkk-frontend-3000-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
