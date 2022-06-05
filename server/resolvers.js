import { UserInputError, AuthenticationError } from 'apollo-server-express'
import { PubSub } from 'graphql-subscriptions'
const pubsub = new PubSub()
import { Author, Book, User } from './models/index.js'
import jwt from 'jsonwebtoken'

export const resolvers = {
  Query: {
    bookCount: async () => Book.collection.estimatedDocumentCount(),
    authorCount: async () => Author.collection.estimatedDocumentCount(),
    allBooks: async (_, { author, genre }) => {
      const filter = {}
      if (author) {
        const authorInDatabase = await Author.findOne({ name: author })
        if (authorInDatabase) {
          filter.author = authorInDatabase.id
        }
      }
      if (genre) {
        filter.genres = { $in: [genre] }
      }
      return await Book.find(filter).lean({ virtuals: true }).populate('author')
    },
    allAuthors: async () => Author.find({}),
    me: (_, __, { currentUser }) => currentUser,
  },
  Author: {
    bookCount: async ({ id }, __, context) => await context.bookLoader.load(id),
  },
  Mutation: {
    addBook: async (_, { book }, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Access Denied')
      }

      const { author } = book
      let authorInDatabase = await Author.findOne({ name: author })
      if (!authorInDatabase) {
        authorInDatabase = new Author({ name: author })
        try {
          await authorInDatabase.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: author,
          })
        }
      }

      const newBook = new Book({ ...book, author: authorInDatabase.id })
      try {
        await newBook.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: book,
        })
      }

      const bookWithAuthor = await newBook.populate('author')
      pubsub.publish('BOOK_ADDED', { bookAdded: bookWithAuthor })

      return {
        code: '0',
        success: true,
        message: `'${book.title}' book was successfully added`,
        book: bookWithAuthor,
        author: authorInDatabase,
      }
    },
    editAuthor: async (_, { name, setBornTo }, { currentUser }) => {
      if (!currentUser) {
        throw new AuthenticationError('Access Denied')
      }
      const authorInDatabase = await Author.findOne({ name })

      if (authorInDatabase) {
        authorInDatabase.born = setBornTo
        try {
          await authorInDatabase.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            invalidArgs: setBornTo,
          })
        }
        return {
          code: '0',
          success: true,
          message: `Year of birth of ${name} was updated`,
          author: authorInDatabase,
        }
      }

      return {
        code: '1',
        success: false,
        message: 'ERROR',
        author: null,
      }
    },
    createUser: async (_, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre })

      try {
        await user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: username,
        })
      }

      return {
        code: '0',
        success: true,
        message: `User ${username} was created`,
        user,
      }
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username })

      if (!user || password !== 'secret') {
        throw new UserInputError('wrong credentials')
      }
      const userForToken = {
        username,
        id: user.id,
      }

      return {
        code: '0',
        success: true,
        message: 'Successfull login',
        token: { value: jwt.sign(userForToken, process.env.JWT_SECRET) },
      }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}
