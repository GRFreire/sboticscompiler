const loader = require('./loader')
const tokenizer = require('./tokenizer')

const codeIndentifier = (file) => `// SBC------- ${file}\n`
const separator = (str) => `\n// SBC-------${'-'.repeat(str.length + 1)}\n\n`

function compiler (basePath, file, context) {
  const program = loader(`${basePath}/${file}`)
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath, context)
  return parsed
}

function replaceTextUsingParameter (file, basePath, context) {
  const alreadyUsing = context.usingStatments.indexOf(file)
  if (alreadyUsing === -1) {
    context.usingStatments.push(file)
    return compiler(basePath, `${file}.cs`, context)
  } else return undefined
}

function parser (input, tokens, basePath, context) {
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
            replaceText: replaceTextUsingParameter(tokens[i + 1].value, basePath, context),
            type: 'using',
            value: tokens[i + 1].value
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
    if (rp.replaceText !== undefined) program[rp.position.start] = codeIndentifier(rp.value) + rp.replaceText + separator(rp.value)
    program = program.join('')
    for (let j = i + 1; j <= arr.length; j++) {
      if (!arr[j]) return
      arr[j].position.start += rp.replaceText.length + separator(rp.value).length + codeIndentifier(rp.value).length - charactersToDelete - 1
      arr[j].position.end += rp.replaceText.length + separator(rp.value).length + codeIndentifier(rp.value).length - charactersToDelete - 1
    }
  })

  return program
}
module.exports = parser
