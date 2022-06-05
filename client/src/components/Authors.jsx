import { useQuery } from '@apollo/client'
import { EditAuthor } from './index'
import { ALL_AUTHORS } from '../queries'

export const Authors = (props) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)

  if (!props.show || loading) {
    return null
  }

  if (error) {
    console.log(error)
  }
  const authors = data.allAuthors

  return (
    <>
      <div>
        <h2>Authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {props.token && <EditAuthor authors={authors} />}
    </>
  )
}
