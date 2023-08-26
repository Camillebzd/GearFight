import express from "express";
import { dbGeneral } from "../../db/conn.mjs";

const router = express.Router();

// This section will help you get a list of all the levels.
router.get("/levels", async (req, res) => {
  let collection = await dbGeneral.collection("leveling");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

export default router;