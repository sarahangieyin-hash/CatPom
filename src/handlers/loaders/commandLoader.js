import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
  const commandsPath = path.join(__dirname, '../../commands');

  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);

    if (!fs.statSync(folderPath).isDirectory()) continue;

    const files = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.js'));

    for (const file of files) {
      const command = await import(
        `../../commands/${folder}/${file}`
      );

      const commandData = command.default;

      if (!commandData?.data) continue;

      client.commands.set(
        commandData.data.name,
        commandData
      );
    }
  }
}


export async function registerCommands(client, { clientId }) {
  const commands = [...client.commands.values()]
    .map(command => command.data.toJSON());

  await client.rest.put(
    `/applications/${clientId}/commands`,
    {
      body: commands
    }
  );
}
