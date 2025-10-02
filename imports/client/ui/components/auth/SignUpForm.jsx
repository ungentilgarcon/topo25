import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { CardActionsCompat as CardActions, CardTitleCompat as CardHeader, CardTextCompat as CardText } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'
import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'

import AuthLayout from './AuthLayout.jsx'

const SignUpForm = ({
  onSubmit,
  onChange,
  errors,
  user,
}) => (
  <AuthLayout>
    <form action="/"
      onSubmit={onSubmit}>
      <CardHeader
        title="Sign Up"
        subtitle="Welcome to Topogram"
      />
      <CardText>
        {errors.summary && <p className="error-message">{errors.summary}</p>}

        <div className="field-line">
          <TextField
            floatingLabelText="Name"
            name="username"
            errorText={errors.username}
            onChange={onChange}
            value={user.username}
          />
        </div>

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

        {/* <div className="field-line">
        <TextField
          floatingLabelText="Password Confirm"
          type="password"
          name="passwordConfirm"
          onChange={onChange}
          errorText={errors.passwordConfirm}
          value={user.passwordConfirm}
        />
      </div> */}

      </CardText>
      <CardActions>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Create New Account
        </Button>
      </CardActions>
    </form>
    <CardText>
    Already have an account? <Link to={'/login'}>Log in</Link>
    </CardText>
  </AuthLayout>
)

SignUpForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}

export default SignUpForm
