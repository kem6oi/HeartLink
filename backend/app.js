// backend/app.js
const express = require('express');
const serverConfig = require('./config/server'); // Assuming this defines PORT or server start logic
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes'); // Require Staff Routes
// TODO: Require other route modules as they are created (e.g., userRoutes, adminRoutes)

const app = express();

// Basic middleware setup
app.use(express.json()); // Parses incoming requests with JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads

// Mount Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Staff Routes
app.use('/api/staff', staffRoutes);

// TODO: Mount other domain-specific routes (e.g., /api/users, /api/admin)
// Example:
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);
// const adminRoutes = require('./routes/adminRoutes');
// app.use('/api/admin', adminRoutes);


// Basic home route
app.get('/api', (req, res) => {
    res.json({ message: 'HeartMatch backend API is running!' });
});

// Basic error handling middleware (example)
// This should be defined after all other app.use() and routes calls
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack || err.message || err);
    // Check if the error has a status code and message, otherwise default
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something broke on the server!';
    res.status(statusCode).json({ message });
});

// Start server
const PORT = serverConfig.port || process.env.PORT || 3000; // Prioritize serverConfig
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
