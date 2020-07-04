const fs = require('fs')

function load (path) {
  const buffer = fs.readFileSync(path)
  return buffer.toString()
}

module.exports = load
