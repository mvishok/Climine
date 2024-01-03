const eval = require("./eval");
const {setVariable, getVariable, dump, error} = require("./mem");
const {execSync} = require('child_process');
const fs = require("fs");

function display_(params) {
    const val = eval(params, def);
    if (typeof val == "object") {
        console.log(val.join(" "));
    } else {
        console.log(val);
    }
    return [0, "NumberLiteral"];
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
    } else if (statement[3].type == "ArrayExpression") {
        const val = eval(statement[3].value, def);
        setVariable(varName, val, "ArrayExpression");

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

//to read file
function read_(params) {
    const val = eval(params, def);
    try {
        return [fs.readFileSync(val, "utf8"), "StringLiteral"];
    } catch (err) {
        error(`${val} is not a file (core)`);
        return [0, "NumberLiteral"];
    }
}

//to write to file (overwrites)
function write_(params) {
    const val = eval(params, def);
    try {
        console.log(val[0], val[1]);
        fs.writeFileSync(val[0], val[1]);
    } catch (err) {
        error(`${val} is not a file (core)`);
    }
    return [0, "NumberLiteral"];
}

//to append to file
function append_(params) {
    const val = eval(params, def);
    try {
        fs.appendFileSync(val[0], val[1]);
    } catch (err) {
        error(`${val} is not a file (core)`);
    }
    return [0, "NumberLiteral"];
}

//to delete a file
function delete_(params) {
    const val = eval(params, def);
    try {
        fs.unlinkSync(val);
    } catch (err) {
        error(`${val} is not a file (core)`);
    }
    return [0, "NumberLiteral"];
}

//to check if a file exists
function exists_(params) {
    const val = eval(params, def);
    try {
        fs.accessSync(val);
        return [0, "NumberLiteral"];
    } catch (err) {
        return [1, "NumberLiteral"];
    }
}
//to run os shell commands
function cmd_(params) {
    const command = eval(params, def);

    try {
        // execute command synchronously and capture the output
        const output = execSync(command, { encoding: 'utf-8' });
        return [output, "StringLiteral"];
    } catch (error) {
        return [`${error.message} (core)`, "StringLiteral"];
    }

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
        return display_(statement);
    },
    set: function (statement){
        return set_(statement);
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
    read: function (params){
        return read_(params);
    },
    write: function (params){
        write_(params);
    },
    append: function (params){
        append_(params);
    },
    delete: function (params){
        delete_(params);
    },
    exists: function (params){
        return exists_(params);
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