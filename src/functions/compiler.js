const loader = require('./loader');
const tokenizer = require('./tokenizer');
const parser = require('./parser');

function compiler(base_path, file) {
    const program = loader(`${base_path}/${file}`);
    const tokens = tokenizer(program);
    const parsed = parser(program, tokens, base_path, this);
    return parsed;
}

module.exports = compiler;