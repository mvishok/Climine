const eval = require("./eval");
const {setVariable, getVariable, dump, error} = require("./mem");
const {exec} = require('child_process');

function display_(params) {
    const val = eval(params, def);
    if (typeof val == "object") {
        console.log(val.join(" "));
    } else {
        console.log(val);
    }
}

function set_(statement) {
    const varName = statement[1].value;
    if (statement[3].type == "CallExpression") {
        const val = eval(statement[3].params, def);
        if (typeof val == "number") {
            setVariable(varName, val, "NumberLiteral");
        } else if (typeof val == "string") {
            setVariable(varName, val, "StringLiteral");
        } else {
            setVariable(varName, val, "FloatLiteral");
        }
    } else if (statement[3].type == "Identifier") {
        
        //if it is a call expression
        if (statement[4].type == "CallExpression") {
            if (def[statement[3].value]){
                const val = def[statement[3].value](statement[4].params);
                setVariable(varName, val[0], val[1]);
            } else {
                error(`${statement[3].value} is not defined (core)`);
            }
        } else {
            const val = getVariable(statement[3].value);
            if (val) {
                setVariable(varName, val[0][0], val[0][1]);
            } else {
                error(
                    `Variable ${statement[3].value} is not defined`
                );
                return undefined;
            }
        }
    } else {
        const val = statement[3].value;
        setVariable(varName, val, statement[3].type);
    }
}

function input_(params) {
    const prompt = require("prompt-sync")();
    let input;
    val = eval(params, def);
    if (countParams(params) > 1) {
        input = prompt(val.join(" "));
    }
    else {
        input = prompt(val);
    }
    return [input, "StringLiteral"];
}

function sum_(params) {
    let sum = 0;
    params.forEach(element => {
        if (element.type == "NumberLiteral" || element.type == "FloatLiteral"){
            sum += parseFloat(element.value);
        }
    });
    return [sum, "NumberLiteral"];
}


function now(){
    return [Date.now(), "NumberLiteral"];
}

//to conevrt a string to a number
function num_(params) {
    const val = eval(params, def);
    
    if (!isNaN(parseFloat(val))) {
        return [parseFloat(val), "NumberLiteral"];
    } else {
        error(`${val} is not a number (core)`);
        return [0, "NumberLiteral"];
    }
}

//to run os shell commands
function cmd_(params) {
    const command = eval(params, def);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`${stderr}`);
            return;
        }
        console.log(`${stdout}`);
    });
}

function countParams(params){
    var count = 1;
    params.forEach(element => {
        if (element.type == "Delimiter" && element.value == ","){
            count++;
        }
    });
    return count;

}

const def = {
    display: function (statement){
        display_(statement);
    },
    set: function (statement){
        set_(statement);
    },
    input: function (params){
        return input_(params);
    },
    sum: function (params){
        return sum_(params);
    },
    now: function (){
        return now();
    },
    num: function (params){
        return num_(params);
    },
    cmd: function (params){
        return cmd_(params);
    },
    exit: function (){
        process.exit(0);
    },
    dump: function (){
        dump(def);
    },
};

module.exports = {def, display_, set_};