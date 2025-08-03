const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// connecting Express to MongoDB using Mongoose
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

main()
    .then(() => {console.log("connected to DB");})
    .catch(err => console.log(err));


// initialise the data from data.js file     
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner:"68870695b076d79b96506cbb"}));
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}

initDB();