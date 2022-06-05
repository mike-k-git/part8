import { useQuery } from '@apollo/client'
import { useState } from 'react'
import { ALL_BOOKS } from '../queries'

export const Books = (props) => {
  const [genres, setGenres] = useState(new Set(['all']))
  const [currentGenre, setCurrentGenre] = useState('all')

  const { loading, error, data, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: '' },
    onCompleted: ({ allBooks }) => {
      const allGenres = [].concat.apply(
        [],
        allBooks.map((b) => b.genres)
      )
      setGenres((prev) => new Set([...prev, ...allGenres]))
    },
  })
  if (!props.show || loading) {
    return null
  }

  if (error) {
    console.log(error.message)
  }

  const books = data.allBooks

  return (
    <div>
      <h2>Books</h2>
      <p>
        in genre: <strong>{currentGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((b) => {
            if (currentGenre !== 'all') {
              if (!b.genres.includes(currentGenre)) {
                return null
              }
            }

            return (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {[...genres].map((g) => (
        <button
          key={g}
          onClick={() => {
            setCurrentGenre(g)
            refetch({ genre: g === 'all' ? '' : g })
          }}
        >
          {g}
        </button>
      ))}
    </div>
  )
}
