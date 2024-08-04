class ExpressError extends Error{
    constructor(statusCode,msg){
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;