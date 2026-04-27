const app = require('./app');
const sequelize = require('./config/database');
const { User } = require('./models');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 3000;

const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models
    await sequelize.sync({ force: false });
    console.log('Database synced.');

    // Create a default principal if none exists
    const principal = await User.findOne({ where: { role: 'principal' } });
    if (!principal) {
      const password_hash = await bcrypt.hash('principal123', 10);
      await User.create({
        name: 'Default Principal',
        email: 'principal@school.com',
        password_hash,
        role: 'principal'
      });
      console.log('Default Principal created (principal@school.com / principal123)');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
