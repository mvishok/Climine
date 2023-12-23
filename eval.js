const { exit } = require('process');
const { getVariable } = require('./mem');

function eval(node, def) {
    if (node[0].type == 'CallExpression') {

        return eval(node[0].params, def);;
    }
    if (node.length == 0) {
        return "";
    }
    var variableValue;
    if (node.length === 1 && node[0].type === 'Identifier') {
        if (getVariable(node[0].value)[0]) {
            variableValue = getVariable(node[0].value)[0];
        }
        else if (def[node[0].value]) {

            exit(0);
        }
        else {
            console.log(`Variable ${node[0].value} is not defined (eval)`);
            return undefined;
        }

        if (isNaN(parseFloat(variableValue))) {
            return variableValue;
        } else {
            return parseFloat(variableValue);
        }
    }
    
    var result = '';
    //if node[0] is string, let result = node[0].value.tosring()
    if (node[0].type === 'StringLiteral') {
        result = node[0].value;
    }
    else if (node[0].type === 'Identifier') {

        if (node[1]&&node[1].type === 'CallExpression') {
            if (def[node[0].value]) {
                variableValue = def[node[0].value](node[1].params);
                if (variableValue === undefined) {
                    variableValue = [0, 'NumberLiteral'];
                }
                result = variableValue[0];
            } else {
                console.log(`${node[0].value} is not defined (eval)`);
                exit(1);
            }
        } else {
            const variableValue = getVariable(node[0].value);
            if (variableValue === undefined || variableValue === null || variableValue === '' || variableValue === NaN) {
                console.log(`Variable ${node[0].value} is not defined (eval)`);
                return undefined;
            }

            if (isNaN(parseFloat(variableValue[0]))) {
                result = variableValue[0];
            } else {
                result = parseFloat(variableValue[0]);
            }
        }
    } else {
        result = parseFloat(node[0].value);
    }
    for (let i = 1; i < node.length; i += 2) {
        const operator = node[i].value;
        let operand;
        var variableValue;

        if (node[i+1]===undefined){
            node[i+1] = {type: 'NumberLiteral', value: 0};
        }
        
        if (node[i + 1].type === 'Identifier') {
            if (node[i+2] && node[i + 2].type === 'CallExpression') {
                if (def[node[i+1].value]) {
                    variableValue = def[node[i+1].value](node[i+2].params);
                    if (variableValue === undefined) {
                        variableValue = [0, 'NumberLiteral'];
                    }
                    operand = variableValue[0];
                } else {
                    console.log(`${node[i+1].value} is not defined (eval)`);
                    exit(1);
                }
            } else {
                variableValue = getVariable(node[i + 1].value);
                if (variableValue === undefined) {
                    console.log(`Variable ${node[i + 1].value} is not defined (eval)`);
                    return undefined;
                }

                if (variableValue[1] === 'StringLiteral') {
                    operand = variableValue[0];
                } else {
                    operand = parseFloat(variableValue[0]);
                }
            }
        } else {
            if (node[i + 1].type === 'StringLiteral') {
                operand = node[i + 1].value;
            } else {
                operand = parseFloat(node[i + 1].value);
            }
        }

        switch (operator) {
            case '+':
                result += operand;
                break;
            case '-':
                result -= operand;
                break;
            case '*':
                result *= operand;
                break;
            case '/':
                result /= operand;
                break;
            case '%':
                result %= operand;
                break;
            case '**':
                result **= operand;
                break;
            case '&':
                result = result.toString() + operand.toString();
                break;
            case '==':
                result = result == operand ? 1 : 0;
                break;
            case '!=':
                result = result != operand ? 1 : 0;
                break;
            case '<':
                result = result < operand ? 1 : 0;
                break;
            case '>':
                result = result > operand ? 1 : 0;
                break;
            case undefined:
                break;
            default:
                console.log(`Operator ${operator} is not supported`);
                return undefined;
        }
    }
    return result;
}

module.exports = eval;
