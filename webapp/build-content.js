#!/usr/bin/env node
// Reads every curriculum markdown file and bundles it into content.js as
// window.CURRICULUM = { "path": "raw markdown", ... }.
// Re-run whenever you edit a lab: `node webapp/build-content.js`
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = [
  'README.md', 'ROADMAP.md', 'SETUP.md', 'PROGRESS.md',
  'labs/00-foundations/README.md',
  'labs/00-foundations/lab-01-linux-cli.md',
  'labs/00-foundations/lab-02-git-and-scripting.md',
  'labs/00-foundations/lab-03-networking.md',
  'labs/01-aws-fundamentals/README.md',
  'labs/01-aws-fundamentals/lab-01-iam-cli-localstack.md',
  'labs/01-aws-fundamentals/lab-02-ec2-vpc.md',
  'labs/01-aws-fundamentals/lab-03-s3-rds-lambda.md',
  'resources/aws-glossary.md',
  'resources/free-tools.md',
  'resources/interview-prep.md',
];

const bundle = {};
for (const rel of files) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) bundle[rel] = fs.readFileSync(abs, 'utf8');
  else console.warn('  (skipped, not found): ' + rel);
}

fs.writeFileSync(path.join(__dirname, 'content.js'),
  'window.CURRICULUM = ' + JSON.stringify(bundle) + ';\n');
console.log('Bundled ' + Object.keys(bundle).length + ' files into webapp/content.js');
