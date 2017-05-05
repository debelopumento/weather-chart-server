const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const request = require("request");

mongoose.Promise = global.Promise;

try {
	require("dotenv").config();
} catch (error) {
	console.warn("unable to load .env");
}

const { PORT, DATABASE_URL } = require("./config");
console.log("DATABASE_URL: ", DATABASE_URL);

const { History } = require("./models-history");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(morgan("common"));
app.use(express.static("build"));

app.get("/", (req, res) => {
	res.json({ message: "directional dyslexia" });
});

app.get("/all", (req, res) => {
	History.find()
		.exec()
		.then(data => {
			res.json({ data: data });
		})
		.catch(e => {
			res.json({ e });
		});
});

app.post("/write", (req, res) => {
	const url =
		"http://api.wunderground.com/api/c905350f371fe191/history_19600815/q/CA/San_Francisco.json";
	request(url, (error, response, body) => {
		const parsedBody = JSON.parse(body);
		const data = parsedBody.history;
		History.create(data)
			.then(newData => {
				res.json({ data });
			})
			.catch(e => {
				res.json({ message: "no" });
			});
	});
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}
			server = app
				.listen(port, () => {
					console.log(`Your app is listening on port ${port}`);
					resolve();
				})
				.on("error", err => {
					mongoose.disconnect();
					reject(err);
				});
		});
	});
}
function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log("Closing server");
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
