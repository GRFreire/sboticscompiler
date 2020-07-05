const command = {
  name: 'init',
  description: 'Create a sBotics c# project',
  alias: ['i'],
  run: async toolbox => {
    const {
      template,
      filesystem: { cwd },
      prompt: { ask },
      print: { success, error }
    } = toolbox

    try {
      const defaultName = cwd().split('/').pop()

      const questions = [
        { type: 'input', name: 'name', message: `name (${defaultName}): ` },
        { type: 'input', name: 'version', message: 'version (1.0.0): ' },
        { type: 'input', name: 'description', message: 'description: ' },
        { type: 'input', name: 'author', message: 'author: ' },
        { type: 'input', name: 'license', message: 'license (MIT): ' }
      ]

      let { name, version, description, author, license } = await ask(questions)

      name = name || defaultName
      version = version || '1.0.0'
      license = license || 'MIT'

      if (!name) {
        error('Project name must be specified')
        return undefined
      }

      await template.generate({
        template: 'sbproj.json.ejs',
        target: 'sbproj.json',
        props: { name, version, description, author, license }
      })

      success(`sBotics c# project ${name} created`)
    } catch (err) {
      error(err)
    }
  }
}

module.exports = command
