// Copies the PHP backend (api/, data/, server-time.php) into dist/ after
// the Vite build, since those aren't part of the React bundle but still
// need to sit next to it when deployed to Apache.
import { cpSync, copyFileSync, existsSync } from 'node:fs';

for (const item of ['api', 'data', 'server-time.php']) {
  if (existsSync(item)) {
    cpSync(item, `dist/${item}`, { recursive: true });
    console.log(`copied ${item} -> dist/${item}`);
  }
}

for (const name of ['admin', 'bookings', 'profiles', 'registered-users', 'reviews']) {
  const runtimeFile = `dist/data/${name}.json`;
  const exampleFile = `dist/data/${name}.example.json`;
  if (!existsSync(runtimeFile) && existsSync(exampleFile)) {
    copyFileSync(exampleFile, runtimeFile);
    console.log(`created empty ${runtimeFile}`);
  }
}
