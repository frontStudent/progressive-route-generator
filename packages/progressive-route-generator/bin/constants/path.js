const path = require("path");

const srcPath = path.resolve(process.cwd(), `./packages/custom/src`);
const packageJsonPath = path.resolve(process.cwd(), `./package.json`)

exports.srcPath = srcPath
exports.packageJsonPath = packageJsonPath