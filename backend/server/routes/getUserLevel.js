router.get("/:id/level", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    accountLevel: user.accountLevel,
    accountXp: user.accountXp,
  });
});