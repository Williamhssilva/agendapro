/**
 * PM2 Ecosystem Configuration
 * Gerencia o processo do AgendaPro em produção
 */

module.exports = {
  apps: [
    {
      name: 'agendapro',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/agendapro/agendapro',
      instances: 1, // Para VPS pequeno, use 1. Para maior, use 'max' ou número específico
      exec_mode: 'fork', // 'fork' para VPS pequeno, 'cluster' para múltiplos cores
      
      // Variáveis de ambiente
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      
      // Logs
      error_file: '/var/www/agendapro/logs/pm2-error.log',
      out_file: '/var/www/agendapro/logs/pm2-out.log',
      log_file: '/var/www/agendapro/logs/pm2-combined.log',
      time: true,
      
      // Auto-restart
      autorestart: true,
      watch: false, // false em produção
      max_memory_restart: '500M', // Reinicia se passar de 500MB
      
      // Merge logs
      merge_logs: true,
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
};

