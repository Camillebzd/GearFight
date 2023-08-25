import express from "express";
import { dbGeneral } from "../../db/conn.mjs";

const router = express.Router();

// This section will help you get a list of all the experiences.
router.get("/experiences", async (req, res) => {
  let collection = await dbGeneral.collection("experience");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

export default router;