// custom error class
class UserError extends Error {
	constructor(message, user_message, code) {
		super(message);
		this.name = this.constructor.name;
		this.code = code;
		this.user_message = user_message;
	}
}

export default UserError;
