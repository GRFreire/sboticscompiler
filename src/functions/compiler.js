const os = require('os')
const platform = os.platform()
const isWindows = platform.indexOf('win') !== -1
const slash = isWindows ? '\\' : '/'

const loader = require('./loader')
const tokenizer = require('./tokenizer')
const parser = require('./parser')

function compiler (basePath, file, context) {
  const program = loader(`${basePath}${slash}${file}`)
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath, context)
  return parsed
}

module.exports = compiler
