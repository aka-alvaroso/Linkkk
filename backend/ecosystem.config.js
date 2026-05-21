module.exports = {
  apps: [
    {
      name: "linkkk-backend-4001",
      script: "./v2.js",
      cwd: "/var/www/linkkk/backend",
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production",
      },

      error_file: "~/.pm2/logs/linkkk-backend-4001-error.log",
      out_file: "~/.pm2/logs/linkkk-backend-4001-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: false,
    },
  ],
};
