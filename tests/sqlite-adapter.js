import { DatabaseSync } from 'node:sqlite';

export default function sqlite(filename) {
  const database = new DatabaseSync(filename);
  return {
    exec: sql => database.exec(sql),
    pragma: sql => database.exec(`PRAGMA ${sql}`),
    prepare: sql => database.prepare(sql),
    close: () => database.close()
  };
}
