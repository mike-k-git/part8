import mongoose from 'mongoose'
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  born: {
    type: Number,
  },
})

schema.plugin(mongooseLeanVirtuals)
export const Author = mongoose.model('Author', schema)
