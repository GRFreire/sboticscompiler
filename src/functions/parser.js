const loader = require('./loader')
const tokenizer = require('./tokenizer')

const separator = '\n\n// -------------------------\n'

function compiler (basePath, file) {
  const program = loader(`${basePath}/${file}`)
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath)
  return parsed
}

function replaceText (file, basePath) {
  return compiler(basePath, `${file}.cs`)
}

function parser (input, tokens, basePath) {
  const replacements = []
  for (let i = 0; i <= tokens.length; i++) {
    const token = tokens[i]
    if (token === undefined) continue
    if (token.type === 'name' && token.value === 'using') {
      if (tokens[i + 1].type === 'name') {
        if (tokens[i + 2].type === 'end') {
          replacements.push({
            position: {
              start: token.position,
              end: tokens[i + 2].position
            },
            replaceText: replaceText(tokens[i + 1].value, basePath)
          })
          i += 2
        } else {
          throw new Error('using statment should end on a ";"')
        }
      } else {
        throw new Error('using statment should have a name next to it')
      }
    }
  }

  let program = input
  replacements.forEach((rp, i, arr) => {
    program = program.split('')
    const charactersToDelete = rp.position.end - rp.position.start + 1
    program.splice(rp.position.start, charactersToDelete)
    program[rp.position.start] = rp.replaceText + separator
    program = program.join('')
    for (let j = i + 1; j <= arr.length; j++) {
      if (!arr[j]) continue
      arr[j].position.start += rp.replaceText.length + separator.length - charactersToDelete - 1
      arr[j].position.end += rp.replaceText.length + separator.length - charactersToDelete - 1
    }
  })

  return program
}
module.exports = parser
