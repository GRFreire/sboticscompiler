function tokenizer(input) {
    let current = 0;

    let tokens = [];

    while (current < input.length) {
        let char = input[current];

        if (char === '(') {
            tokens.push({
                type: 'paren',
                value: '(',
                position: current,
            });

            current++;

            continue;
        }

        if (char === ')') {
            tokens.push({
                type: 'paren',
                value: ')',
                position: current,
            });
            current++;
            continue;
        }

        if (char === '{') {

            tokens.push({
                type: 'block',
                value: '{',
                position: current,
            });

            current++;

            continue;
        }

        if (char === '}') {
            tokens.push({
                type: 'block',
                value: '}',
                position: current,
            });
            current++;
            continue;
        }

        if (char === ';') {
            tokens.push({
                type: 'end',
                value: ';',
                position: current,
            });
            current++;
            continue;
        }

        let WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            current++;
            continue;
        }

        let NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
            const position = current;
            let value = '';

            while (NUMBERS.test(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({
                type: 'number',
                value,
                position,
                end: current,
            });

            continue;
        }

        if (char === '"') {
            const position = current;
            let value = '';

            char = input[++current];
            while (char !== '"') {
                value += char;
                char = input[++current];
            }

            char = input[++current];

            tokens.push({
                type: 'string',
                value,
                position,
                end: current,
            });

            continue;
        }

        let LETTERS = /(?:[a-z])|(?:[0-9])|(?:(?:_))/i;
        if (LETTERS.test(char)) {
            const position = current;
            let value = '';

            while (LETTERS.test(char)) {
                value += char;
                char = input[++current];
            }

            tokens.push({
                type: 'name',
                value,
                position,
                end: current,
            });

            continue;
        }

        current++;
        continue;
    }

    return tokens;
}

module.exports = tokenizer;