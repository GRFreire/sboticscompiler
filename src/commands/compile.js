const os = require('os')
const platform = os.platform()
const isWindows = platform.indexOf('win') !== -1
const slash = isWindows ? '\\' : '/'

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

async function saveCode (template, outputFolder, program, sbProj) {
  await template.generate({
    template: 'main.cs.ejs',
    target: `${outputFolder}${slash}main.cs`,
    props: {
      program,
      name: sbProj.name,
      version: sbProj.version,
      credits: sbProj.author ? sbProj.author.reduce((previousValue, currentValue) => {
        previousValue += `, ${currentValue}`
        return previousValue
      }) : '',
      license: sbProj.license
    }
  })
}

function logErrors (out, program, sbProj, options) {
  try {
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
  } catch (err) {
    if (options.verbose) {
      console.log('\n')
      console.log(err)
    } else {
      console.log('\n\nFailed to check for errors.\n')
      console.log(`Try using '--output=dotnet' to show the original error code.`)
      console.log(`You can also use '--verbose' to see the js exception and report it`)
    }
  }
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

      const { main, outputFolder, checkForErrors } = sbProj

      if (!main) {
        error('There is no main file specified on your sbproj.json')
        return undefined
      }

      if (!outputFolder) {
        error('There is no outputFolder file specified on your sbproj.json')
        return undefined
      }

      const mainFileExists = await exec(`${isWindows ? 'type' : 'cat'} ${cwd()}${slash}${sbProj.main}`)

      if (!mainFileExists) {
        error(`There is no ${main} file or it is empty`)
        return undefined
      }

      const programIndexPath = `${cwd()}${slash}${sbProj.main}`.split(slash)
      const programIndexFile = programIndexPath.pop()
      const programPath = programIndexPath.join(slash)

      const defaultContext = {
        usingStatements: []
      }

      const program = compiler(programPath, programIndexFile, defaultContext)

      if (checkForErrors) {
        try {
          let commands = []

          await dir(`${outputFolder}${slash}dotnet`)

          commands = [
            `cd ${outputFolder}${slash}dotnet`,
            `${isWindows ? 'type' : 'cat'} dotnet.csproj`
          ]

          const hasCsProjectInitialized = await exec(commands)

          if (!hasCsProjectInitialized) {
            commands = [
              `cd ${outputFolder}${slash}dotnet`,
              'dotnet new console'
            ]

            await exec(commands)
          }

          await template.generate({
            template: 'Program.cs.ejs',
            target: `${outputFolder}${slash}dotnet${slash}Program.cs`,
            props: { program }
          })

          commands = [
            `cd ${outputFolder}${slash}dotnet`,
            'dotnet build'
          ]

          const out = await exec(commands)

          const succeeded = out.indexOf('succeeded') !== -1

          if (succeeded) {
            await saveCode(template, outputFolder, program, sbProj)

            success(`Successfully compiled!`)
            info(`Check ${outputFolder}${slash}main.cs to see your changes.`)
          } else if (options.force) {
            await saveCode(template, outputFolder, program, sbProj)

            success('Code compiled and saved.')
            error('There are still some errors in your code, please check it out')

            if (options.output === 'dotnet') {
              info(out)
            } else {
              const cProgram = await read(`${outputFolder}${slash}dotnet${slash}Program.cs`)
              logErrors(out, cProgram, { ...sbProj, cwd: cwd() })
            }
          } else {
            error('Build failed due to errors')
            info('Code was not compiled. Use --force to compile it ignoring errors.')

            if (options.output === 'dotnet') {
              info(out)
            } else {
              const cProgram = await read(`${outputFolder}${slash}dotnet${slash}Program.cs`)
              logErrors(out, cProgram, { ...sbProj, cwd: cwd() }, options)
            }
          }
        } catch (err) {
          error('Error on building program')
          info(err)
        }
      } else {
        await saveCode(template, outputFolder, program, sbProj)

        success('Code compiled but no errors were check')
        info(`See ${lib.repository.base_url}/blob/master/docs/requirements.md for more information`)
      }
    } catch (err) {
      if (options.verbose) {
        console.log('\n')
        console.log(err)
      } else {
        error('\nFailed to check for errors.\n')
        console.log(`You can also use '--verbose' to see the js exception and report it`)
      }
    }
  }
}

module.exports = command
