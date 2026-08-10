require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const { globalErrorHandler } = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/modules/users/routes/authRoutes');
const associationRoutes = require('./src/modules/associations/routes/associationRoutes');
const flatRoutes = require('./src/modules/associations/routes/flatRoutes');
const visitorRoutes = require('./src/modules/visitors/routes/visitorRoutes');
const complaintRoutes = require('./src/modules/helpdesk/routes/complaintRoutes');
const noticeRoutes = require('./src/modules/notices/routes/noticeRoutes');
const invoiceRoutes = require('./src/modules/billing/routes/invoiceRoutes');
const supportRoutes = require('./src/modules/support/routes/supportRoutes');

// ----------------Initialize Express App------------
const app = express();

// ----------------Connect to MongoDB Atlas------------
connectDB();

// ----------------Global Middlewares------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ----------------API Routes------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/associations', associationRoutes);
app.use('/api/v1/flats', flatRoutes);
app.use('/api/v1/visitors', visitorRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/billing', invoiceRoutes);
app.use('/api/v1/support', supportRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'LiveMitra API is running securely 🟢' });
});

// ----------------Unhandled Route Fallback------------
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found on this server.` });
});

// ----------------Global Error Handling Middleware------------
app.use(globalErrorHandler);

// ----------------Start the Server (or Export for Vercel)------------
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 LiveMitra Server running on port ${PORT}`);
  });
}

// Export for serverless (Vercel)
module.exports = app;
