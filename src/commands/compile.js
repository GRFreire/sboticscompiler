const childProcess = require('child_process')

const compiler = require('../functions/compiler')

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
          } else {
            error('Build failed due to errors')
            info('Code was not compiled. Use --force to compile it even with errors.')
          }

          info(out)
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
