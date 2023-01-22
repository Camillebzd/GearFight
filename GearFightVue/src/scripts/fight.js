function doDamage(target, amount) {
  target.life -= amount;
}

function doHeal(target, amount) {
  target.life += amount;
}

// export
export function LaunchSpell(user, spell, target) { 
  switch (spell.data.type) {
    case "DAMAGE":
      doDamage(target, user.attack * spell.data.ratio);
      break;
    case "HEAL":
      doHeal(target, user.attack * spell.data.ratio);
      break;
    case "BUFF":
      break;
    default:
      break;
  }
}

// export
function addCooldown(user, spellName) {
  const spell = spells[spellName];
  user.Skills_CD[user.Skills.indexOf(spellName)] = spell.cooldown;
}

function isAlive(user) {
  return user.Life > 0;
}

function applyDamageDebuff(user, debuffName) {
  user.Life -= user[debuffs[debuffName].base] * debuffs[debuffName].ratio;
}

function reduceDebuff(user, debuffName, reduce = 1) {
  const debuffPos = user.Debuffs.indexOf(debuffName);
  let userDebuffCD = user.Debuffs_CD[debuffPos];
  // -1 force clean debuff
  if (reduce < 0)
    userDebuffCD = 0;
  else
    userDebuffCD -= reduce;
  // clean 0 debuff or set new value
  if (userDebuffCD <= 0) {
    delete user.Debuffs[debuffPos];
    delete user.debuffs_CD[debuffPos];
  }
  else
    user.Debuffs_CD[user.Debuffs.indexOf(debuffName)] = userDebuffCD;
}

function handleDamageDebuffs(user) {
  // apply debuff dmg
  user.Debuffs.map((debuffName) => {if (debuffs[debuffName].type === "DAMAGE") applyDamageDebuff(user, debuffName)});
// reduce CD debuff dmg by 1
  user.Debuffs.map((debuffName) => {if (debuffs[debuffName].type === "DAMAGE") reduceDebuff(user, debuffName)});
}

function applyBuffs(user) {
  user.Buffs.map((buffName) => {
  });
}

function extractIdentitie(entitie) {
  return {id: entitie.id, isNPC: entitie.isNPC, side: entitie.side};
}

function checkLife(room) {
  let info = {info: {}, somebodyIsDead: false};

  room.group1.map(entitie => {
    if (entitie.life <= 0) {
      info.info = extractIdentitie(entitie);
      info.somebodyIsDead = true;
    }
  });
  return info;
}

function getEntitieFromRoom(room, entitieToFind) {
  return room[entitieToFind.side].find(entitie => entitie.id == entitieToFind.id && entitie.isNPC == entitieToFind.isNPC);
}

function resolveAction(room, action) {
  launchSpell(getEntitieFromRoom(room, {id: action.user.id, isNPC: action.user.isNPC, side: action.user.side}), action.spell, getEntitieFromRoom(room, {id: action.target.id, isNPC: action.target.isNPC, side: action.target.side}));
}
