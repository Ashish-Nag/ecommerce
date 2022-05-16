

function errorHandler(err, req, res, next) {
    if (err.name == "UnauthorizedError") {
        return res.status(401).json({ msg: "The user is not authorized" });
    }

    if (err.name == "ValidationError") {
        return res.status(401).json({ msg: err });
    }

    console.log(err)
    return res.status(500).json({ msg: "something went wrong" });
}

module.exports = errorHandler;