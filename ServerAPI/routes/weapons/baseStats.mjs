import express from "express";
import { dbWeapons } from "../../db/conn.mjs";

const router = express.Router();

// This section will help you get a list of all the base weapons stats.
router.get("/baseStats", async (req, res) => {
  let collection = await dbWeapons.collection("baseStats");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

export default router;