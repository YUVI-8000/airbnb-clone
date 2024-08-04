const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
},
description: String,
image: {
    type: String,
    required: true,
    default: "https://media.istockphoto.com/id/1339686801/photo/cloud-computing.jpg?s=1024x1024&w=is&k=20&c=DNcyEZ8jSTZ6H14KQOshIK8_ukxU4ZIRGzKLLsV8SJM=",
    set: (v) => v === "" ? "https://media.istockphoto.com/id/1339686801/photo/cloud-computing.jpg?s=1024x1024&w=is&k=20&c=DNcyEZ8jSTZ6H14KQOshIK8_ukxU4ZIRGzKLLsV8SJM=" : v,
},
price: Number,
location: String,
country: String,
reviews: [
  {
    type: Schema.Types.ObjectId,
    ref : "Review",
  }
]
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;