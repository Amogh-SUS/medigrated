const express = require('express');
require('dotenv').config();
const connectDB = require('./database/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth/auth-routes');
const patientRoutes = require('./routes/patient/patient-routes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Expires', 'Pragma'],
        credentials: true
    })
);
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
