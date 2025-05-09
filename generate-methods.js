const fs = require('fs');

// Charger le fichier OpenAPI
const openapi = JSON.parse(fs.readFileSync('openapi-ts.json', 'utf8'));

function pascalToCamel(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateFunctionName(method, path) {
  const parts = path.split('/').filter(Boolean);
  let name = method.toLowerCase();

  for (const part of parts) {
    if (part.startsWith('{') && part.endsWith('}')) {
      name += 'By' + capitalize(part.replace(/[{}]/g, ''));
    } else {
      name += capitalize(part);
    }
  }

  return pascalToCamel(name + 'Options');
}

function generateFunctionCode(name, method, path) {
  return `function ${name}() {
  return {
    method: '${method.toUpperCase()}',
    url: '${path}'
  };
}\n`;
}

// Extraire les méthodes
const functions = [];

for (const [path, methods] of Object.entries(openapi.paths)) {
  for (const [method, _] of Object.entries(methods)) {
    if (method === 'get') {
      const functionName = generateFunctionName(method, path);
      const functionCode = generateFunctionCode(functionName, method, path);
      functions.push(functionCode);
    }
  }
}

// Afficher ou sauvegarder
const output = functions.join('\n');
fs.writeFileSync('generated-methods.js', output);

console.log('✅ Méthodes générées dans generated-methods.js');
