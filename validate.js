'use strict';

var _ = require('lodash');
var tv4 = require('tv4');

// based on express request object
var defaultSchema = {
  type: 'object',
  parameters: {
    body: {
      type: 'object',
      parameters: {},
      required: []
    },
    headers: {
      type: 'object',
      parameters: {},
      requied: []
    },
    params: {
      type: 'object',
      parameters: {},
      required: []
    },
    query: {
      type: 'bject',
      parameters: {},
      required: []
    }
  }
};

var swaggerExpressMap = {
  body: 'body',
  path: 'params',
  query: 'query',
  file: 'body',
  header: 'header',
  form: 'body'
};

function addParam(schema, param) {
  var paramType = param.paramType;
  if (!paramType) return;

  var section = swaggerExpressMap[paramType.toLowerCase()];

  schema.parameters[section].parameters[param.name] = param;
  if (param.required) schema.parameters[section].required.push(param.name);
}

function operationToJsonSchema(op) {
  var parameters = op.parameters;
  if (!parameters || !parameters.length) return null;

  var schema = _.cloneDeep(defaultSchema);
  op.parameters.forEach(function(param) {
    addParam(schema, param);
  });
  return schema;
}

module.exports = function validate(options) {
  return function(req, res, next) {
    var spec = req.__eapi.operation;

    var schema = operationToJsonSchema(spec);
    if (schema === null) return next();

    var dbg = _.pick(req, ['body', 'headers', 'params', 'query']);
    //console.log('VALIDATE req', dbg);
    //console.log('VALIDATE schema', schema);
    var errors = tv4.validate(req, schema);

    if (errors.valid) res.json(400, errors);
    next();
  };
};
