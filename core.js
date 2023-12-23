const eval = require("./eval");
const {setVariable, getVariable, dump} = require("./mem");
const {exit} = require("process");

function display_(params) {
    console.log(eval(params, def));
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
                console.log(`${statement[3].value} is not defined (core)`);
                exit(1);
            }
        } else {
            const val = getVariable(statement[3].value);
            if (val) {
                setVariable(varName, val[0][0], val[0][1]);
            } else {
                console.log(
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
    const input = prompt(eval(params, def));
    return [input, "StringLiteral"];
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
        console.log(`${val} is not a number (core)`);
        return [0, "NumberLiteral"];
    }
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
    now: function (){
        return now();
    },
    num: function (params){
        return num_(params);
    },
    dump: function (){
        dump();
    },
};

module.exports = {def, display_, set_};