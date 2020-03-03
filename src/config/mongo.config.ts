import mongoose, { Mongoose } from 'mongoose';
import configData from './mongo-data.config.json';

export module DBDriver {
  export async function connect(): Promise<boolean> {
    try {
      const connected = await this.connectDB(configData.uri);
      console.log("Connected to mongo database successfully");

      return connected;
    } catch(e) {
      console.log('Error happend while connecting to the DB: ', e.message)
    }
  }

  export async function connectDB(DBconnectionString: string): Promise<Mongoose> {
    console.log(`Connecting to DB - uri: ${DBconnectionString}`);
    return mongoose.connect(DBconnectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
  }
}

// When the node process is terminated (Ctrl+c is pressed) , close the connection to the DB.
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});