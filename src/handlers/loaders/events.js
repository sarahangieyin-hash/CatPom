import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


const __dirname = path.dirname(fileURLToPath(import.meta.url));


export default async function loadEvents(client) {

  const eventsPath = path.join(
    __dirname,
    '../../events'
  );


  const files = fs.readdirSync(eventsPath)
    .filter(file => file.endsWith('.js'));


  for (const file of files) {

    const event = await import(
      `../../events/${file}`
    );


    const eventData = event.default;

    if (!eventData?.name || !eventData?.execute)
      continue;


    if (eventData.once) {

      client.once(
        eventData.name,
        (...args) =>
          eventData.execute(...args, client)
      );

    } else {

      client.on(
        eventData.name,
        (...args) =>
          eventData.execute(...args, client)
      );
    }
  }
}
