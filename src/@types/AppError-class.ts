// App error class
class AppError extends Error {

    public status!: number;
    public message!: string;
    public payload!: any | undefined

    constructor(status: number, message: string, payload: any | undefined = undefined) {
        super(message);
        this.status = status;
        this.message = message;
        if (payload) this.payload = payload;
    }

}

export default AppError;