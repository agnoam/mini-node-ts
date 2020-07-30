import mongoose, { Mongoose } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // Loading all environment variables

export module DBDriver {
  export async function connect(): Promise<boolean> {
    try {
      const connected: Mongoose = await connectDB(process.env.MONGODB_URI);
      console.log("Connected to mongo database successfully");

      return connected.connection.readyState == MongooseReadyState.Connected;
    } catch(e) {
      console.log('Error happend while connecting to the DB: ', e.message)
    }
  }

  async function connectDB(DBconnectionString: string): Promise<Mongoose> {
    console.log(`Connecting to DB - uri: ${DBconnectionString}`);
    return mongoose.connect(DBconnectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    },);
  }
}

// When the node process is terminated (Ctrl+c is pressed) , close the connection to the DB.
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected on app termination');
    process.exit(0);
  });
});

enum MongooseReadyState {
  Disconnected,
  Connected,
  Connecting,
  Disconnecting
}