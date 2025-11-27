import app from './app';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env.local' }); // Load from root .env.local

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
