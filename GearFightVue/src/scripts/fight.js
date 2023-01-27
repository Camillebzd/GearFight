function doDamage(target, amount) {
  target.life -= amount;
}

function doHeal(target, amount) {
  target.life += amount;
}

export function resolveSpell(user, spell, target) {
  switch (spell.data.type) {
    case "DAMAGE":
      doDamage(target, user.attack * spell.data.ratio);
      break;
    case "HEAL":
      doHeal(target, user.attack * spell.data.ratio);
      break;
    default:
      break;
  }
  spell.data.buffs.map(buff => {
    switch (buff.target) {
      case "LAUNCHER":
        addBuff(user, buff);
        break;
      case "ALLIES":
        break;
      case "TARGET":
        addBuff(target, buff);
        break;
      case "ENEMIES":
          break;  
      default:
        break;
    }
  });
  spell.data.debuffs.map(debuff => {
    switch (debuff.target) {
      case "LAUNCHER":
        addDebuff(user, debuff);
        break;
      case "ALLIES":
        break;
      case "TARGET":
        addDebuff(target, debuff);
        break;
      case "ENEMIES":
          break;  
      default:
        break;
    }
  });
}

// export
function addCooldown(user, spellName) {
  const spell = spells[spellName];
  user.Skills_CD[user.Skills.indexOf(spellName)] = spell.cooldown;
}

export function isAlive(entitie) {
  return entitie.life > 0;
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

export function applyBuffs(target) {
  for (let i = 0; i < target.buffs.length; i++) {
    let buff = target.buffs[i];
    target[buff.data.stat] += target[buff.data.stat + "_base"] * buff.data.ratio;
    buff.turns -= 1;
  }
}

function addBuff(target, buff) {  
  for (let i = 0; i < target.buffs.length; i++)
    if (target.buffs[i].name == buff.name && target.buffs[i].id == buff.id) // block the type of buff too ?
      target.buffs.splice(i, 1);
  target.buffs.push({...buff});
  // add 1 turn of buff because the apply will remove 1
  target.buffs[target.buffs.length - 1].turns += 1;
  applyBuffs(target);
}

export function applyDebuffs(target) {
  for (let i = 0; i < target.debuffs.length; i++) {
    let debuff = target.debuffs[i];
    if (debuff.data.type == "DAMAGE") {
      target.life -= target[debuff.data.base] * debuff.data.ratio;
    } else {
      target[debuff.data.stat] -= target[debuff.data.stat + "_base"] * debuff.data.ratio;
    }
    debuff.turns -= 1;
  }
}

function addDebuff(target, debuff) {
  for (let i = 0; i < target.debuffs.length; i++)
    if (target.debuffs[i].name == debuff.name && target.debuffs[i].id == debuff.id) // stack system ???
      target.debuffs.splice(i, 1);
  target.debuffs.push({...debuff});
  // add 1 turn of debuff because the apply will remove 1
  if (debuff.data.type != "DAMAGE") {
    target.buffs[target.buffs.length - 1].turns += 1;
    applyDebuffs(target);
  }
}

function getEntitieFromRoom(room, entitieToFind) {
  return room[entitieToFind.side].find(entitie => entitie.id == entitieToFind.id && entitie.isNPC == entitieToFind.isNPC);
}

function resolveAction(room, action) {
  resolveSpell(getEntitieFromRoom(room, {id: action.user.id, isNPC: action.user.isNPC, side: action.user.side}), action.spell, getEntitieFromRoom(room, {id: action.target.id, isNPC: action.target.isNPC, side: action.target.side}));
}
