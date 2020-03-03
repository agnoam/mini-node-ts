# mini-node-ts
Super minimal node js application with: 
    jest (testing), 
    nodemon, 
    mongodb (mongoose), 
    firebase
And all of this with 100% typescript support

# Initialize
So how to make this charm to work ???
Just run `yarn` and this project good to go

# Support
Heroku dyno support

# Debugging
This project customised for Visual Studio Code and has breakpoints support for:
* Regular debugging by `F5` key
* Debuging for typescript jest
* For Nodemon inspection and debugging run `yarn dev` and then run the saved configuration

# Additional info
You can choose ethier mongoose or firebase to use. 
Just remember to remove the dependencies that you don't use, by `yarn remove <dependency_name>`

For example: `yarn remove firebase-admin`.
And also the configurations for db. (`mongo.config.ts` or `firebase.config.ts`)