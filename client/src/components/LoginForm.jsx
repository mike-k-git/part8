import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { LOGIN } from '../queries'

export const LoginForm = (props) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login] = useMutation(LOGIN, {
    onCompleted: (data) => props.onLogin(data.login.token.value),
    onError: (error) => window.alert(error.graphQLErrors[0].message),
  })

  if (!props.show) {
    return null
  }

  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          username{' '}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{' '}
          <input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )
}
