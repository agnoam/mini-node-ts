# mini-node-ts
Super minimal node.js (typescript) application with: 
    typescript
    jest (testing), 
    nodemon, 
    mongodb (mongoose), 
    firebase
And all of this with 100% typescript support

## Initialize
So how to make this charm to work ???

Just run `yarn` and this project good to go

### Initialize db
If you are using **MongoDB**:
Just paste the uri in mlab website into the `MONGODB_URI` environment variable, and you good to go.

For using **firebase**: download the credentials json file from firebase console and put it in `./config/<your-file>` and don't forget change `serviceAccount` import path to your file path.
*example:* from 

`import serviceAccount from "./firebase-adminsdk.json";` 

to 

`import serviceAccount from "./<firebase-generated-file>.json";`

## Deployment
Easy deploy to Heroku:
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Support
Heroku dyno support
You also can use Heroku's `mLab MongoDB` add-on for easy setup for the production server 

## Debugging
This project customised for Visual Studio Code and has breakpoints support for:
* Regular debugging by `F5` key
* Debuging for typescript jest
* For Nodemon inspection and debugging run `yarn dev` and then run the saved configuration

## Additional info
You can choose ethier mongoose or firebase to use. 
Just remember to remove the dependencies that you don't use, by `yarn remove <dependency_name>`

For example: `yarn remove firebase-admin`.
And also the configurations for db. (`mongo.config.ts` or `firebase.config.ts`)

Before you start you may choose which package manager you want to use along the way. So don't forget to delete the alternative lock file.

For example:
    if you are using `yarn` don't forget to delete `package-lock.json`