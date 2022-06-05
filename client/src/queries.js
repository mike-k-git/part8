import { gql } from '@apollo/client'

const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    id
    name
    born
    bookCount
  }
`

export const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      id
      name
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query AllBooks($genre: String) {
    allBooks(genre: $genre) {
      id
      title
      author {
        ...AuthorDetails
      }
      published
      genres
    }
  }
  ${AUTHOR_DETAILS}
`

export const EDIT_AUTHOR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      code
      success
      message
      author {
        ...AuthorDetails
      }
    }
  }
  ${AUTHOR_DETAILS}
`

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      code
      success
      message
      token {
        value
      }
    }
  }
`
export const ADD_BOOK = gql`
  mutation AddBook($book: NewBook!) {
    addBook(book: $book) {
      code
      success
      message
      book {
        id
        title
        author {
          ...AuthorDetails
        }
        published
        genres
      }
    }
  }
  ${AUTHOR_DETAILS}
`

export const ME = gql`
  query Me {
    me {
      id
      username
      favoriteGenre
    }
  }
`
