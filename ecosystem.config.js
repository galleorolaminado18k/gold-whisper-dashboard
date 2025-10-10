module.exports = {
  apps: [
    {
      name: "gold-whisper-dashboard",
      script: "node_modules/.bin/serve",
      args: "-s dist -l 8081",
      cwd: "./",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 1000,
      max_restarts: 10,
      restart_delay: 4000
    },
    {
      name: "gold-whisper-api",
      script: "chatwoot.js",
      cwd: "./api",
      env: {
        NODE_ENV: "production",
        PORT: "4000",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      exp_backoff_restart_delay: 1000,
      max_restarts: 10,
      restart_delay: 4000
    },
    {
      name: "gold-whisper-chatwoot",
      script: "docker-compose",
      args: "up -d",
      cwd: "./",
      env: {
        NODE_ENV: "production"
      },
      instances: 1,
      autorestart: false, // Docker ya gestiona el reinicio
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 10000,
      exec_mode: "fork"
    }
  ]
};
