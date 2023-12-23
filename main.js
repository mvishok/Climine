const lexer = require("./lexer");
const parser = require("./parser");
const { def} = require("./core");
const eval = require("./eval");
const fs = require("fs");

const { error, config } = require("./mem");


//if filename is given in args, read the file and store it in fileContent
if (process.argv.length > 2) {
    const filePath = process.argv[2];
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, "utf8").replace(/[\r\n]+/g, "");
    } catch (error) {
        error(`Error reading the file: ${error.message}`);
        process.exit(1);
    }
    config["mode"] = "script";
    start(fileContent);
} else {
    config["mode"] = "interactive";
    const prompt = require("prompt-sync")();
    console.log("Welcome to Climine v0.1.0.\nType 'exit' to exit.");

    while(true){
        const input = prompt("> ");
        if(input === 'exit'){
            process.exit(0);
        }
        start(input);
    }
    
}

function start(input) {
    const tokens = lexer(input);
    const ast = parser(tokens);
    main(ast);
}

function main(ast) {

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
                        error(`${token.value} is not defined (ast)`);
                    }
                }
                else {
                    error(`${token.value} is not defined (ast)`);
                }
                
            }
            if (token.type == "Keyword"){
                if (token.value=="if"){
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        var elseBody = statement["statement"][4].statements;
                    }

                    if (eval(condition, def) == 1){    
                        main({body: body});
                    } else {
                        if (elseBody){
                            main({body: elseBody});
                        }
                    }
                } else if (token.value == "until"){
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        var elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) != 1){
                        main({body: body});
                    }
                    if (elseBody){
                        main({body: elseBody});
                    }

                } else if (token.value == "while"){
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        var elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) == 1){
                        
                        main({body: body});
                    }
                    if (elseBody){
                        main({body: elseBody});
                    }
                } else if (token.value == "let"){
                    def['set'](statement["statement"]);
                    continue mainFlow;
                }
            } 
            
        }
    }
}
