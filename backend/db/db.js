import mongoose from "mongoose";


function connect() {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("Connected to MongoDB");
        })
        .catch(err => {
            console.error("MongoDB connection error:", err);
        });
}

export default connect;