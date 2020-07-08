const { system, filesystem } = require('gluegun')

const src = filesystem.path(__dirname, '..')

const lib = require('../package.json')

const cli = async cmd =>
  system.run(
    'node ' + filesystem.path(src, 'bin', 'sboticscompiler') + ` ${cmd}`
  )

test('outputs version', async () => {
  const output = await cli('--version')
  expect(output).toContain(lib.version)
})

test('outputs help', async () => {
  const output = await cli('--help')
  expect(output).toContain(lib.version)
})
