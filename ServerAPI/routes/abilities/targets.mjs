import express from "express";
import { dbAbilities } from "../../db/conn.mjs";

const router = express.Router();

// This section will help you get a list of all the targets.
router.get("/targets", async (req, res) => {
  let collection = await dbAbilities.collection("targets");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

export default router;