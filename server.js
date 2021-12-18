const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send("Hello");
    res.end();
})

app.listen(6969, () => {
    console.log("Listening bitch 6969");
})