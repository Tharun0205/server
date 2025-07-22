import jwt from 'jsonwebtoken';

const requireLogin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user info from token
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

export default requireLogin;
