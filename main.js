const lexer = require("./lexer");
const parser = require("./parser");
const { def } = require("./core");
const fs = require("fs");

const { exit } = require("process");


//if filename is given in args, read the file and store it in fileContent
if (process.argv.length > 2) {
    const filePath = process.argv[2];
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, "utf8").replace(/[\r\n]+/g, "");
    } catch (error) {
        console.error(`Error reading the file: ${error.message}`);
        exit(1);
    }
    main(fileContent);
} else {
    const prompt = require("prompt-sync")();
    console.log("Welcome to Climine v0.1.0.\nType 'exit' to exit.");

    while(true){
        const input = prompt("> ");
        if(input === 'exit'){
            exit(0);
        }
        main(input);
    }
    
}

function main(input) {
    const tokens = lexer(input);
    const ast = parser(tokens);

    let current = [];

    let finalAST = [];

    ast["body"].forEach((token) => {
        current.push(token);
        if (token.type == "Delimiter" && token.value == ";") {
            finalAST.push({ statement: current });
            current = [];
        }
    });
    mainFlow: for (let statement of finalAST) {
        
        for (const [index, token] of statement["statement"].entries()){
            if (token.type == "Identifier") {
                if (statement["statement"][index+1].type == "CallExpression"){
                    if (def[token.value]){
                        def[token.value](statement["statement"][index+1].params);
                    } else {
                        console.log(`${token.value} is not defined (ast)`);
                        exit(1);
                    }
                }
                else if (token.value == "let"){
                    def['set'](statement["statement"]);
                    continue mainFlow;
                }
                else {
                    console.log(`${token.value} is not defined (ast)`);
                    exit(1);
                }
                
            }
            
        }
    }
}
