import React, { Suspense } from 'react'
import { Provider } from 'react-redux'
import { Route, HashRouter as Router, Switch } from 'react-router-dom'

import useLogger from 'utils/hooks/useLogger'
import store from '../store/index'

import Loading from 'components/Loading'

// Test1
import Test1 from './Test1'
// test注释
import Test2 from './Test2'
// test注释
import MM from './MM'

const routes = [
  ...Test1,
  ...Test2,
  ...MM
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