# Astro Social Back-end
This is the back-end code for Astro Social. For the Sun calculation library, I'm using my own tiny library. You can get the code on [Calculation of Sun repo](hhttps://github.com/OrionStark/calculation-of-sun)  

# How to run it
```javascript

        // First enter to the project folder with terminal
        // and type : 
        npm start

```

# DON'T FORGET ABOUT DATABASE
First create astro-social database on your mongodb and fill it with user collection. Check this out for collection sample :   
```
    {
        "_id" : ObjectId("5b32ba344f795436f83cfd8d"),
        "username" : "Orion",
        "name" : "Robby",
        "email" : "robby.muhammad24@yahoo.com",
        "password" : "$2a$10$0TgZiQfg3oVn2kuPlADaKu/7pqk1I2JVtK17olZgNPLI9gVLjpGpq"
    }

```
Database Name : astro-social  
Collection Name : user  
User Collection documents field : _id, username, name, email, password  


# I got an error while running the start command
If you get an error when start this project for the first time.  
You need to delete the node_modules folder and run npm install command

# Socket IO Namespace
On this project, I create 2 namespaces for the socket. :
```javascript
        /**
         * Socket namespace for getting the sun data
         */
        let sun_data = socketIO.of('/sun');
        sun_data.on('connection', (socket) => {
            socket.on('get.sun.informations', (data) => {
                console.log(data.user + " asking for sun's data");
                socket.emit('sunsdata', {
                    informations:  sun.sunInformation(new Date(), 3.597031, 98.678513)
                })
            });
        });

        /**
         * Socket namespace for chatting port
         */
        let world_chat = socketIO.of('/chat')
        world_chat.on('connection', (socket) => {
            socket.broadcast.emit('newparticipant', { message: "We got a new participant" });
            socket.on('deliver.message', (data) => {
                world_chat.emit('new.message', data);
            });
        });
```

# Route list and param
Base Url "http://localhost:4322"  

Route | Expected Parameter or Header
----- | ----------------------------
/nasa/neo/today | Authorization header which is already filled with token
/nasa/neo/bydate/:start_date/:end_date | Url params(start_data[string], end_date[string] and Authorization header which is already filled with token) 
/user/login | JSONObject(username, password)
/user/register | JSONObject(username, name, email, password)
  
# Author
## Robby Muhammad Nst
This code is for my lecturer as my assignment. Thankyou

