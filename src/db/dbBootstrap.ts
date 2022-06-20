import mongoose from "mongoose";

// Database configs
import * as dbConfigs from "../configs/db-config";

// Current database config
const dbConfig = process.env.NODE ? dbConfigs.production : dbConfigs.development;

// Connecting to mongodb
const bootstrapDb = () => {
    mongoose.connect(dbConfig.getURI(), {})
        .then(() => {
            console.log('Connected to MongoDB ...');
        })
        .catch((e) => {
            console.log('Failed to connect to MongoDB ...');
            console.log(e.message);
        })
}

export default bootstrapDb;