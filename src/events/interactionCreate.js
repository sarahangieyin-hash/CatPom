if (interaction.isButton()) {

    const [customId, ...args] =
        interaction.customId.split(':');

    let button = client.buttons.get(customId);


    if (!button) {

        for (const btn of client.buttons.values()) {

            if (
                btn.customIdPrefix &&
                customId.startsWith(btn.customIdPrefix)
            ) {
                button = btn;
                break;
            }

        }

    }


    if (!button) return;


    await button.execute(
        interaction,
        client,
        args
    );


    return;
}
