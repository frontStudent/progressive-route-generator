const fs = require("fs");
const _ = require("lodash");
const { srcPath } = require("../constants/path");

const writeIndexRoute = (enterpriseDir, note) => {
  const IndexRoutePath = `${srcPath}/routes/index.js`;
  const content = fs.readFileSync(IndexRoutePath, "utf-8").trim();
  // 匹配最后一行的import语句
  const importRegex = /import\s+.+\s+from\s+['"].+['"];?$/;

  // 匹配最后一行以展开运算符开头的语句
  const expandRegex = /^\s*\.\.\./;

  const lines = content.split(content.includes("\r") ? "\r\n" : "\n");

  const lastImportIndex = _.findLastIndex(lines, (line) =>
    importRegex.test(line)
  );
  let modifiedContent;
  if (lastImportIndex !== -1) {
    modifiedContent = [
      ...lines.slice(0, lastImportIndex + 1),
      `// ${note}`,
      `import ${enterpriseDir} from './${enterpriseDir}'`,
      ...lines.slice(lastImportIndex + 1),
    ].join("\n");
  } else {
    console.error("无法解析路由配置文件内容");
  }

  let _lines = modifiedContent?.split("\n");
  const lastExpandIndex = _.findLastIndex(_lines, (line) =>
    expandRegex.test(line)
  );
  if (lastExpandIndex !== -1) {
    if (!_lines[lastExpandIndex].endsWith(",")) _lines[lastExpandIndex] += ",";

    modifiedContent = [
      ..._lines.slice(0, lastExpandIndex + 1),
      `  ...${enterpriseDir}`,
      ..._lines.slice(lastExpandIndex + 1),
    ].join("\n");
    // 将修改后的内容写回文件
    fs.writeFileSync(IndexRoutePath, modifiedContent);
  } else {
    console.error("无法解析路由配置文件内容");
  }
};

module.exports = writeIndexRoute;
