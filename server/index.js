import dotenv from 'dotenv'
dotenv.config()

import { ApolloServer, gql } from 'apollo-server-express'
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core'

import { readFileSync } from 'fs'
const typeDefs = gql(readFileSync('./schema.graphql', { encoding: 'utf-8' }))

import { resolvers } from './resolvers.js'

import express from 'express'
import { createServer } from 'http'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/lib/use/ws'

import jwt from 'jsonwebtoken'

import mongoose from 'mongoose'
import { Author, Book, User } from './models/index.js'
import { authors, books } from './utils/constants.js'

import DataLoader from 'dataloader'

const getBookLoader = () =>
  new DataLoader(async (authorIds) => {
    const books = await Book.find({ author: { $in: authorIds } })
    const bookMap = {}

    authorIds.forEach((authorId) => {
      bookMap[authorId] = books.filter((b) => b.author.toString() === authorId)
    })

    return authorIds.map((authorId) => bookMap[authorId].length)
  })

const MONGODB_URI = process.env.MONGODB_URI

const resetDatabase = async () => {
  await Promise.all([Book.deleteMany({}), Author.deleteMany({})])
  await Promise.all([Author.insertMany(authors)])
  // , User.insertMany(users)])
  const authorsInDatabase = await Author.find({})
  const booksInit = []
  for (const book of books) {
    const id = authorsInDatabase[Math.floor(Math.random() * authors.length)].id
    const newBook = new Book({
      ...book,
      author: id,
    })
    booksInit.push(newBook)
  }
  await Book.insertMany(booksInit)
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to database')
    console.log('Reset database')
  })
  .then(resetDatabase())
  .then(() => console.log('Database is ready'))
  .catch((error) => console.log(error.message))

mongoose.set('debug', true)

const start = async () => {
  const app = express()
  const httpServer = createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '',
  })

  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
    context: async ({ req }) => {
      let currentUser = null
      const auth = req.headers.authorization || ''
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.JWT_SECRET
        )
        currentUser = await User.findById(decodedToken.id)
      }
      return {
        currentUser,
        bookLoader: getBookLoader(),
      }
    },
  })

  await server.start()
  server.applyMiddleware({
    app,
    path: '/',
  })

  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve))
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

start()
