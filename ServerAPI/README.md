# GearFight Project Server API

Second part of the backend of the project. An Express server on Node connected to MongoDB used for deliver data to the web site like:
- Data of monsters on World page
- Data of weapons required to fight monsters and evolve
- Data of all abilities
- General data like the amount of xp required for a weapon to level up or the amount of xp given by monsters

If you want to run it locally, you can run:
```
node server.mjs
```
It will be accessible on this url: http://localhost:5050

Remember to add a correct ATLAS_URI from mongoDB in a .env file to target the good db.