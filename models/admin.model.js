import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern =
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const adminSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter your name"],
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
			validate: {
				validator: function (value) {
					return emailRegexPattern.test(value);
				},
				message: "please enter a valid email",
			},
			unique: true,
			lowercase: true,
		},
		password: {
			required: [true, "Please enter your password"],
			minlength: [8, "Please length must be 8 characters long"],
			validate: {
				validator: function (value) {
					return passwordRegexPattern.test(value);
				},
				message: "please enter a valid email",
			},
		},
	},
	{ timestamps: true }
);

adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) {
		next();
	}
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// sign access token
adminSchema.methods.SignAccessToken = function () {
	return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
		expiresIn: "5m",
	});
};

adminSchema.methods.SignRefreshToken = function () {
	return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
		expiresIn: "3d",
	});
};

adminSchema.methods.ComparePassword = async function (enteredPass) {
	return await bcrypt.compare(enteredPass, this.password);
};

const adminModel = mongoose.model("Admin", adminSchema);

export default adminModel;
