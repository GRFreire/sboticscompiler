const compiler = require('../functions/compiler')

const command = {
  name: 'compile',
  description: 'Compile your sBotics c# code',
  alias: ['c'],
  run: async toolbox => {
    const {
      template,
      filesystem: { cwd, read },
      print: { success, error, info }
    } = toolbox

    try {
      const sbProj = await read('sbproj.json', 'json')

      if (!sbProj) {
        error('This folder has no sBotics project in it')
        info('Type \'sboticscompiler init\' to generate a project')
        return undefined
      }

      const { main, outputFolder } = sbProj

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
    } catch (err) {
      error(err)
    }
  }
}

module.exports = command
