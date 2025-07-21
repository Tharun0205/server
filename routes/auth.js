import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();
router.post('https://invoice-generator-ebon-eight.vercel.app/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res.status(400).json({ message: 'User already Exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username, email, password: hashedPassword
    });
    await newUser.save();
    res.status(201).json({ message: 'User registered Successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration Failed', details: error.message });
  }
});
router.post('https://invoice-generator-ebon-eight.vercel.app/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("user:", user);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password is", isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    req.session.userId = user._id;
    res.json({
      message: 'Login Successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login Failed', message: error.message });
  }
});

router.post('https://invoice-generator-ebon-eight.vercel.app/logout', (req, res) => {
  req.session.destroy((err)=>{
    if(err){
      return res.status(500).json({message:"Logout failed"});
    }
    res.clearCookie('connect.sid');
    res.json({message:"Logged out Sucessfully"});
  });
});

export default router;
