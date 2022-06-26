import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // only unique email!
    },
    passwordHash: {
      type: String,
      required: true,
    }, // we must encrypt password and keep it outside DB
    avatarUrl: String, // it's not an object because user avatar value is not necessary
  },
  {
    timestamps: true, // we must always add timestamps to our Schemes
  }
); // Creates User description Schema

export default mongoose.model("User", UserSchema);

// so we are creating MVC - Model (of User), View, Controller
