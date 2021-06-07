'use strict';
/* eslint-disable no-console -- output */
const { readdir, readFile, writeFile } = require('fs').promises;
const { green, red } = require('chalk');
const PREV_VERSION = require('core-js/package').version;
const NEW_VERSION = require('../package').version;

const now = new Date();
const NEW_VERSION_MINOR = `'${ NEW_VERSION.replace(/^(\d+\.\d+)\..*/, '$1') }'`;
const PREV_VERSION_MINOR = `'${ PREV_VERSION.replace(/^(\d+\.\d+)\..*/, '$1') }'`;
const CHANGELOG = './CHANGELOG.md';
const LICENSE = './LICENSE';
const README = './README.md';
const README_COMPAT = './packages/core-js-compat/README.md';
const LERNA = './lerna.json';
const SHARED = './packages/core-js/internals/shared.js';
const CURRENT_YEAR = now.getFullYear();

(async () => {
  const license = await readFile(LICENSE, 'utf8');
  const OLD_YEAR = +license.match(/2014-(\d{4}) D/)[1];
  await writeFile(LICENSE, license.split(OLD_YEAR).join(CURRENT_YEAR));
  const lerna = await readFile(LERNA, 'utf8');
  await writeFile(LERNA, lerna.split(PREV_VERSION).join(NEW_VERSION));
  const readme = await readFile(README, 'utf8');
  await writeFile(README, readme
    .split(PREV_VERSION).join(NEW_VERSION)
    .split(PREV_VERSION_MINOR).join(NEW_VERSION_MINOR));
  const readmeCompat = await readFile(README_COMPAT, 'utf8');
  await writeFile(README_COMPAT, readmeCompat
    .split(PREV_VERSION_MINOR).join(NEW_VERSION_MINOR));
  const shared = await readFile(SHARED, 'utf8');
  await writeFile(SHARED, shared
    .split(PREV_VERSION).join(NEW_VERSION)
    .split(OLD_YEAR).join(CURRENT_YEAR));
  const packages = await readdir('./packages');
  for (const NAME of packages) {
    const PATH = `./packages/${ NAME }/package.json`;
    const pkg = JSON.parse(await readFile(PATH, 'utf8'));
    pkg.version = NEW_VERSION;
    for (const field of ['dependencies', 'devDependencies']) {
      const dependencies = pkg[field];
      if (dependencies) for (const dependency of Object.keys(dependencies)) {
        if (dependency.includes('core-js')) dependencies[dependency] = NEW_VERSION;
      }
    }
    await writeFile(PATH, `${ JSON.stringify(pkg, null, '  ') }\n`);
  }
  if (NEW_VERSION !== PREV_VERSION) {
    const changelog = await readFile(CHANGELOG, 'utf8');
    await writeFile(CHANGELOG, changelog.split('##### Unreleased').join(`##### Unreleased\n- Nothing\n\n##### ${
      NEW_VERSION
    } - ${
      CURRENT_YEAR }.${ String(now.getMonth() + 1).padStart(2, '0') }.${ String(now.getDate()).padStart(2, '0')
    }`));
  }
  if (CURRENT_YEAR !== OLD_YEAR) console.log(green('the year updated'));
  if (NEW_VERSION !== PREV_VERSION) console.log(green('the version updated'));
  else if (CURRENT_YEAR === OLD_YEAR) console.log(red('bump is not required'));
})();
