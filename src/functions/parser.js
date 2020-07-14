const loader = require('./loader')
const tokenizer = require('./tokenizer')

const codeIdentifier = (file) => `// SBC------- ${file}\n`
const separator = (str) => `\n// SBC-------${'-'.repeat(str.length + 1)}\n\n`

function compiler (basePath, file, context) {
  const program = loader(`${basePath}/${file}`)
  const tokens = tokenizer(program)
  const parsed = parser(program, tokens, basePath, context)
  return parsed
}

function replaceTextUsingParameter (file, basePath, context) {
  const alreadyUsing = context.usingStatements.indexOf(file)
  if (alreadyUsing === -1) {
    context.usingStatements.push(file)
    return compiler(basePath, `${file}.cs`, context)
  } else return ''
}

function parser (input, tokens, basePath, context) {
  const replacements = []
  for (let i = 0; i <= tokens.length; i++) {
    const token = tokens[i]
    if (token === undefined) continue
    if (token.type === 'name' && token.value === 'using') {
      if (tokens[i + 1].type === 'name') {
        let name = ''
        let importsCount = 0

        let j = i + 1
        while (true) {
          if (tokens[j].type === 'name') {
            name += tokens[j].value
            importsCount++
          } else if (tokens[j].type === 'propertyIdentifier') {
            name += '/'
            if (tokens[j + 1].type !== 'name') throw new Error('using statement file should not end on a "."')
          } else if (tokens[j].type === 'end') {
            break
          } else {
            throw new Error('using statement should end on a ";"')
          }
          j++
        }

        replacements.push({
          position: {
            start: i > 0 ? tokens[j - importsCount - 2].position : 0,
            end: tokens[j].position
          },
          replaceText: replaceTextUsingParameter(name, basePath, context),
          type: 'using',
          value: name
        })
        i = j
      } else {
        throw new Error('using statement should have a name next to it')
      }
    }
  }

  let program = input
  replacements.forEach((rp, i, arr) => {
    program = program.split('')
    const charactersToDelete = rp.position.end - rp.position.start + 1
    program.splice(rp.position.start, charactersToDelete)
    if (rp.replaceText !== undefined && rp.replaceText !== '') program[rp.position.start] = codeIdentifier(rp.value) + rp.replaceText + separator(rp.value)
    program = program.join('')
    for (let j = i + 1; j <= arr.length; j++) {
      if (!arr[j]) return
      arr[j].position.start += rp.replaceText.length + separator(rp.value).length + codeIdentifier(rp.value).length - charactersToDelete - 1
      arr[j].position.end += rp.replaceText.length + separator(rp.value).length + codeIdentifier(rp.value).length - charactersToDelete - 1
    }
  })

  return program
}
module.exports = parser
