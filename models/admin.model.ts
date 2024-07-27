import mongoose, { Schema, Model, Document } from "mongoose";
import bcrypt from "bcryptjs";
require("dotenv").config();
import jwt from "jsonwebtoken";

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegexPattern =
	/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export interface IAdmin extends Document {
	name: string;
	email: string;
	password: string;
	SignAccessToken: () => string;
	SignRefreshToken: () => string;
}

const adminSchema: Schema<IAdmin> = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please enter your name"],
		},
		email: {
			type: String,
			required: [true, "Please enter your email"],
			validate: {
				validator: function (value: string) {
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
				validator: function (value: string) {
					return passwordRegexPattern.test(value);
				},
				message: "please enter a valid email",
			},
		},
	},
	{ timestamps: true }
);

adminSchema.pre<IAdmin>("save", async function (next) {
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

adminSchema.methods.comparePassword = async function (
	enteredPass: string
): Promise<boolean> {
	return await bcrypt.compare(enteredPass, this.password);
};

const adminModel: Model<IAdmin> = mongoose.model("Admin", adminSchema);

export default adminModel;
