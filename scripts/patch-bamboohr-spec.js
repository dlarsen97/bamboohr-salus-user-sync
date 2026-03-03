#!/usr/bin/env node
// Patches the generated BambooHR OpenAPI spec to add HTTP Basic auth as a
// security option on any endpoint that doesn't already list it.
// Run this after `npx api install` to ensure Basic auth works alongside OAuth.

const fs = require('fs');
const path = require('path');

const specPath = path.join(__dirname, '..', '.api', 'apis', 'bamboohr', 'openapi.json');
const schemasPath = path.join(__dirname, '..', '.api', 'apis', 'bamboohr', 'schemas.ts');

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

// Patch: add undocumented page/page_size query params to POST /api/v1/datasets/{datasetName}.
// The API supports these but they are missing from the spec, causing the SDK to silently drop them.
const datasetsPost = spec.paths?.['/api/v1/datasets/{datasetName}']?.post;
if (datasetsPost) {
    const alreadyPatched = datasetsPost.parameters?.some(p => p.name === 'page');
    if (!alreadyPatched) {
        datasetsPost.parameters = datasetsPost.parameters ?? [];
        datasetsPost.parameters.push(
            { name: 'page', in: 'query', required: false, schema: { type: 'integer' }, description: 'Page number to retrieve' },
            { name: 'page_size', in: 'query', required: false, schema: { type: 'integer' }, description: 'Number of records per page' },
        );
        console.log('  + page/page_size query params: POST /api/v1/datasets/{datasetName}');
        patched++;
    }
}

fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

// Patch schemas.ts to add page/page_size to GetDataFromDataset metadata types.
// The SDK uses this for TypeScript types; the openapi.json patch above handles runtime routing.
if (fs.existsSync(schemasPath)) {
    const OLD_METADATA = '"metadata":{"allOf":[{"type":"object","properties":{"datasetName":{"type":"string","$schema":"https://json-schema.org/draft/2020-12/schema#","description":"The name of the dataset you want data from"}},"required":["datasetName"]}]}';
    const NEW_METADATA = '"metadata":{"allOf":[{"type":"object","properties":{"datasetName":{"type":"string","$schema":"https://json-schema.org/draft/2020-12/schema#","description":"The name of the dataset you want data from"},"page":{"type":"integer","$schema":"https://json-schema.org/draft/2020-12/schema#","description":"Page number to retrieve"},"page_size":{"type":"integer","$schema":"https://json-schema.org/draft/2020-12/schema#","description":"Number of records per page"}},"required":["datasetName"]}]}';

    let schemas = fs.readFileSync(schemasPath, 'utf8');
    if (schemas.includes(OLD_METADATA)) {
        fs.writeFileSync(schemasPath, schemas.replace(OLD_METADATA, NEW_METADATA));
        console.log('  + page/page_size types: GetDataFromDataset metadata in schemas.ts');
        patched++;
    } else if (schemas.includes(NEW_METADATA)) {
        console.log('  (schemas.ts already patched, skipping)');
    } else {
        console.warn('  WARNING: could not find expected GetDataFromDataset metadata in schemas.ts — manual update may be needed');
    }
}

console.log(`\nPatched ${patched} endpoint(s).`);
