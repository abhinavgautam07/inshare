
function genrateError(status, message) {
    return JSON.stringify({ status, message });
}

function parseError(stringifiedError) {
    try {
        let errorObj = JSON.parse(stringifiedError);
        return errorObj
    } catch (error) {
        return {status : 500, message: 'somthing went wrong.' };
    }
}

module.exports = {genrateError : genrateError,parseError : parseError}