## 渐进式路由生成

### 简介
在前端开发中，每新建一个业务功能页面，都要在路由配置文件中手动添加一条路由配置，属于机械重复工作

但基于配置式路由开发了很长时间的项目，迁移至约定式路由成本会很高

因此本项目将演示一种对基于配置式路由的复杂前端工程进行开发流程简化的方案（无需迁移至约定式路由）

### 快速启动
本项目基于pnpm workspace搭建了简单的monorepo模式，，packages/page-watcher下是我们的包，examples/app为试验区

在项目根目录执行：
```
npm run watch
```
然后在examples/app中的pages文件夹下尝试新建任意名字的文件夹，routes下将生成对应文件夹，并会自动写入路由配置内容
在不操作一段时间后，将自动停止对pages文件夹的监听

### 主流方案：约定式路由
约定式路由即根据文件目录去自动生成路由，在许多框架中都有这种实现，如umi、next.js等

如果要在react或vue项目中自行实现约定式路由，可以用构建工具提供的api如webpack中的require.context、vite中的import.meta.glob去获取页面目录下的所有文件路径，经过一些处理后得到路由配置的内容

但在实际开发中，pages下很多文件是不需要生成对应路由的，如components、utils、assets等文件夹

我想过去写一些约定之外的配置文件，比如在生成路由时通过读json配置来排除这些文件夹，类似tsconfig中的exclude字段
但无法保证这些不需要生成对应路由的文件夹名称可以被穷举，因此通过手动配置去排除的方式也不可行，也违背了“约定大于配置”的原则

next.js针对这种情况的做法是对我们的页面文件目录再添加一些约定：不管文件夹名称是什么，只要里面没有page.js，就说明无需生成对应路由

考虑到我们目前的项目已经基于配置式路由开发了很长时间，迁移至约定式路由成本会很高，因此在不改变配置式路由以及原先项目中routes文件夹结构的前提下，用脚本自动化写入的方式来提高开发效率

### 一种渐进式路由生成方案
我们在项目package.json中添加一个命令xxx，去运行一个node脚本，脚本中会启动chokidar的watcher监听pages目录
开发者在需要创建路由时，先npm run xxx，然后新建文件夹，这时候监听到最新的文件路径，进行一系列处理后自动写入最新创建页面的路由配置。之后，用一个定时器去控制在一定时间后没有新建的操作了就杀掉watcher

渐进式路由生成的方案中其实也隐含了另外两条约定：

- 如果你新建的是一个需要对应至路由的功能文件夹，那只要提前敲一个npm run xxx去唤醒路由自动创建流程；
- 如果你只是新建一个无需对应至路由的文件夹，如只是在当前页面存放组件的components目录或者存放接口请求的api目录，那就不需要去执行这个命令，自然不会生成多余的路由配置

因此我们同样不需要额外配置哪些文件目录不需要对应到路由上去，而是由开发者在新建目录时决定即可

### 目前pages和routes结构
项目中使用的是react，react-router目前是v5版本
```
src/
├── pages/
│   └── Enterprise1/
│       ├── Function1/
│       │   ├── components/
│       │   │   ├── Card.js
│       │   └── index.js
│       └── Function2/
│           └── index.js
├── routes/
│   ├── Enterprise1/
│   │   └── index.js
    └── index.js
```
可以看出目前的页面是根据企业来组织的，一个企业文件夹下对应多个业务功能文件夹，每个业务功能文件夹会对应一个主要的页面
因此在配置路由时也按照企业对路由进行了分组，然后再一并引到routes/index.js中

比如对于上面的文件结构，Enterprise1的路由配置中会这样写：

```js title="routes/Enterprise1/index.js"
export default [
  // 业务功能1
  {
    path: '/enterprise1/function1',
    component: () => import('../../pages/Enterprise1/Function1')
  },
  // 业务功能2
  {
    path: '/enterprise1/function2',
    component: () => import('../../pages/Enterprise1/Function2')
  }
]
```
总的路由配置会这样写：

```js title="routes/index.js"
import React, { Suspense } from 'react'
import { Provider } from 'react-redux'
import { Route, HashRouter as Router, Switch } from 'react-router-dom'

import useLogger from 'utils/hooks/useLogger'
import store from '../store/index'

import Loading from 'components/Loading'

// 企业1
import Enterprise1 from './Enterprise1'

const routes = [
  ...Enterprise1
]

export default ({ match }) => {
  useLogger()
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<Loading />}>
          <Switch>
            {routes.map(({ exact = true, ...route }) => {
              return (
                <Route
                  key={route.path}
                  exact={route.exact}
                  path={`${route.path}`}
                  component={React.lazy(route.component)}
                />
              )
            })}
          </Switch>
        </Suspense>
      </Router>
    </Provider>
  )
}

```

所以自动化脚本中拿到新建的文件夹路径后，按照上面的配置文件模板去追加更新内容即可
但这样的局限性也是巨大的，脚本中重写路由配置的逻辑只能适用于上面这种固定的模板，如果模板变了（比如说从v5迁到v6，或者在除react的其它前端框架中），脚本也需要跟着变，很难将这种路由生成逻辑封装成通用的脚手架包来发布

### 总结
渐进式路由生成方案适用于基于配置式路由的复杂前端工程中，它的核心思想是通过在适当时机唤醒某个自动化脚本（基于chokidar，但需要根据项目本身已有路由配置来编写具体逻辑）来避免手动配置路由从而简化开发流程，但又不需要付出迁移至约定式路由的高昂成本