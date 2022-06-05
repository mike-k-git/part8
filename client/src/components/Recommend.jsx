import { useQuery } from '@apollo/client'
import { ME, ALL_BOOKS } from '../queries'

export const Recommend = (props) => {
  const { data: data_me } = useQuery(ME, {
    skip: !props.token,
  })
  const { data: data_books } = useQuery(ALL_BOOKS, {
    skip: !data_me,
    variables: { genre: data_me?.me?.favoriteGenre },
  })

  if (!props.show || !data_books) return null

  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        Books in you favorite genre:{' '}
        <strong>{data_me?.me?.favoriteGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data_books.allBooks.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author.name}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
