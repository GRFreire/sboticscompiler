const loader = require('./loader');
const tokenizer = require('./tokenizer');

const separator = '\n\n// -------------------------\n';

function compiler(base_path, file) {
    const program = loader(`${base_path}/${file}`);
    const tokens = tokenizer(program);
    const parsed = parser(program, tokens, base_path, this);
    return parsed;
}

function replaceText(file, basePath) {
    return compiler(basePath, `${file}.cs`);
}

function parser(input, tokens, basePath) {
    const replacements = [];
    for (let i = 0; i <= tokens.length; i++) {
        token = tokens[i];
        if (token === undefined) continue;
        if (token.type === 'name' && token.value === 'using') {
            if (tokens[i + 1].type === 'name') {
                if (tokens[i + 2].type === 'end') {
                    replacements.push({
                        position: {
                            start: token.position,
                            end: tokens[i + 2].position,
                        },
                        replaceText: replaceText(tokens[i + 1].value, basePath)
                    });
                    i+= 2;
                } else {
                    throw new Error('using statment should end on a ";"');
                }
            } else {
                throw new Error('using statment should have a name next to it');
            }
        }
    }

    let program = input;
    replacements.forEach(rp => {
        program = program.split('');
        program.splice(rp.position.start, (rp.position.end - rp.position.start + 1));
        program[rp.position.start] = rp.replaceText + separator;
        program = program.join('');
    });

    return program
}
module.exports = parser;