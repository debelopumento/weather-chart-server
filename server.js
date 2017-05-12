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
	res.json({ message: "The borrower arriedii" });
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

const writeData = date => {
	const url = `http://api.wunderground.com/api/9181f0b4a8b550bc/history_${date}/q/CA/San_Francisco.json`;
	request(url, (error, response, body) => {
		const parsedBody = JSON.parse(body);
		const data = parsedBody.history;
		//console.log(19, url);
		console.log(21, date);
		const newDataObservations = data.observations.map(observation => {
			return {
				tempi: observation.tempi
			};
		});
		const newData = {
			date: {
				year: data.date.year,
				mon: data.date.mon,
				mday: data.date.mday
			},
			dailysummary: [
				{
					maxtempi: data.dailysummary[0].maxtempi,
					mintempi: data.dailysummary[0].mintempi
				}
			],
			observations: newDataObservations
		};
		History.create(newData)
			.then(newData => {
				res.json({ data });
				console.log("success! ", date);
			})
			.catch(e => {
				res.json({ message: "no" });
			});
	});
};

const write = () => {
	let year = 1970;
	const writeMonth = mon => {
		if (year <= 1970) {
			if (mon < 10) {
				mon = "0" + mon;
			}
			for (let mday = 1; mday <= 31; mday++) {
				if (mday < 10) {
					mday = "0" + mday;
				} else {
					mday = mday.toString();
				}
				const date = `${year}${mon}${mday}`;
				console.log(date);
				writeData(date);
			}
			if (mon < 12) {
				mon = Number(mon) + 1;
				setTimeout(function() {
					writeMonth(mon);
				}, 30000);
			} else if (mon === 12) {
				mon = 1;
				year++;
				setTimeout(function() {
					writeMonth(mon);
				}, 30000);
			}
		}
	};
	writeMonth(1);
};
//write();

app.get("/getHistoryData/:year/:mon/:mday", (req, res) => {
	History.find({
		"date.year": req.params.year,
		"date.mon": req.params.mon,
		"date.mday": req.params.mday
	})
		.exec()
		.then(result => {
			res.json({ result });
		})
		.catch(e => {
			res.json({ message: "Internal server error." });
		});
});

app.get("/getHistoryData/:date", (req, res) => {
	const year = req.params.date.slice(0, 4);
	const mon = req.params.date.slice(4, 6);
	const mday = req.params.date.slice(6, 8);
	History.find({
		"date.year": year,
		"date.mon": mon,
		"date.mday": mday
	})
		.exec()
		.then(result => {
			res.json({ result });
		})
		.catch(e => {
			res.json({ message: "Internal server error." });
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
