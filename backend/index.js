const app = require('./src/app');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/database/connectDB');
const HealthCheckRoute = require('./src/routes/HealthCheckRoute');
const UserRouter = require('./src/routes/UserRoute');
dotenv.config();


app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));

const PORT = process.env.PORT || 3000;

app.use('/api/healthCheck', HealthCheckRoute);

app.use('/api/user', UserRouter);
app.get('/', (req, res) => {
    res.send('Welcome to the API');
});





connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log("https://localhost:8000");
        console.log("Database connection established successfully.");
    });
}).catch(error => {
    console.error("Failed to start the server", error);
    process.exit(1);
});


