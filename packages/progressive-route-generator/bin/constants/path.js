const path = require("path");

const srcPath = path.resolve(process.cwd(), `./package/custom/src`);
const packageJsonPath = path.resolve(process.cwd(), `./package.json`)

exports.srcPath = srcPath
exports.packageJsonPath = packageJsonPath