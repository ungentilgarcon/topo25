import React from 'react'
import { useNavigate, useLocation, useParams, Outlet } from 'react-router-dom'
import { connect } from 'react-redux'
import { loadUser } from '/imports/client/actions/user'
import App from '/imports/client/ui/components/App.jsx'

function AppV6Inner(props) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const outletEl = <Outlet />

  // Minimal router shim compatible with existing code expecting router.push()
  const router = React.useMemo(() => ({
    push: (path, state) => navigate(path, { replace: false, state }),
    replace: (path, state) => navigate(path, { replace: true, state }),
    go: (n) => window.history.go(n),
    location,
    params
  }), [navigate, location, params])

  // Render legacy App but provide the outlet element as child
  return (
    <App {...props} router={router}>
      {outletEl}
    </App>
  )
}

const mapStateToProps = (state) => ({ user: state.user })
const mapDispatchToProps = (dispatch) => ({ loadUser: () => dispatch(loadUser()) })

export default connect(mapStateToProps, mapDispatchToProps)(AppV6Inner)
