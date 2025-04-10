const APIResponse = require("../Response/APISuccess")

const healthCheckController
 = async (req, res) => {
    return res.status(200).json(new APIResponse(200, null, "Server is running"));
}

module.exports = healthCheckController
;