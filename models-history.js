const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
	date: {
		pretty: String,
		year: String,
		mon: String,
		mday: String,
		hour: String,
		min: String,
		tzname: String
	},
	utcdate: {
		pretty: String,
		year: String,
		mon: String,
		mday: String,
		hour: String,
		min: String,
		tzname: String
	},
	observations: [
		{
			date: {
				pretty: String,
				year: String,
				mon: String,
				mday: String,
				hour: String,
				min: String,
				tzname: String
			},
			utcdate: {
				pretty: String,
				year: String,
				mon: String,
				mday: String,
				hour: String,
				min: String,
				tzname: String
			},
			tempm: String,
			tempi: String,
			dewptm: String,
			dewpti: String
		}
	],
	dailysummary: [
		{
			date: {
				pretty: String,
				year: String,
				mon: String,
				mday: String,
				hour: String,
				min: String,
				tzname: String
			},
			meantempm: String,
			meantempi: String,
			meandewptm: String,
			meandewpti: String,
			maxtempm: String,
			maxtempi: String,
			mintempm: String,
			mintempi: String,
			maxdewptm: String,
			maxdewpti: String,
			mindewptm: String,
			mindewpti: String
		}
	]
});

historySchema.methods.apiRepr = () => {
	return {
		id: this._id,
		date: this.date,
		utcdate: this.utcdate,
		observations: this.observations,
		dailysummary: this.dailysummary
	};
};

const History = mongoose.model("History", historySchema, "historycollection");

module.exports = { History };
