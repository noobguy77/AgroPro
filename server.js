const express = require("express");
const http = require("http");
const {
    Server
} = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("view engine", "ejs");
app.use('/public', express.static('./public/'));
app.get('/', (req, res) => {
    res.render("index", {
        username: ""
    });
})



const mongoose = require("mongoose");

const userRoute = require("./routes/users");
var bodyParser = require('body-parser');
// app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({
    limit: "50mb",
    extended: true,
    parameterLimit: 5000000000
}))

MONGO_URL = "mongodb+srv://akhil:noob@cluster0.ysada.mongodb.net/hack-users?retryWrites=true&w=majority";
mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(console.log("connected to mongodb")).catch((err) => console.log(err));


app.use('/api/user', userRoute);

// app.get('/*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'))
// })
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/prices", (req, res) => {
    res.render("prices");
});
app.get("/weather-forecast", (req, res) => {
    res.render("weather");
});
app.get('/crops', (req, res) => {
    res.render('crops');
})
app.get('/agro-chemicals', (req, res) => {
    res.render('agrochemicals');
})
app.get('/chat', (req, res) => {
    res.render('chat');
})
app.get('/:username', (req, res) => {
    var username = req.params['username'];
    res.render("index", {
        // console.log(req.url);
        username: username
    });
})

var usernames = {};
var rooms = [{
        name: "global",
        creator: "Anonymous"
    },
    {
        name: "Farmers Union",
        creator: "Anonymous"
    },
];

io.on("connection", function (socket) {
    console.log(`User connected to server.`);

    socket.on("createUser", function (username) {
        socket.username = username;
        usernames[username] = username;
        socket.currentRoom = "global";
        socket.join("global");

        console.log(`User ${username} created on server successfully.`);

        socket.emit("updateChat", "INFO", "You have joined global room");
        socket.broadcast
            .to("global")
            .emit("updateChat", "INFO", username + " has joined global room");
        io.sockets.emit("updateUsers", usernames);
        socket.emit("updateRooms", rooms, "global");
    });

    socket.on("sendMessage", function (data) {
        io.sockets.to(socket.currentRoom).emit("updateChat", socket.username, data);
    });

    socket.on("createRoom", function (room) {
        if (room != null) {
            rooms.push({
                name: room,
                creator: socket.username
            });
            io.sockets.emit("updateRooms", rooms, null);
        }
    });

    socket.on("updateRooms", function (room) {
        socket.broadcast
            .to(socket.currentRoom)
            .emit("updateChat", "INFO", socket.username + " left room");
        socket.leave(socket.currentRoom);
        socket.currentRoom = room;
        socket.join(room);
        socket.emit("updateChat", "INFO", "You have joined " + room + " room");
        socket.broadcast
            .to(room)
            .emit(
                "updateChat",
                "INFO",
                socket.username + " has joined " + room + " room"
            );
    });

    socket.on("disconnect", function () {
        console.log(`User ${socket.username} disconnected from server.`);
        delete usernames[socket.username];
        io.sockets.emit("updateUsers", usernames);
        socket.broadcast.emit(
            "updateChat",
            "INFO",
            socket.username + " has disconnected"
        );
    });
});

server.listen(6969, function () {
    console.log("Listening to port 5000.");
});