var variables = {}
var config = {}

function setVariable(name, value, type) {
    variables[name] = {
        value: value,
        type: type
    };
}

function getVariable(name) {
    if (variables[name]) {
        return [variables[name].value, variables[name].type];
    } else {
        return undefined; // or handle the case when the variable is not found
    }
}

function dump(){
    console.log(variables);
}

function error(message) {
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
