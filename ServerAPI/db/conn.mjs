import { MongoClient } from "mongodb";

const connectionString = process.env.ATLAS_URI || "";

const client = new MongoClient(connectionString);

let conn;
try {
  conn = await client.connect();
  console.log("Connected to db.")
} catch(e) {
  console.error(e);
}

export const dbMonsters = conn.db("monsters");
export const dbAbilities = conn.db("abilities");
export const dbGeneral = conn.db("general");
export const dbWeapons = conn.db("weapons");