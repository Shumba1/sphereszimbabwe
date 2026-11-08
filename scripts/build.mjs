import {mkdir, rm, copyFile, writeFile} from 'node:fs/promises';

// Publish only website files. Operations notes, tests and exports stay out of the CDN.
const files = ['index.html','privacy.html','thanks.html','privacy-received.html',
  'robots.txt','sitemap.xml','assets/styles.css','assets/main.js',
  'assets/favicon.svg','assets/social-preview.png'];
await rm('dist', {recursive:true, force:true});
await mkdir('dist/assets', {recursive:true});
for (const file of files) await copyFile(file, `dist/${file}`);
await writeFile('dist/build-info.json', JSON.stringify({
  commit: process.env.COMMIT_REF || 'local-preview',
  built_at: new Date().toISOString(),
}) + '\n');
console.log(`Prepared ${files.length} website files.`);
