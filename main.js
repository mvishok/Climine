const lexer = require("./lexer");
const parser = require("./parser");
const { def} = require("./core");
const eval = require("./eval");
const {readFileSync, appendFileSync} = require('fs');
var argv = require('minimist')(process.argv.slice(2));
const { error, config } = require("./mem");

if (argv['v']) {
    console.log("Climine v0.1.0");
    process.exit(0);
}

if (argv['log']){
    config["log"] = argv["log"];
    appendFileSync(config["log"], '\n----------------\nClimine v0.1.0\n\n---- START ----\n');
}

if (argv['_'].length > 0) {
    if (argv['log']){
        appendFileSync(config["log"], 'Reading script: ' + argv['_'][0] + '\n\n');
    }
    const filePath = argv['_'][0];
    let fileContent;
    try {
        fileContent = readFileSync(filePath, "utf8").replace(/[\r\n]+/g, "");
    } catch (error) {
        error(`Error reading the file: ${error.message}`);
    }
    config["mode"] = "script";
    start(fileContent);
} else {
    if (argv['log']){
        appendFileSync(config["log"], 'Interactive mode\n\n');
    }
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
    if (argv['log']){        
        appendFileSync(config["log"], "----LEXING----\nTokens: "+JSON.stringify(tokens, null, 2)+"\n\n");
    }
    const ast = parser(tokens);
    if (argv['log']){
        appendFileSync(config["log"], "----PARSING----\nAST: "+JSON.stringify(ast, null, 2)+"\n\n");
    }
    if (argv['log']){
        appendFileSync(config["log"], "----MAIN----\n");
    }
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
                        if (argv['log']){
                            appendFileSync(config["log"], 'Calling function: '+token.value+' with params: '+JSON.stringify(statement["statement"][index+1].params)+'\n');
                        }
                        const r = def[token.value](statement["statement"][index+1].params);
                        if (argv['log']){
                            appendFileSync(config["log"], 'Function returned: '+JSON.stringify(r)+'\n\n');
                        }
                    } else {
                        error(`${token.value} is not defined (ast)`);
                    }
                }
                else {
                    error(`${token.value} is not defined (ast)`);
                }
                continue mainFlow;
            }
            if (token.type == "Keyword"){
                if (token.value=="if"){
                    if (argv['log']){
                        appendFileSync(config["log"], '--IF-- [\n');
                    }
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        if (argv['log']){
                            appendFileSync(config["log"], '--ELSE-- [\n');
                        }
                        var elseBody = statement["statement"][4].statements;
                    }

                    if (eval(condition, def) == 1){ 
                        if (argv['log']){
                            appendFileSync(config["log"], 'Condition is true, executing body\n');
                        }   
                        main({body: body});
                    } else {
                        if (elseBody){
                            if (argv['log']){
                                appendFileSync(config["log"], 'Condition is false, executing elseBody\n');
                            }
                            main({body: elseBody});
                        }
                    }
                    if (argv['log']){
                        appendFileSync(config["log"], ']\n\n--END IF--\n\n');
                    }
                    continue mainFlow;
                } 
                if (token.value == "until"){
                    if (argv['log']){
                        appendFileSync(config["log"], '--UNTIL-- [\n');
                    }
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Else statement: '+JSON.stringify(statement["statement"][4].statements, null, 2)+'\n');
                        }
                        var elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) != 1){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Condition is false, executing body\n');
                        }
                        main({body: body});
                    }
                    if (elseBody){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Condition is true, executing elseBody\n');
                        }
                        main({body: elseBody});
                    }
                    if (argv['log']){
                        appendFileSync(config["log"], ']\n--END UNTIL--\n\n');
                    }
                    continue mainFlow;
                }
                if (token.value == "while"){
                    if (argv['log']){
                        appendFileSync(config["log"], '--WHILE-- [\n');
                    }
                    var condition = statement["statement"][1].params;
                    var body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        if (argv['log']){
                            appendFileSync(config["log"], '--ELSE-- [\n');
                        }
                        var elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) == 1){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Condition is true, executing body\n');
                        }
                        main({body: body});
                    }
                    if (elseBody){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Condition is false, executing elseBody\n');
                        }
                        main({body: elseBody});
                    }
                    if (argv['log']){
                        appendFileSync(config["log"], ']\n--END WHILE--\n\n');
                    }
                    continue mainFlow;
                }
                if (token.value == "try"){
                    config["try"] = true;
                    if (argv['log']){
                        appendFileSync(config["log"], '--TRY-- [\n');
                    }
                    let body = statement["statement"][1].statements;
                    let handleBody;
                    let finallyBody;
                    
                    if (statement['statement'].length > 2 && statement["statement"][2].type == "Keyword" && statement["statement"][2].value == "handle"){
                        if (argv['log']){
                            appendFileSync(config["log"], '--HANDLE-- [\n');
                        }
                        handleBody = statement["statement"][3].statements;
                    }

                    if (statement['statement'].length > 4 && statement["statement"][4].type == "Keyword" && statement["statement"][4].value == "finally"){
                        if (argv['log']){
                            appendFileSync(config["log"], '--FINALLY-- [\n');
                        }
                        finallyBody = statement["statement"][5].statements;
                    }

                    try {
                        if (argv['log']){
                            appendFileSync(config["log"], 'Executing body\n');
                        }
                        main({body: body});
                    } catch (e) {
                        if (handleBody){
                            if (argv['log']){
                                appendFileSync(config["log"], 'Executing handleBody\n');
                            }
                            main({body: handleBody});
                        }
                    }
                    if (finallyBody){
                        if (argv['log']){
                            appendFileSync(config["log"], 'Executing finallyBody\n');
                        }
                        main({body: finallyBody});
                    }
                    
                    if (argv['log']){
                        appendFileSync(config["log"], ']\n--END TRY--\n\n');
                    }
                    config["try"] = false;
                    continue mainFlow;
                }
                if (token.value == "let"){
                    if (argv['log']){
                        appendFileSync(config["log"], 'Calling setVariable with name: '+statement["statement"][1].value+' and value: '+JSON.stringify(statement["statement"][3])+'\n');
                    }

                    def['set'](statement["statement"]);
                    continue mainFlow;
                }
            } 
            
        }
    }
}
