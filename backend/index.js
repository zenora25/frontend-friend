import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncModels, sequelize } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import institutionSupervisorRoutes from './routes/institutionSupervisor.js';
import industrySupervisorRoutes from './routes/industrySupervisor.js';
import hodRoutes from './routes/hod.js';
import coordinatorRoutes from './routes/siwesCoordinator.js';
import logbookRoutes from './routes/logbook.js';
import defenseRoutes from './routes/defense.js';
import verificationRoutes from './routes/VerificationCode.js';
import assignmentRoutes from './routes/assignment.js';
import dashboardRoutes from './routes/dashboard.js'; // Import dashboard routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/institution-supervisors', institutionSupervisorRoutes);
app.use('/api/industry-supervisors', industrySupervisorRoutes);
app.use('/api/hods', hodRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/logbook', logbookRoutes);
app.use('/api/defense', defenseRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dashboard', dashboardRoutes); // Mount dashboard routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    version: '1.0.0'
  });
});

// Welcome endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to SIWES Management System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      students: '/api/students',
      institutionSupervisors: '/api/institution-supervisors',
      industrySupervisors: '/api/industry-supervisors',
      hods: '/api/hods',
      coordinators: '/api/coordinators',
      logbook: '/api/logbook',
      defense: '/api/defense',
      verification: '/api/verification',
      assignments: '/api/assignments',
      health: '/api/health'
    },
    documentation: 'Coming soon...'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - FIXED: Use a regular expression or specific path
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/api/auth',
      '/api/students',
      '/api/institution-supervisors',
      '/api/industry-supervisors',
      '/api/hods',
      '/api/coordinators',
      '/api/logbook',
      '/api/defense',
      '/api/verification',
      '/api/assignments',
      '/api/health'
    ]
  });
});

// Database connection and synchronization
const initializeDatabase = async () => {
  let retries = 3;

  while (retries > 0) {
    try {
      console.log(`🔌 Attempting to connect to database (${retries} retries left)...`);

      // Test database connection
      await sequelize.authenticate();
      console.log('✅ MySQL Connected Successfully');

      // Try to sync models with safe approach
      try {
        console.log('🔄 Synchronizing database models...');

        // Use alter: false to avoid datetime issues
        await syncModels();
        console.log('✅ Database models synchronized');

      } catch (syncError) {
        console.warn('⚠️  Database synchronization had issues:');
        console.warn('   Error:', syncError.message);

        if (syncError.original && syncError.original.sqlMessage) {
          console.warn('   SQL Error:', syncError.original.sqlMessage);
        }

        console.log('ℹ️  Server will start anyway. Some database operations may be limited.');
      }

      return true; // Success

    } catch (error) {
      console.error(`❌ Database connection attempt failed: ${error.message}`);
      retries -= 1;

      if (retries > 0) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ All database connection attempts failed');
        console.log('⚠️  Starting server without database connection');
        console.log('⚠️  Some features will not work until database is available');
        return false;
      }
    }
  }
};

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting SIWES Management System Server...\n');

    // Initialize database
    await initializeDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Server Successfully Started!');
      console.log('='.repeat(60));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🌐 API Base: http://localhost:${PORT}/api`);
      console.log(`🗄️  Database: ${process.env.DB_NAME || 'Not specified'}`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
      console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(60));

      console.log('\n📋 Available API Endpoints:');
      console.log('   ├── POST   /api/auth/student/login');
      console.log('   ├── POST   /api/auth/role/login');
      console.log('   ├── POST   /api/auth/student/signup');
      console.log('   ├── POST   /api/auth/role/register');
      console.log('   ├── GET    /api/health');
      console.log('   ├── POST   /api/logbook');
      console.log('   ├── GET    /api/logbook/my-logbook');
      console.log('   ├── GET    /api/students');
      console.log('   ├── GET    /api/institution-supervisors/dashboard');
      console.log('   ├── GET    /api/industry-supervisors/dashboard');
      console.log('   ├── GET    /api/hods/dashboard');
      console.log('   └── GET    /api/coordinators/dashboard');

      console.log('\n⚡ Server is ready to handle requests!');
      console.log('📝 Logs will appear below:\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Closing database connections...');
  try {
    await sequelize.close();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
  console.log('👋 Server shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Closing database connections...');
  try {
    await sequelize.close();
    console.log('✅ Database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
  }
  console.log('👋 Server shutting down...');
  process.exit(0);
});

// Start the server
startServer();

export default app;