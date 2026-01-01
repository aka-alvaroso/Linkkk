/**
 * PM2 Ecosystem Configuration
 * Configures log rotation and app settings
 */

module.exports = {
  apps: [
    {
      name: "v2",
      script: "./v2.js",
      instances: 1,
      exec_mode: "fork",

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      // Environment variables
      env: {
        NODE_ENV: "production",
      },

      // Log configuration - CRITICAL FOR LOG MANAGEMENT
      error_file: "~/.pm2/logs/v2-error.log",
      out_file: "~/.pm2/logs/v2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Log rotation settings
      max_size: "10M", // Rotate when log reaches 10MB
      max_files: 5, // Keep only last 5 log files
      compress: true, // Compress rotated logs (saves space)

      // Merge logs into single file per type
      merge_logs: true,

      // Don't create new logs on restart
      time: false,
    },
  ],
};
