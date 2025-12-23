//Host.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    default: 'host',
    enum: ['host', 'super_admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
hostSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
hostSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Host = mongoose.model('Host', hostSchema);

// Create dummy host if doesn't exist
const createDummyHost = async () => {
  try {
    const existingHost = await Host.findOne({ email: 'admin@dentoji.com' });
    
    if (!existingHost) {
      await Host.create({
        name: 'Admin Host',
        email: 'admin@dentoji.com',
        password: 'admin123',
        role: 'host',
        isActive: true
      });
      //console.log('Dummy host created: admin@dentoji.com / admin123');
    }
  } catch (error) {
    console.error('Error creating dummy host:', error.message);
  }
};

// Auto-create dummy host on model load
createDummyHost();

export default Host;