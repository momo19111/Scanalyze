const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect(process.env.DB_URL)
        .then((conn) => {
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        })
        .catch((err) => {
            console.error(`Error: ${err.message}`);
            process.exit(1);
        });
}


module.exports = connectDB;