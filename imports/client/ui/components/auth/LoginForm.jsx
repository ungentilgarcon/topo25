import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'

import { CardActionsCompat as CardActions, CardTitleCompat as CardHeader, CardTextCompat as CardText } from '/imports/startup/client/muiCompat'
// import FlatButton from 'material-ui/FlatButton';
import Button from '@mui/material/Button'
import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'

import AuthLayout from './AuthLayout.jsx'

const LoginForm = ({
  onSubmit,
  onChange,
  errors,
  user
}) => (
  <AuthLayout>
    <form action="/"
      onSubmit={onSubmit}>

      <CardHeader
        title="Login"
        subtitle="Welcome to Topogram"
      />

      <CardText>
        {errors.summary && <p className="error-message">{errors.summary}</p>}

        <div className="field-line">
          <TextField
            floatingLabelText="Email"
            name="email"
            errorText={errors.email}
            onChange={onChange}
            value={user.email}
          />
        </div>

        <div className="field-line">
          <TextField
            floatingLabelText="Password"
            type="password"
            name="password"
            onChange={onChange}
            errorText={errors.password}
            value={user.password}
          />
        </div>
      </CardText>
      <CardActions>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Log in
        </Button>
      </CardActions>
    </form>
    <CardText>
      Don't have an account? <Link to={'/signup'}>Create one</Link>
    </CardText>
  </AuthLayout>
)

LoginForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

export default LoginForm
