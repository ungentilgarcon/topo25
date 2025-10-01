import React from 'react'
import PropTypes from 'prop-types'
import UserMenu from '../components/UserMenu.jsx'

const style = {
  position : 'fixed',
  top : '3vh',
  right : '1vw'
}

const TopogramsLayout = ({
  router,
  user,
  children
}) => (
  <div>
    <UserMenu
      router={router}
      user={user}
      style={style}
      />
    {children}
  </div>
)

export default TopogramsLayout
