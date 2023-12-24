const lexer = require("./lexer");
const parser = require("./parser");
const { def} = require("./core");
const eval = require("./eval");
const {readFileSync, appendFileSync} = require('fs');
var argv = require('minimist')(process.argv.slice(2));
const { error, config, log, setVariable, scope } = require("./mem");

if (argv['v']) {
    console.log("Climine v0.1.0");
    process.exit(0);
}

if (argv['log']){
    config["log"] = argv["log"];
    log('\n----------------\nClimine v0.1.0\n\n---- START ----\n');
}

if (argv['_'].length > 0) {
    log('Reading script: ' + argv['_'][0] + '\n\n');
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
    log('Interactive mode\n\n');
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
    log("----LEXING----\nTokens: "+JSON.stringify(tokens, null, 2)+"\n\n");
    const ast = parser(tokens);
    log("----PARSING----\nAST: "+JSON.stringify(ast, null, 2)+"\n\n");
    log("----MAIN----\n");
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
                        log('Calling function: '+token.value+' with params: '+JSON.stringify(statement["statement"][index+1].params)+'\n');
                        const r = def[token.value](statement["statement"][index+1].params);
                        log('Function returned: '+JSON.stringify(r)+'\n\n');
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
                    log('--IF-- [\n');

                    let condition = statement["statement"][1].params;
                    let body = statement["statement"][2].statements;
                    let elseBody;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        log('--ELSE-- [\n');
                        elseBody = statement["statement"][4].statements;
                    }

                    if (eval(condition, def) == 1){ 
                        log('Condition is true, executing body\n');
                        main({body: body});
                    } else {
                        if (elseBody){
                            log('Condition is false, executing elseBody\n');

                            main({body: elseBody});
                        }
                    }
                    log(']\n\n--END IF--\n\n');
                    continue mainFlow;
                } 
                if (token.value == "until"){
                    log('--UNTIL-- [\n');
                    let condition = statement["statement"][1].params;
                    let body = statement["statement"][2].statements;
                    let elseBody;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        log('Else statement: '+JSON.stringify(statement["statement"][4].statements, null, 2)+'\n');
                        elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) != 1){
                        log('Condition is false, executing body\n');
                        main({body: body});
                    }
                    if (elseBody){
                        log('Condition is true, executing elseBody\n');
                        main({body: elseBody});
                    }
                    log(']\n--END UNTIL--\n\n');
                    continue mainFlow;
                }
                if (token.value == "while"){
                    log('--WHILE-- [\n');
                    let condition = statement["statement"][1].params;
                    let body = statement["statement"][2].statements;

                    if (statement["statement"][3].type == "Keyword" && statement["statement"][3].value == "else"){
                        log('--ELSE-- [\n');
                        elseBody = statement["statement"][4].statements;
                    }
                    while (eval(condition, def) == 1){
                        log('Condition is true, executing body\n');
                        main({body: body});
                    }
                    if (elseBody){
                        log('Condition is false, executing elseBody\n');
                        main({body: elseBody});
                    }
                    log(']\n--END WHILE--\n\n');
                    continue mainFlow;
                }
                if (token.value == "try"){
                    config["try"] = true;
                    log('--TRY-- [\n');
                    let body = statement["statement"][1].statements;
                    let handleBody;
                    let finallyBody;
                    
                    if (statement['statement'].length > 2 && statement["statement"][2].type == "Keyword" && statement["statement"][2].value == "handle"){
                        log('--HANDLE-- [\n');
                        handleBody = statement["statement"][3].statements;
                    }

                    if (statement['statement'].length > 4 && statement["statement"][4].type == "Keyword" && statement["statement"][4].value == "finally"){
                        log('--FINALLY-- [\n');
                        finallyBody = statement["statement"][5].statements;
                    }

                    try {
                        log('Executing body\n');
                        main({body: body});
                    } catch (e) {
                        if (handleBody){
                            log('Executing handleBody\n');

                            main({body: handleBody});
                        }
                    }
                    if (finallyBody){
                        log('Executing finallyBody\n');
                        main({body: finallyBody});
                    }
                    
                    log(']\n--END TRY--\n\n');
                    config["try"] = false;
                    continue mainFlow;
                }
                //user defined functions with scope
                if (token.value == "define"){
                    log('--DEFINE-- [\n');
                    let name = statement["statement"][1].value;
                    let params = statement["statement"][2].params;
                    let body = statement["statement"][3].statements;
                    scope[name] = [];
                    params.forEach((param) => {
                        if (param.type == "Identifier"){
                            scope[name][param.value] = null;
                        }
                    });

                    log('Defining function: '+name+' with params: '+JSON.stringify(params)+'\n');

                    def[name] = function(params){
                        params = eval(params, def);
                        
                        Object.keys(scope[name]).forEach((key, index) => {
                            scope[name][key] = params[index];
                        });

                        log('Executing body\n');
                        config["scope"] = name;
                        main({body: body});
                        config["scope"] = "global";
                    }
                    
                    log(']\n--END DEFINE--\n\n');
                    continue mainFlow;
                }

                if (token.value == "let"){
                    log('Calling setVariable with name: '+statement["statement"][1].value+' and value: '+JSON.stringify(statement["statement"][3])+'\n');

                    def['set'](statement["statement"]);
                    continue mainFlow;
                }
            } 
            
        }
    }
}
