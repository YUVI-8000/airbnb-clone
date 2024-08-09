const express = require('express');
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const flash = require("connect-flash");

const listings = require("./routes/listing.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

main()
    .then(()=>{
        console.log("connected to data base");
    })
    .catch((err)=>{
        console.log(err);
    });

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOption = {
    secret : "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
};

app.get("/",(req,res)=>{
    res.send("root is working")
});

app.use(session(sessionOption));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    console.log(res.locals.success);
    next();
})

app.use("/Listings",listings);

const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    console.log(req.body.review);
    if(error){
        let errMsg = error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

//review
//post route
app.post("/listings/:id/reviews", validateReview,wrapAsync(async(req,res)=>{
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);

   await newReview.save();
   
   await listing.save();

   res.redirect(`/listings/${listing._id}`);
}));

// delete route 
app.delete("/listings/:id/reviews/:reviewId", wrapAsync (async(req,res)=>{
    let {id, reviewId} = req.params;

    await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review Deleted!");

    res.redirect(`/listings/${id}`);
}))

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page Not Found!"));
});
//expreserr
app.use((err, req, res, next) =>{
    let {statusCode=500, message="SOMETHING WENT WRONG!"} = err;
    // res.status(statusCode).send(message);
    res.render("error.ejs", {err});
    // res.status(statusCode).render("error.ejs",{message});
});


app.listen(8080,()=>{
    console.log("listening at port 8080");
});