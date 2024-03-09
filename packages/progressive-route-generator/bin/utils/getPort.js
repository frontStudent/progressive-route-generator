const fs = require("fs");

const getPort = (packageJsonPath) => {
    if (!packageJsonPath) {
        console.log('package.json文件不存在')
        return
    }
    const packageJsonObj = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8").trim())
    return packageJsonObj?.port || 3000
}
exports.getPort = getPort;
