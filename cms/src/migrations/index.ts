import * as migration_20260710_163118_initial from './20260710_163118_initial';
import * as migration_20260710_190103_initial from './20260710_190103_initial';
import * as migration_20260710_202930_add_seeded_flag from './20260710_202930_add_seeded_flag';
import * as migration_20260710_230101_add_chat_global from './20260710_230101_add_chat_global';
import * as migration_20260711_002611_add_global_drafts_and_chat_colors from './20260711_002611_add_global_drafts_and_chat_colors';
import * as migration_20260711_005416_add_favicon from './20260711_005416_add_favicon';
import * as migration_20260711_093223_add_escalations from './20260711_093223_add_escalations';
import * as migration_20260711_101542_add_contact_form_fields from './20260711_101542_add_contact_form_fields';

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
    name: '20260710_202930_add_seeded_flag',
  },
  {
    up: migration_20260710_230101_add_chat_global.up,
    down: migration_20260710_230101_add_chat_global.down,
    name: '20260710_230101_add_chat_global',
  },
  {
    up: migration_20260711_002611_add_global_drafts_and_chat_colors.up,
    down: migration_20260711_002611_add_global_drafts_and_chat_colors.down,
    name: '20260711_002611_add_global_drafts_and_chat_colors',
  },
  {
    up: migration_20260711_005416_add_favicon.up,
    down: migration_20260711_005416_add_favicon.down,
    name: '20260711_005416_add_favicon',
  },
  {
    up: migration_20260711_093223_add_escalations.up,
    down: migration_20260711_093223_add_escalations.down,
    name: '20260711_093223_add_escalations',
  },
  {
    up: migration_20260711_101542_add_contact_form_fields.up,
    down: migration_20260711_101542_add_contact_form_fields.down,
    name: '20260711_101542_add_contact_form_fields'
  },
];
