module.exports = {
    Response: function (res, statusCode, success, data) {
        // If data is an Error, convert to a safer payload
        let payload = data;
        if (data instanceof Error) {
            payload = { message: data.message };
        }
        // If data is a string, treat it as message
        if (typeof data === 'string') {
            payload = { message: data };
        }
        res.status(statusCode).send({
            success: success,
            data: payload
        })
    }
}