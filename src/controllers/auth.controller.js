const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { successResponse, errorResponse } = require('../utils/response.util');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (role !== 'teacher') {
      return errorResponse(res, 'Public registration is restricted to teachers only', 403);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email already in use', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role });

    successResponse(res, { id: user.id, name: user.name, email: user.email, role: user.role }, 'User registered successfully', 201);
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1d' });

    successResponse(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Login successful');
  } catch (error) {
    errorResponse(res, error, 500);
  }
};

module.exports = { register, login };
