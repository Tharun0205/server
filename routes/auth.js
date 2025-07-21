import express from 'express';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// ✅ Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const alreadyUser = await User.findOne({ email });
    if (alreadyUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// ✅ Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ Set session
    req.session.userId = user._id;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// ✅ Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid', {
      secure: true,
      sameSite: 'none'
    });
    res.json({ message: 'Logged out successfully' });
  });
});
//
export default router;
