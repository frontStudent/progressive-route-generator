## 渐进式路由生成

### 简介
在前端开发中，每新建一个业务功能页面，都要在路由配置文件中手动添加一条路由配置，属于机械重复工作

但基于配置式路由开发了很长时间的项目，迁移至约定式路由成本会很高


### 主流方案：约定式路由
约定式路由即根据文件目录去自动生成路由，在许多框架中都有这种实现，如umi、next.js等

如果要在react或vue项目中自行实现约定式路由，可以用构建工具提供的api如webpack中的require.context、vite中的import.meta.glob去获取页面目录下的所有文件路径，经过一些处理后得到路由配置的内容

但在实际开发中，pages下很多文件是不需要生成对应路由的，如components、utils、assets等文件夹

我想过去写一些约定之外的配置文件，比如在生成路由时通过读json配置来排除这些文件夹，类似tsconfig中的exclude字段
但无法保证这些不需要生成对应路由的文件夹名称可以被穷举，因此通过手动配置去排除的方式也不可行，也违背了“约定大于配置”的原则

next.js针对这种情况的做法是对我们的页面文件目录再添加一些约定：不管文件夹名称是什么，只要里面没有page.js，就说明无需生成对应路由

考虑到我们目前的项目已经基于配置式路由开发了很长时间，迁移至约定式路由成本会很高，可能超过了约定式路由简化开发效率的收益，因此我希望在不改变配置式路由以及原先项目中routes文件夹结构的前提下，用脚本自动化写入的方式来节省开发人员的时间并杜绝一些低级错误

### 使用

```
# 安装后在项目根目录下运行
pnpm watch
```

或直接运行
```
npx progressive-route-generator
```