import { Weapon } from "@/scripts/entities";
import WeaponCard from "./WeaponCard";

import styles from './List.module.css'

const WeaponList = ({weapons}: {weapons: Weapon[]}) => {
  const weaponList = weapons.map(weapon =>
    <WeaponCard weapon={weapon} key={weapon.id} />
  );

  return (
    <div className={styles.weaponList}>
      {weaponList}
    </div>
  );
}

export default WeaponList;