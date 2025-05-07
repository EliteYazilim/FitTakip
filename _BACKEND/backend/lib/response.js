import CustomError from "./error.js";
import Enum from "../config/enum.js";

class Response {
    constructor() { }

    static successResponse(data, code = 200) {
        return {
            data,
            code
        }
    }

    static errorResponse(error) {
        console.error(error)

        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        } else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: "Zaten var!",
                    description: "Zaten var!"
                }
            }
        }

        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error: {
                message: "Unknow error",
                description: error.message
            }
        }
    }

}

export default Response;