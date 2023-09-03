import express from "express";
import cors from "cors";
import "./loadEnvironment.mjs";
import monsters from "./routes/monsters/monsters.mjs";
import abilities from "./routes/abilities/abilities.mjs";
import effects from "./routes/abilities/effects.mjs";
import rules from "./routes/abilities/rules.mjs";
import modifiers from "./routes/abilities/modifiers.mjs";
import targets from "./routes/abilities/targets.mjs";
import conditions from "./routes/abilities/conditions.mjs";
import orders from "./routes/abilities/orders.mjs";
import levels from "./routes/general/levels.mjs";
import experiences from "./routes/general/experiences.mjs";
import abilitiesWeapons from "./routes/weapons/abilities.mjs";
import baseStats from "./routes/weapons/baseStats.mjs";
import images from "./routes/weapons/images.mjs";
import statsGrowth from "./routes/weapons/statsGrowth.mjs";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/monsters", monsters);
app.use("/abilities", [abilities, effects, rules, modifiers, targets, conditions, orders]);
app.use("/general", [levels, experiences]);
app.use("/weapons", [abilitiesWeapons, baseStats, images, statsGrowth]);

app.get('/', (req, res) => {
  res.json({'message': 'ok'});
});

// start the Express server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port: ${PORT}`);
});