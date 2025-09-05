const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100        
},
  dateOfBirth: {
    type: Date,
    validate: {
        validator: function(value) {
          if (!value) return false;
          const today = new Date();
          let  age = today.getFullYear() - value.getFullYear();
          const m = today.getMonth() - value.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
            age--; // chưa tới sinh nhật năm nay
          }
          return age >= 18 && age <= 100;
        },
        message: props => `Tuổi phải từ 18 đến 100! Ngày sinh bạn nhập: ${props.value.toDateString()}`
      }  
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