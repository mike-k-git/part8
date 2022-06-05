import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { EDIT_AUTHOR } from '../queries'

export const EditAuthor = ({ authors }) => {
  const [name, setName] = useState(authors[0].name || '')
  const [year, setYear] = useState('')
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    update(cache, { data: { editAuthor } }) {
      cache.modify({
        fields: {
          allAuthors(existingAuthors = []) {
            const editedAuthorRef = cache.writeFragment({
              data: editAuthor.author,
              fragment: gql`
                fragment editedAuthor on Author {
                  id
                  name
                  born
                  bookCount
                }
              `,
            })
            return existingAuthors.map((a) =>
              a.id !== editAuthor.author.id ? a : editedAuthorRef
            )
          },
        },
      })
    },
  })

  const submit = (event) => {
    event.preventDefault()
    editAuthor({ variables: { name, setBornTo: parseInt(year) } })

    setYear('')
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors?.map((author) => (
              <option value={author.name} key={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}
