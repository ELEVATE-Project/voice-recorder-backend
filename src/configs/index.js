
require('./bull')()

const path = require('path')
global.PROJECT_ROOT_DIRECTORY = path.join(__dirname, '..')
