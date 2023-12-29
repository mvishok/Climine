const { appendFileSync } = require('fs');

var variables = {};
var scope = {};
var config = {
    scope: 'global',
}

function log(message) {
    if (config["log"]){
        appendFileSync(config["log"],message+"\n");
    }
}

function setVariable(name, value, type) {
    log('Setting variable: '+name+' with value: '+value+' type: '+type+' scope: '+config.scope+'\n');

    if (config.scope != "global"){
        scope[config.scope][name] = value;
        log('Set variable: '+name+' with value: '+value+' type: '+type+' scope: '+config.scope+' successfully\n');
        return;
    } else {
        variables[name] = {
            value: value,
            type: type
        };
        log('Set variable: '+name+' with value: '+value+' type: '+type+' scope: '+config.scope+' successfully\n');
    }
}

function getVariable(name) {
    log("Getting variable: "+name+"\n");
    if (config.scope != "global" && scope[config.scope][name]){
        log('Got variable: '+name+' with value: '+scope[config.scope][name]);
        return [scope[config.scope][name]];
    } else if (variables[name]) {
        log('Got variable: '+name+' with value: '+variables[name].value+' and type: '+variables[name].type+'\n');

        return [variables[name].value, variables[name].type];
    } else {
        return undefined; // or handle the case when the variable is not found
    }
}

function dump(def){
    log("Dumping variables\n");
    console.log(variables, scope, def);
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
    scope,
    log
}
