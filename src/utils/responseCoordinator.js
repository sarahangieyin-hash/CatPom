export class ResponseCoordinator {
    constructor() {
        this.sent = new Set();
    }

    async respond(interaction, payload) {
        if (this.sent.has(interaction.id)) return;

        this.sent.add(interaction.id);

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp(payload);
        }

        return interaction.reply(payload);
    }
}

export default new ResponseCoordinator();
