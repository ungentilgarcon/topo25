import React from 'react'
import PropTypes from 'prop-types'

import '/imports/css/topogram.css'

import { IntlProvider } from 'react-intl'
import { messages } from '../../../i18n.js'

import MuiV5Provider from '/imports/startup/client/MuiV5Provider.jsx'

// react-tap-event-plugin removed; use standard onClick handlers instead

// import UserMenu from '../components/UserMenu.jsx'

// Legacy MUI v0 theme provider removed; using MUI v5 provider only


export class App extends React.Component {

  componentDidMount = () => {
    this.props.loadUser() // load current user
  }

  render = () => {
    const {
     children,
     classNames,
     locale,
     messages,
     user,
     router
   } = this.props
    return (
      <IntlProvider locale={locale}
        messages={messages}>
        <MuiV5Provider>
            <div className={ classNames }>
              {React.cloneElement(children, {user, router})}
            </div>
        </MuiV5Provider>
      </IntlProvider>
    )
  }
}

App.propTypes = {
  children : PropTypes.node,
  classNames : PropTypes.string,
  locale : PropTypes.string,
  messages : PropTypes.object,
  user : PropTypes.object,
  router : PropTypes.object,
  loadUser : PropTypes.func
}

App.defaultProps = {
  locale: 'en',
  messages : messages['en']
}

export default App
