import React from 'react'
// Ensure jQuery plugin is registered early if any component needs it
import './typeahead-shim'
import { Provider } from 'react-redux'
// v6 router
import { BrowserRouter, Routes, Route as V6Route, useParams, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppV6 from '/imports/client/ui/containers/AppV6.jsx'

import store from '/imports/client/store'


import { HomeContainer } from '/imports/client/ui/containers/HomeContainer.jsx'
import App from '/imports/client/ui/containers/App.jsx'

import { TopogramViewContainer } from '/imports/client/ui/containers/TopogramViewContainer.jsx'
import { TopogramViewContainerForMapScreenshots } from '/imports/client/ui/containers/TopogramViewContainerForMapScreenshots.jsx'

import { TopogramViewContainerForNetScreenshots } from '/imports/client/ui/containers/TopogramViewContainerForNetScreenshots.jsx'
import { TopogramViewContainerForMapScreenshotsNoTiles } from '/imports/client/ui/containers/TopogramViewContainerForMapScreenshotsNoTiles.jsx'
import { TopogramViewContainerForMapScreenshotsNoTilesWithMainVenuesHighlighted} from '/imports/client/ui/containers/TopogramViewContainerForMapScreenshotsNoTilesWithMainVenuesHighlighted.jsx'

import { TopogramsPrivateListContainer } from '/imports/client/ui/containers/TopogramsPrivateListContainer.jsx'

import { SignUpPage } from '/imports/client/ui/pages/SignUpPage.jsx'
import { LoginPage } from '/imports/client/ui/pages/LoginPage.jsx'
import Page404 from '/imports/client/ui/pages/Page404.jsx'
import ErrorBoundary from '/imports/client/ui/components/common/ErrorBoundary.jsx'

// v6 wrapper to inject params and a v3-like router prop into class components
const V6Compat = ({ Component, ...rest }) => {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state) => state.user)
  const router = React.useMemo(() => ({
    push: (path, state) => navigate(path, { replace: false, state }),
    replace: (path, state) => navigate(path, { replace: true, state }),
    go: (n) => window.history.go(n),
    location,
    params
  }), [navigate, location, params])
  const Comp = Component
  return (
    <ErrorBoundary>
      <Comp {...rest} params={params} router={router} user={user} />
    </ErrorBoundary>
  )
}

export const renderRoutes = () => {
  // Router v6 (browser history)
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <V6Route path="/" element={<AppV6 />}> 
            <V6Route index element={<HomeContainer />} />
            <V6Route path="topograms" element={<V6Compat Component={TopogramsPrivateListContainer} />} />
            <V6Route path="topograms/:topogramId" element={<V6Compat Component={TopogramViewContainer} />} />
            <V6Route path="topograms/:topogramId/view" element={<V6Compat Component={TopogramViewContainer} />} />
            <V6Route path="topograms/:topogramId/map" element={<V6Compat Component={TopogramViewContainerForMapScreenshots} />} />
            <V6Route path="topograms/:topogramId/map_without_tiles" element={<V6Compat Component={TopogramViewContainerForMapScreenshotsNoTiles} />} />
            <V6Route path="topograms/:topogramId/map_without_tiles_highlighted" element={<V6Compat Component={TopogramViewContainerForMapScreenshotsNoTilesWithMainVenuesHighlighted} />} />
            <V6Route path="topograms/:topogramId/network" element={<V6Compat Component={TopogramViewContainerForNetScreenshots} />} />
            <V6Route path="signup" element={<V6Compat Component={SignUpPage} />} />
            <V6Route path="login" element={<V6Compat Component={LoginPage} />} />
            <V6Route path="*" element={<Page404 />} />
          </V6Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}
