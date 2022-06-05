import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { ADD_BOOK } from '../queries'

export const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook, { error }] = useMutation(ADD_BOOK, {
    update(cache, { data: { addBook } }) {
      cache.modify({
        fields: {
          allAuthors(existingAuthors = [], { readField }) {
            const newAuthorRef = cache.writeFragment({
              data: addBook.book.author,
              fragment: gql`
                fragment newAuthor on Author {
                  id
                  name
                  born
                  bookCount
                }
              `,
            })
            if (
              existingAuthors.some(
                (ref) => readField('id', ref) === addBook.book.author.id
              )
            ) {
              return existingAuthors.map((a) =>
                a.id !== addBook.book.author.id ? a : newAuthorRef
              )
            }
            return [...existingAuthors, newAuthorRef]
          },
          allBooks(existingBooks = []) {
            const newBookRef = cache.writeFragment({
              data: addBook.book,
              fragment: gql`
                fragment newBook on Book {
                  id
                  title
                  author {
                    id
                    name
                    born
                    bookCount
                  }
                  published
                  genres
                }
              `,
            })
            return [...existingBooks, newBookRef]
          },
        },
      })
    },
  })

  if (!props.show) {
    return null
  }

  if (error) {
    window.alert(error.graphQLErrors[0].message)
  }

  const submit = (event) => {
    event.preventDefault()

    addBook({ variables: { book: { title, author, published, genres } } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(parseInt(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}
