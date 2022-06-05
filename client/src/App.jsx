import { gql, useApolloClient, useSubscription } from '@apollo/client'
import { useState, useEffect } from 'react'
import {
  Books,
  Authors,
  NewBook,
  LoginForm,
  Recommend,
} from './components/index'

const BOOKS_SUBSCRIPTION = gql`
  subscription OnBookAdded {
    bookAdded {
      id
      title
      author {
        id
        name
        born
      }
      published
      genres
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const { data, loading } = useSubscription(BOOKS_SUBSCRIPTION)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setToken(token)
    }
  }, [])

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setToken(token)
    setPage('authors')
  }

  return (
    <div>
      <h1>Last added book: {!loading && data.bookAdded.title}</h1>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={handleLogout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} token={!!token} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <Recommend show={page === 'recommend'} token={token} />
      <LoginForm show={page === 'login'} onLogin={handleLogin} />
    </div>
  )
}

export default App
