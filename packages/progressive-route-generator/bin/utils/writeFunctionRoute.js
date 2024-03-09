const path = require("path");
const fs = require("fs");
const Mustache = require("mustache");
const { openUrl } = require("./openUrl");
const { getPort } = require("./getPort");
const { srcPath, packageJsonPath } = require("../constants/path");

const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const prettier = require("prettier");

const port = getPort(packageJsonPath);

const dirToLowerCase = (dir) => {
  const list = dir.split("/");
  const _list = list.map(
    (file) => file.substring(0, 1).toLowerCase() + file.substring(1)
  );
  return _list.join("/");
};

const getFunctionName = (functionDir) => {
  return functionDir.split("/").pop();
};
const writeFunctionRoute = (enterpriseDir, functionDir, note) => {
  const functionRoutePath = `${srcPath}/routes/${enterpriseDir}/index.js`;
  const functionIndexPath = `${srcPath}/pages/${enterpriseDir}/${functionDir}/index.js`;

  const enterprisePath = dirToLowerCase(enterpriseDir);
  const functionPath = dirToLowerCase(functionDir);
  const functionName = getFunctionName(functionDir);

  const originSubRoutesContent = `export default [
  // ${note}
  {
    path: '/${enterprisePath}/${functionPath}',
    component: () => import('../../pages/${enterpriseDir}/${functionDir}'),
  }
]`;
  // 读取初始模板
  const template = fs.readFileSync(
    path.resolve(__dirname, `../template/default/index.tpl`),
    {
      encoding: "utf8",
    }
  );
  // 检查当前企业的功能路由配置文件是否存在
  if (fs.existsSync(functionRoutePath)) {
    // 读取文件内容
    const content = fs.readFileSync(functionRoutePath, "utf-8").trim();

    if (content === "") {
      // 写入模板内容到文件
      fs.writeFileSync(functionRoutePath, originSubRoutesContent.trim());
    } else {
      const ast = parser.parse(content, {
        sourceType: "module",
      });
      traverse(ast, {
        ExportDefaultDeclaration(path) {
          // 找到默认导出的数组
          if (path.node.declaration.type === "ArrayExpression") {
            // 创建一个新的对象节点
            const newObject = parser.parseExpression(`
            // ${note}
            {
              path: '/${enterprisePath}/${functionPath}',
              component: () => import('../../pages/${enterpriseDir}/${functionDir}')
            }`);
            // 向数组添加新的对象
            path.node.declaration.elements.push(newObject);
          }
        },
      });
      // 生成新的代码字符串
      const newCode = generate(ast, {}).code;
      // 使用 Prettier 格式化代码
      prettier
        .format(newCode, {
          // Prettier 的配置项
          semi: false,
          singleQuote: true,
          trailingComma: "none",
          printWidth: 100,
          bracketSpacing: true,
          parser: "babel",
        })
        .then((res) => fs.writeFileSync(functionRoutePath, res));

      // 文件内容不为空，匹配export default 数组中内容并续写二级路由
      //       const regex = /export default (\[.*?\])/s;
      //       const match = content.match(regex);

      //       let preRouteConfig = match[1].substring(0, match[1].length - 2); // -2是去除\n和]

      //       // 兼容有逗号和无逗号两种情况
      //       preRouteConfig += preRouteConfig.endsWith(",") ? "\n" : ",\n";
      //       if (match) {
      //         const routesString = `export default ${preRouteConfig}  // ${note}
      //   {
      //     path: '/${enterprisePath}/${functionPath}',
      //     component: () => import('../../pages/${enterpriseDir}/${functionDir}'),
      //   }
      // ]
      //   `;
      //         fs.writeFileSync(functionRoutePath, routesString);

      // 向业务功能页面index.js写入初始模板
      fs.writeFileSync(
        functionIndexPath,
        Mustache.render(template, { note, functionName })
      );
      // 打开浏览器
      openUrl(`http://localhost:${port}/#/${enterprisePath}/${functionPath}`);
      // } else {
      //   console.error("无法解析路由配置文件内容");
      // }
    }
  } else {
    fs.writeFileSync(functionRoutePath, originSubRoutesContent);
    // 向业务功能页面index.js写入初始模板
    fs.writeFileSync(
      functionIndexPath,
      Mustache.render(template, { note, functionName })
    );
    // 打开浏览器
    openUrl(`http://localhost:${port}/#/${enterprisePath}/${functionPath}`);
  }
};

module.exports = writeFunctionRoute;
