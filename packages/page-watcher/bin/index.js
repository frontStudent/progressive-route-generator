#!/usr/bin/env node

const fs = require("fs");

const chokidar = require("chokidar");

const writeFunctionRoute = require("./utils/writeFunctionRoute");
const writeIndexRoute = require("./utils/writeIndexRoute");
const inquirerPrompt = require("./utils/inquirerPrompt");
const { srcPath } = require("./constants/path");

const watcher = chokidar.watch(`${srcPath}/pages`); // 设置persistent为false，可在退出时停止监听

const generateRoutes = (newPath, note) => {
  const completeDir = newPath.split("\\");

  // 获取企业文件夹
  const enterpriseDir = completeDir[completeDir.indexOf("pages") + 1];
  if (!enterpriseDir) return;

  // 获取功能文件夹
  const functionDir = completeDir
    .slice(completeDir.indexOf("pages") + 2, completeDir.length)
    .join("/");

  // 没有功能文件夹 说明是新建企业文件夹
  if (!functionDir) {
    console.log("检测到新建企业文件夹：", enterpriseDir);
    console.log("并未新建业务功能页面");

    // 创建企业路由文件夹
    fs.mkdirSync(`${srcPath}/routes/${enterpriseDir}`);
    //在总的路由配置文件中追加写入
    writeIndexRoute(enterpriseDir, note);
    return;
  }

  console.log("检测到新建企业文件夹：", enterpriseDir);
  console.log("检测到新建业务功能页面：", functionDir);
  // 有功能文件夹 检查对应企业的功能路由配置中是否已经有内容，如果有则追加写入，没有则写入初始模板
  writeFunctionRoute(enterpriseDir, functionDir, note);
};

let timeout = 20000;
let timer;
let startTime = new Date().getTime();

watcher.on("addDir", (path, stats) => {
  clearTimeout(timer);

  const timeDiff = new Date().getTime() - startTime;
  startTime = new Date().getTime();

  // 时间差大于1s 判定为运行命令后新建的文件夹
  if (timeDiff > 1000) {
    inquirerPrompt().then((answers) => {
      // 获取注释信息
      const { note } = answers;

      // 重置定时器时间 从回答完问题后开始计时
      timer = setTimeout(() => {
        watcher.close();
      }, timeout);

      generateRoutes(path, note);
    });
  } else {
    // 如果运行完命令后一直不新建 则timeout后也会关闭watcher
    timer = setTimeout(() => {
      watcher.close();
    }, timeout);
  }
});
