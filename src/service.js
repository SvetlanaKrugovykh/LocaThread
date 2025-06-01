const Service = require('node-windows').Service
const path = require('path')

const scriptPath = path.join(__dirname, 'index.js')

const svc = new Service({
  name: 'LocaThreadBot',
  description: 'LocaThread Telegram Bot Service',
  script: scriptPath,
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: process.env.NODE_ENV || "production"
    }
  ]
})

svc.on('install', () => {
  console.log('Service installed')
  svc.start()
})
svc.on('uninstall', () => {
  console.log('Service uninstalled')
})
svc.on('alreadyinstalled', () => {
  console.log('Service already installed')
})
svc.on('start', () => {
  console.log('Service started')
})
svc.on('stop', () => {
  console.log('Service stopped')
})
svc.on('error', (err) => {
  console.error('Service error:', err)
})

const arg = process.argv[2]
if (arg === '--install') {
  svc.install()
} else if (arg === '--uninstall') {
  svc.uninstall()
} else {
  console.log('Используйте: node src/winService.js --install или --uninstall')
}