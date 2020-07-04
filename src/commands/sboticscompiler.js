const command = {
  name: 'sboticscompiler',
  run: async toolbox => {
    const { print } = toolbox

    print.success('Welcome to the sBotics c# compiler.\n')
    print.info('Type \'sboticscompiler -h\' to show all options.')
  }
}

module.exports = command
