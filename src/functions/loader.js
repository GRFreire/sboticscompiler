const fs = require('fs')

function load (path) {
  try {
    const buffer = fs.readFileSync(path)
    return buffer.toString()
  } catch (error) {
    console.log(`\nFile ${path} not exists, please check your imports.\n\n`)
    return '\n'
  }
}

module.exports = load
