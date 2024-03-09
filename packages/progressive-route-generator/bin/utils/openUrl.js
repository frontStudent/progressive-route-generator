const openUrl = (url) => {
  if (!url) {
    console.log("未检测到url");
    return;
  }
  import("open").then((open) => {
    open
      .default(url)
      .then(() => {
        console.log("成功打开URL");
      })
      .catch((err) => {
        console.error("无法打开URL:", err);
      });
  });
};
exports.openUrl = openUrl;
