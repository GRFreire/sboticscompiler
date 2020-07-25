const path = require('path')

const loader = require('./loader')
const tokenizer = require('./tokenizer')
const parser = require('./parser')

function compiler (basePath, file, context) {
  const program = loader(path.resolve(basePath, file))
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath, context)
  return parsed
}

module.exports = compiler
