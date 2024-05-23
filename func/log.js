import chalk from 'chalk';

export function prettyLog(message, type = 'info') {
  const timestamp = chalk.gray(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta', hour12: false }));
  switch (type.toLowerCase()) {
    case 'error':
      console.log(`[${timestamp}] ${chalk.red('[ERROR]')}: ${message}`);
      break;
    case 'warning':
      console.log(`[${timestamp}] ${chalk.yellow('[WARNING]')}: ${message}`);
      break;
    case 'info':
    default:
      console.log(`[${timestamp}] ${chalk.blue('[INFO]')}: ${message}`);
      break;
  }
}

