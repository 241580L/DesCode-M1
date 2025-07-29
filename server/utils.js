function wiz(err, msg = "Error:") {
    if (process.env.DEBUG_MODE) {
        console.log(`${msg}\n${err}`);
    }
}

function log(msg = "") {
    if (process.env.DEBUG_MODE) {
        console.log(`${msg}`);
    }
}
module.exports = { wiz, log };