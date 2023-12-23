const { appendFileSync } = require('fs');
var variables = {}
var config = {}

function setVariable(name, value, type) {
    if (config["log"]){
        appendFileSync(config["log"], 'Setting variable: '+name+' with value: '+value+' and type: '+type+'\n');
    }
    variables[name] = {
        value: value,
        type: type
    };
    if (config["log"]){
        appendFileSync(config["log"], 'Set variable: '+name+' with value: '+value+' and type: '+type+' successfully\n');
    }
}

function getVariable(name) {
    if (config["log"]){
        appendFileSync(config["log"],"Getting variable: "+name+"\n");
    }
    if (variables[name]) {
        if (config["log"]){
            appendFileSync(config["log"],'Got variable: '+name+' with value: '+variables[name].value+' and type: '+variables[name].type+'\n');
        }
        return [variables[name].value, variables[name].type];
    } else {
        return undefined; // or handle the case when the variable is not found
    }
}

function dump(){
    if (config["log"]){
        appendFileSync(config["log"],"Dumping variables\n");
    }
    console.log(variables);
}

function error(message) {
    if (config["log"]){
        appendFileSync(config["log"],`Error: ${message}\n`);
    }
    if (config["mode"] == "script") {
        console.error(`Error: ${message}`);
        process.exit(1);
    } else {
        console.error(`Error: ${message}`);
    }
}

module.exports = {
    setVariable,
    getVariable,
    dump,
    error,
    config
}
