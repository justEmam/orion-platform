import * as migration_20260710_163118_initial from './20260710_163118_initial';
import * as migration_20260710_190103_initial from './20260710_190103_initial';
import * as migration_20260710_202930_add_seeded_flag from './20260710_202930_add_seeded_flag';

export const migrations = [
  {
    up: migration_20260710_163118_initial.up,
    down: migration_20260710_163118_initial.down,
    name: '20260710_163118_initial',
  },
  {
    up: migration_20260710_190103_initial.up,
    down: migration_20260710_190103_initial.down,
    name: '20260710_190103_initial',
  },
  {
    up: migration_20260710_202930_add_seeded_flag.up,
    down: migration_20260710_202930_add_seeded_flag.down,
    name: '20260710_202930_add_seeded_flag'
  },
];
