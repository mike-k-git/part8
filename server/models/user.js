import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

const schema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
})

schema.plugin(mongooseLeanVirtuals)
export const User = mongoose.model('User', schema)
