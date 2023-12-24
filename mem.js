const { appendFileSync, cp } = require('fs');
var variables = {}
var functions = {}
var config = {}

function log(message) {
    if (config["log"]){
        appendFileSync(config["log"],message+"\n");
    }
}

function setVariable(name, value, type) {
    log('Setting variable: '+name+' with value: '+value+' and type: '+type+'\n');

    variables[name] = {
        value: value,
        type: type
    };
    log('Set variable: '+name+' with value: '+value+' and type: '+type+' successfully\n');

}

function getVariable(name) {
    log("Getting variable: "+name+"\n");

    if (variables[name]) {
        log('Got variable: '+name+' with value: '+variables[name].value+' and type: '+variables[name].type+'\n');

        return [variables[name].value, variables[name].type];
    } else {
        return undefined; // or handle the case when the variable is not found
    }
}

function dump(){
    log("Dumping variables\n");
    console.log(variables);
}

function error(message) {
    log(`Error: ${message}\n`);
    
    if (config["mode"] == "script") {
        if (config['try']) {
            throw new Error(`Error: ${message}`);
        } else {
            console.error(`Error: ${message}`);
            process.exit(1);
        }
    } else {
        console.error(`Error: ${message}`);
    }
}

module.exports = {
    setVariable,
    getVariable,
    dump,
    error,
    config,
    log
}
