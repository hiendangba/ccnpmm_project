const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100        
},
  age: {
    type: Number,
    min: [18, 'Tuổi phải từ 18 trở lên'],
    max: [100, 'Tuổi không được vượt quá 100']             
  },
  email: {
    type: String,
    required: true,
    unique: true,          
  },
  mssv:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    require: true
  },
  gender:{
    type: String,
    enum: ['nam', 'nữ', 'khác']
  },
  address:{
    type: String,
  },
  bio:{
    type: String,
    maxlength: 500
  },
  avatar:{
    type: String,
  }
}, {
  timestamps: true // tự động tạo createdAt và updatedAt
});

const User = mongoose.model('User', userSchema);
module.exports = User;