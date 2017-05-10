const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
	id: String,
	date: {},
	utcdate: {},
	observations: {},
	dailysummary: {}
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

const History = mongoose.model("History", historySchema, "historycollection3");

module.exports = { History };
