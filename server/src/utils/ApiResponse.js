class ApiResponse {

    constructor(
        statusCode,
        data = null,
        message = "Success."
    ) {

        this.statusCode = statusCode;
        this.success = statusCode < 400;
        this.message = message;
        this.data = data;

    }

}

export default ApiResponse;