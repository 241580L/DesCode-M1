function wiz(err, msg = "Error:") {
    if (process.env.DEBUG_MODE) {
        console.log(`${msg}\n${err}`);
    }
}
module.exports = { wiz };