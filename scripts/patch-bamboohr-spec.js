#!/usr/bin/env node
// Patches the generated BambooHR OpenAPI spec to add HTTP Basic auth as a
// security option on any endpoint that doesn't already list it.
// Run this after `npx api install` to ensure Basic auth works alongside OAuth.

const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '..', '.api', 'apis', 'bamboohr', 'openapi.json');

if (!fs.existsSync(specPath)) {
    console.error(`Spec not found at ${specPath} — run 'npx api install' first.`);
    process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const basicEntry = { basic: [] };
let patched = 0;

for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
        if (!operation || typeof operation !== 'object' || !Array.isArray(operation.security)) continue;

        const hasBasic = operation.security.some(s => 'basic' in s);
        if (!hasBasic) {
            operation.security.unshift(basicEntry);
            patched++;
            console.log(`  + basic auth: ${method.toUpperCase()} ${pathKey}`);
        }
    }
}

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
console.log(`\nPatched ${patched} endpoint(s).`);
