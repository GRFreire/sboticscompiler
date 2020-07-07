const childProcess = require('child_process')

const compiler = require('../functions/compiler')

const package = require('../../package.json')

function exec (command) {
  if (!command) return
  return new Promise((resolve) => {
    let cmd = ''
    if (Array.isArray(command)) cmd = command.join(' && ')
    else cmd = command
    childProcess.exec(cmd, (err, stdout) => {
      if (err) return resolve(false)
      return resolve(stdout)
    })
  })
}

const command = {
  name: 'compile',
  description: 'Compile your sBotics c# code',
  alias: ['c'],
  run: async toolbox => {
    const {
      template,
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

      await template.generate({
        template: 'main.cs.ejs',
        target: `${outputFolder}/main.cs`,
        props: { program }
      })

      success(`Successfully compiled!`)

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
            'dotnet run'
          ]

          const out = await exec(commands)

          if (out === 'compiled without errors\n') {
            success('No errors were found!')
          } else {
            error('Some errors were found')
            info(out)
          }
        } catch (err) {
          error('Error on checking for errors')
          info(err)
        }
      } else {
        info('Code compiled but no errors were check')
        info(`See ${package.homepage} for more information`)
      }

    } catch (err) {
      error(err)
    }
  }
}

module.exports = command
