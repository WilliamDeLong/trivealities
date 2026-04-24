const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const newUserModel = require("../models/userModel");

router.get("/:id/admin", async (req, res) => {
  try {
	//console.log("Verification 1");
    const { id } = req.params;
    

    if (!mongoose.Types.ObjectId.isValid(id)) {
	  return res.status(400).json({
		message: "Invalid user ID",
	  });
	}

    const user = await newUserModel.findById(id);//.select("adminAccount");
    
	if (!user) {
	  return res.status(404).json({
		message: "User not found",
	  });
	}

    if (typeof user.adminAccount !== "boolean") user.adminAccount = false;

    
    return res.json({
      success: (user.adminAccount?true:false)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;