import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern =
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{1,8}$/;


const adminSchema = new Schema({
	name: {
		type: String,
		required: true,
		lowercase: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: {
			validator: function (value) {
				return emailRegexPattern.test(value)
			},
			message: "Please enter valid email address."
		}
	},
	password: {
		type: String,
		required: true,
		validate: {
			validator: function (value) {
				return passwordRegexPattern.test(value)
			},
			message: "Password must be 8 characters long."
		},

	},
}
);

adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	const salt = await bcrypt.genSalt(10)
	const hashedPassword = await bcrypt.hash(this.password, salt)
	this.password = hashedPassword
	next();
});

// sign access token
adminSchema.methods.SignAccessToken = function () {
	return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
		expiresIn: "5m",
	});
};

// sign access token
adminSchema.methods.SignRefreshToken = function () {
	return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
		expiresIn: "3d",
	});
};

// Validate password
adminSchema.methods.ComparePassword = async function (enteredPass) {
	return await bcrypt.compare(enteredPass, this.password);
};

const Admin = model("Admin", adminSchema);

export default Admin;
