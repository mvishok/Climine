var variables = {}

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

module.exports = {
    setVariable,
    getVariable,
    dump
}
