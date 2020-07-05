const loader = require('./loader')
const tokenizer = require('./tokenizer')
const parser = require('./parser')

function compiler (basePath, file) {
  const program = loader(`${basePath}/${file}`)
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath)
  return parsed
}

module.exports = compiler
