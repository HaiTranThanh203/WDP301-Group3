const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false }
},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hàm mã hóa sử dụng AES-256-CBC
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  // ENCRYPTION_KEY phải có 32 byte (ví dụ: 32 ký tự)
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
  const iv = crypto.randomBytes(16); // IV có 16 byte
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Lưu IV cùng với dữ liệu mã hóa, cách nhau bằng dấu :
  return iv.toString('hex') + ':' + encrypted;
}

// Hàm giải mã sử dụng AES-256-CBC
function decrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf8');
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

messageSchema.pre('save', function(next) {
    if (this.isModified('content')) {
      try {
        this.content = encrypt(this.content);
        next();
      } catch (err) {
        console.error('Encryption error:', err);
        next(err);
      }
    } else {
      next();
    }
  });
  

// Virtual field để giải mã nội dung khi truy xuất
messageSchema.virtual('plainContent').get(function() {
  try {
    return decrypt(this.content);
  } catch (error) {
    // Nếu có lỗi trong quá trình giải mã, trả về chuỗi gốc (hoặc xử lý theo cách khác)
    return this.content;
  }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;