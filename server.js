const { createServer } = require("http");
const { appendFile, readFile, createReadStream, read } = require("fs");
const path = require("path");
const { EventEmitter } = require("events");
const PORT = 5002;

const NewsLetter = new EventEmitter();

const server = createServer((req, res) => {
    const { url, method } = req

    req.on("error", (err) => {
        console.error(err);
        resStatusCode = 404;
        res.setHeader("content-type", "application/json");
        res.write(JSON.stringify({ msg: "Invalid request: 404" }));
        res.end();
    })

    const chunks = [];

    req.on("data", (chunk) => {
        chunks.push(chunk);
        console.log(chunks);
    });
    req.on("end", () => {
        if (url === "/newsletter_signup" && method === "POST"){
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const newSub = `${body.name}, ${body.email}\n`;
            NewsLetter.emit("signup", newSub, res);
            res.setHeader("content-type", "application/json");
            res.write(
                JSON.stringify({ msg: "Successfully added subscriber!" })
            );
            res.end();
        } else if (url === "/newsletter_signup" && method === "GET"){
            res.setHeader("content-type", "text/html");
            const readStream = createReadStream(
                path.join(__dirname, "./public/index.html")
            )
            readStream.pipe(res);
        } else {
            res.statusCode = 400;
            res.setHeader("content-type", "application/json");
            res.write(JSON.stringify({ msg: "Not a valid endpoint."}))
            res.end();
        }
    })
})
server.listen(PORT, () => console.log(`Server listening at ${PORT}`));

NewsLetter.on("signup", (newSub, res) => {
    appendFile(
        path(__dirname, "./assets/subs.csv"),
        newSub,
        (err) => {
            if (err){
                newSub.emit("error", err, res);
                return;
            }
            console.log("The subscriber was added.");
        }
    )
})

NewsLetter.on('error', (err, res) => {
    console.error(err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify({ msg: 'There was an error in creating a new subscriber.'}))
    res.end();
})