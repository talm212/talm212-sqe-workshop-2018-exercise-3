import * as escodegen from 'escodegen';
import * as esgraph from 'esgraph';
import * as esprima from 'esprima';

let paintGreen = true;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse, {range: true});
};

function parseJson(jsonToParse, env) {
    return funcs[jsonToParse.type](jsonToParse, env);
}

const literal = (jsonToParse) => {
    return jsonToParse.value;
};

const identifier = (jsonToParse, env) =>{

    return env[jsonToParse.name];
};

const arrayExpression = (jsonToParse, env) =>{
    return eval('[' + jsonToParse.elements.map(json => funcs[json.type](json, env)).join(',') + ']');
};

const assignmentExpression = (jsonToParse, env) =>{
    if (jsonToParse.left.type === 'MemberExpression') {
        env[jsonToParse.left.object.name][jsonToParse.left.property.value] = funcs[jsonToParse.right.type](jsonToParse.right, env);
    } else {
        env[jsonToParse.left.name] = funcs[jsonToParse.right.type](jsonToParse.right, env);
    }
    return true;
};

const binaryExpression = (jsonToParse, env)=> {
    let left = funcs[jsonToParse.left.type](jsonToParse.left, env);
    let right = funcs[jsonToParse.right.type](jsonToParse.right, env);
    return eval(left + jsonToParse.operator + right);
};

const blockStmt = (jsonToParse, env) => {
    jsonToParse.body.forEach((json) => parseJson(json, env));
    return true;
};

const program = (jsonToParse, env) => {
    jsonToParse.body.forEach((element) => parseJson(element, env));
    return true;
};

const expressionStatement = (jsonToParse, env) => {
    return parseJson(jsonToParse.expression, env);
};

const memberExpression = (jsonToParse, env) => {
    let arr = env[jsonToParse.object.name];
    let property = jsonToParse.property.value;
    return arr[property];
};

const variableDeclaration = (jsonToParse, env) => {
    jsonToParse.declarations.forEach((declorator) => {
        if (declorator.init !== null) {
            env[declorator.id.name] = funcs[declorator.init.type](declorator.init, env);
        }
    });
    return true;
};

function paintNodes(currNode, env){
    currNode.green = true;
    if (currNode.normal) {
        parseJson(parseCode(currNode.label), env);
        paintNodes(currNode.normal, env);
    }
    else if (currNode.true && currNode.false){
        if (parseJson(parseCode(currNode.label).body[0], env)){
            paintNodes(currNode.true, env);
        }
        else{
            paintNodes(currNode.false, env);
        }
    }
}

function createEnv(parsedCode, values) {
    let params = parsedCode.body[0].params;

    let pairs = [];
    for (let key in params) {
        pairs[key] = {'key': params[key].name, 'value': values[key]};
    }
    let res = {};
    for (let pair in pairs) {
        res[pairs[pair].key] = pairs[pair].value;
    }

    return res;
}

function printGraph(jsonToParse, args) {

    if(args === '') {
        paintGreen = false;
    }else{
        args = JSON.parse("[" + args + "]");
    }

    let nodes = createNodes(jsonToParse);
    let env = createEnv(jsonToParse, args);
    paintNodes(nodes[0], env);
    let output = ['digraph cfg { forcelabels=true '];
    for (const [i, node] of nodes.entries()) {
        let {label = node.type} = node;
        output.push(`n${i} [label="${label}", xlabel = ${i + 1}, `);
        let shape = 'rectangle';
        if (node.true || node.false) {
            shape = 'diamond';
        }
        output.push(` shape=${shape},`);
        if (node.green && paintGreen) {
            output.push(' style = filled, fillcolor = green');
        }
        output.push(']\n');
    }
    for (const [i, node] of nodes.entries()) {
        for (const type of ['normal', 'true', 'false']) {
            const next = node[type];
            if (!next) continue;
            output.push(`n${i} -> n${nodes.indexOf(next)} [`);
            if (['true', 'false'].includes(type)) output.push(`label="${type.charAt(0).toUpperCase()}"`);
            output.push(']\n');
        }
    }
    output.push(' }');
    return output.join('');
}

function createNodes(parsedCode) {
    let nodes = esgraph(parsedCode.body[0].body)[2];
    nodes = nodes.slice(1, nodes.length - 1);
    nodes[0].prev = [];
    nodes.filter(node => node.astNode.type === 'ReturnStatement')
        .forEach(node => {node.next=[]; delete node.normal;});
    nodes.forEach(node => node.label = escodegen.generate(node.astNode));
    for (let i = 0; i < nodes.length; i++) {
        let currNode = nodes[i];
        while (currNode.normal && currNode.normal.normal && currNode.normal.prev.length === 1) {
            nodes.splice(nodes.indexOf(currNode.normal), 1);
            currNode.label = currNode.label + '\n' + currNode.normal.label;
            currNode.next = currNode.normal.next;
            currNode.normal = currNode.normal.normal;
        }
    }
    return nodes;
}

let funcs = {
    'AssignmentExpression': assignmentExpression,
    'BlockStatement': blockStmt,
    'ExpressionStatement': expressionStatement,
    'Program': program,
    'VariableDeclaration': variableDeclaration,
    'BinaryExpression': binaryExpression,
    'ArrayExpression': arrayExpression,
    'Identifier': identifier,
    'Literal': literal,
    'LogicalExpression': binaryExpression,
    'MemberExpression': memberExpression,
};

export {parseCode, printGraph};

