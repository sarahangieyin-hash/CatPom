export default async function loadEvents(client) {

    client.once('ready', () => {

        console.log(`🤖 Bot conectado como ${client.user.tag}`);

    });

}
