import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);


export default async function loadInteractions(client) {

  const interactionTypes = [
    {
      folder: 'buttons',
      collection: client.buttons
    },
    {
      folder: 'selectMenus',
      collection: client.selectMenus
    }
  ];


  for (const type of interactionTypes) {

    const folderPath = path.join(
      __dirname,
      '../../interactions',
      type.folder
    );


    if (!fs.existsSync(folderPath))
      continue;


    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.js'));


    for (const file of files) {

      const interaction = await import(
        `../../interactions/${type.folder}/${file}`
      );


      const data = interaction.default;

      if (!data?.customId || !data.execute)
        continue;


      type.collection.set(
        data.customId,
        data
      );
    }
  }
}
