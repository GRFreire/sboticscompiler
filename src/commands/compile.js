const childProcess = require('child_process')

const compiler = require('../functions/compiler')
const handleErrors = require('../functions/handleErrors')

const lib = require('../../package.json')

function exec (command) {
  if (!command) return
  return new Promise((resolve) => {
    let cmd = ''
    if (Array.isArray(command)) cmd = command.join(' && ')
    else cmd = command
    childProcess.exec(cmd, (err, stdout) => {
      if (err) return resolve(stdout)
      return resolve(stdout)
    })
  })
}

async function saveCode (template, outputFolder, program) {
  await template.generate({
    template: 'main.cs.ejs',
    target: `${outputFolder}/main.cs`,
    props: { program }
  })
}

function logErrors (out, program, sbProj) {
  const beginErrorLog = 'All projects are up-to-date for restore.'
  const endErrorLog = 'Build FAILED.'

  const beginErrorSection = out.indexOf(beginErrorLog) + beginErrorLog.length + 1
  const endErrorSection = out.indexOf(endErrorLog)

  const errors = out.split('')
    .splice(beginErrorSection, (endErrorSection - beginErrorSection))
    .join('')
    .split('\n')
    .filter(errorMessage => errorMessage)
    .map(errorMessage => '\n' + handleErrors(errorMessage, program, sbProj) + '\n')
    .join('')

  console.log(errors)
}

const command = {
  name: 'compile',
  description: 'Compile your sBotics c# code',
  alias: ['c'],
  run: async toolbox => {
    const {
      template,
      parameters: { options },
      filesystem: { cwd, read, dir },
      print: { success, error, info }
    } = toolbox

    try {
      const sbProj = await read('sbproj.json', 'json')

      if (!sbProj) {
        error('This folder has no sBotics project in it')
        info('Type \'sboticscompiler init\' to generate a project')
        return undefined
      }

      const { main, outputFolder, checkForErros } = sbProj

      if (!main) {
        error('There is no main file specified on your sbproj.json')
        return undefined
      }

      if (!outputFolder) {
        error('There is no outputFolder file specified on your sbproj.json')
        return undefined
      }

      const programIndexPath = `${cwd()}/${sbProj.main}`.split('/')
      const programIndexFile = programIndexPath.pop()
      const programPath = programIndexPath.join('/')

      const defaultContext = {
        usingStatments: []
      }

      const program = compiler(programPath, programIndexFile, defaultContext)

      if (checkForErros) {
        try {
          let commands = []

          await dir(`${outputFolder}/dotnet`)

          commands = [
            `cd ${outputFolder}/dotnet`,
            'cat dotnet.csproj'
          ]

          const hasCsProjectInitialized = await exec(commands)

          if (!hasCsProjectInitialized) {
            commands = [
              `cd ${outputFolder}/dotnet`,
              'dotnet new console'
            ]

            await exec(commands)
          }

          await template.generate({
            template: 'Program.cs.ejs',
            target: `${outputFolder}/dotnet/Program.cs`,
            props: { program }
          })

          commands = [
            `cd ${outputFolder}/dotnet`,
            'dotnet build'
          ]

          const out = await exec(commands)

          const succeeded = out.indexOf('succeeded') !== -1

          if (succeeded) {
            await saveCode(template, outputFolder, program)

            success(`Successfully compiled!`)
          } else if (options.force) {
            await saveCode(template, outputFolder, program)

            success('Code compiled and saved.')
            error('There are still some errors in your code, please check it out')

            if (options.output === 'dotnet') {
              info(out)
            } else {
              const cProgram = await read(`${outputFolder}/dotnet/Program.cs`)
              logErrors(out, cProgram, { ...sbProj, cwd: cwd() })
            }
          } else {
            error('Build failed due to errors')
            info('Code was not compiled. Use --force to compile it ignoring errors.')

            if (options.output === 'dotnet') {
              info(out)
            } else {
              const cProgram = await read(`${outputFolder}/dotnet/Program.cs`)
              logErrors(out, cProgram, { ...sbProj, cwd: cwd() })
            }
          }
        } catch (err) {
          error('Error on building program')
          info(err)
        }
      } else {
        info('Code compiled but no errors were check')
        info(`See ${lib.homepage} for more information`)
      }
    } catch (err) {
      error(err)
    }
  }
}

module.exports = command
