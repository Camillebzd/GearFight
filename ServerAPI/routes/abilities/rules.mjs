import express from "express";
import { dbAbilities } from "../../db/conn.mjs";

const router = express.Router();

// This section will help you get a list of all the rules.
router.get("/rules", async (req, res) => {
  let collection = await dbAbilities.collection("rules");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

export default router;