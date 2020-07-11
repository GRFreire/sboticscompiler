const fs = require('fs')

const tokenizer = require('./tokenizer')

function positionToLine (position, text) {
  const perLine = text.split('\n')
  let line = 0
  for (let i = 0; i < perLine.length; i++) {
    line += perLine[i].length
    if (line >= position) {
      line = i + 1
      break
    }
  }
  return line
}

function getFullLine (line, text) {
  const perLine = text.split('\n')
  const lineText = perLine[line - 1]
  return lineText
}

function handleErrors (error, program, sbProj) {
  const tokens = tokenizer(error)

  let line = -1
  let startErrorMessage = -1
  let endErrorMessage = -1

  for (let i = 0; i <= tokens.length; i++) {
    const token = tokens[i]
    if (token === undefined) continue
    if (token.type === 'paren' && token.value === '(') {
      if (tokens[i + 1].type === 'number') {
        line = tokens[i + 1].value
      }
      continue
    }

    if (token.type === 'set' && token.value === ':') {
      startErrorMessage = token.position + 2
      continue
    }

    if (token.type === 'array' && token.value === '[') {
      endErrorMessage = token.position - 1
      continue
    }
  }

  const errorMessage = error.split('')
    .splice(startErrorMessage, (endErrorMessage - startErrorMessage))
    .join('')

  const programTokens = tokenizer(program)

  const imports = programTokens.filter(programToken => {
    if (programToken.type !== 'comment') return false
    let comment = programToken.value
    comment = comment.split('')
    comment = comment.splice(0, 7)
    comment = comment.join('')
    return comment === '// SBC-'
  }).map(programToken => {
    let using = programToken.value
    using = using.split('')
    using.splice(0, 7)
    using = using.filter(char => char !== '-')
    using = using.join('')
    using = using.trim()

    return { ...programToken, value: using }
  }).map((using, i, arr) => {
    if (using.value !== '') {
      let innerImports = 0;
      for (let j = i + 1; j < arr.length; j++) {
        const usingComment = arr[j];
        if (usingComment.value === '') {
          if (innerImports > 0) innerImports--
          else return { ...using, end: usingComment.position }
        } else {
          innerImports++;
        }
      }
    }
    return using;
  })
  .filter(using => positionToLine(using.position, program) <= line && positionToLine(using.end, program) >= line && using.value !== '')

  const lastImport = imports.length > 0 ? imports[0].value : 'main'

  const mainFile = sbProj.main.split('/').filter(file => file.indexOf('.cs') !== -1).join('')
  const projectFolder = sbProj.main.split('/').filter(file => file !== mainFile).join('')

  let errorOnFile = ''
  if (lastImport === '') errorOnFile = `${mainFile}`
  else errorOnFile = `${lastImport}.cs`

  const cProgram = fs.readFileSync(`${sbProj.outputFolder}/dotnet/Program.cs`).toString()
  const errorLineContent = getFullLine(line, cProgram)

  const rootProgram = fs.readFileSync(`${projectFolder}/${errorOnFile}`).toString()
  const trueLine = positionToLine(rootProgram.indexOf(errorLineContent), rootProgram)

  return `${errorOnFile} (${trueLine}): ${errorMessage}  [${sbProj.cwd}/${projectFolder}/${errorOnFile}]`
}

module.exports = handleErrors
