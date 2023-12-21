
function parser(tokens){
    let current = 0;
    
    if (tokens.Length < 1){
        console.log("No tokens to parse");
        exit(1);
    }

    function walk(){
        let token = tokens[current];
        if(token.type === 'string'){
            current++;

            return {
                type: 'StringLiteral',
                value: token.value,
            };
        }

        if(token.type === 'identifier'){
            current++;

            return {
                type: 'Identifier',
                value: token.value,
            };
        }

        if(token.type === 'keyword'){
            current++;

            return {
                type: 'Keyword',
                value: token.value,
            };
        }

        if(token.type === 'operator'){
            current++;

            return {
                type: 'Operator',
                value: token.value,
            };
        }

        if(token.type === 'number'){
            current++;

            return {
                type: 'NumberLiteral',
                value: token.value,
            };
        }

        if(token.type === 'float'){
            current++;

            return {
                type: 'FloatLiteral',
                value: token.value,
            };
        }

        if(token.type === 'delimiter' && token.value === '('){

            let node = {
                type: 'CallExpression',
                params: [],
            };

            token = tokens[++current];

            while((token.type !== 'delimiter') || (token.type === 'delimiter' && token.value !== ')')){
                node.params.push(walk());
                token = tokens[current];
            }

            current++;

            return node;
        }

        //if it is a functional block "{}" , similarly store statements to "statements"
        if(token.type === 'delimiter' && token.value === '{'){
            let node = {
                type: 'BlockStatement',
                statements: [],
            };

            token = tokens[++current];

            while((token.type !== 'delimiter') || (token.type === 'delimiter' && token.value !== '}')){
                node.statements.push(walk());
                token = tokens[current];
            }

            current++;

            return node;
        }


        if(token.type == 'delimiter' && token.value === ';'){
            current++;

            return {
                type: 'Delimiter',
                value: token.value,
            };
        }

        console.log("error", token.type);
        current++;
    }

    let ast = {
        type: 'Program',
        body: [],
    };    
    
    while(current < tokens.length){
        ast.body.push(walk());
    }

    return ast;
}

module.exports = parser;