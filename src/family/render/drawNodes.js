export async function drawNodes(
    ctx,
    layout
) {

    for (const node of layout.nodes) {

        const member =
            await layout.guild.members.fetch(node.id).catch(() => null);

        const user =
            member?.user;

        const radius = 55;

        ctx.beginPath();

        ctx.arc(
            node.x,
            node.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = '#2b2d31';
        ctx.fill();

        ctx.strokeStyle = '#5865F2';
        ctx.lineWidth = 5;
        ctx.stroke();

        if (user) {

            try {

                const avatar =
                    await loadImage(
                        user.displayAvatarURL({
                            extension: 'png',
                            size: 128
                        })
                    );

                ctx.save();

                ctx.beginPath();

                ctx.arc(
                    node.x,
                    node.y,
                    radius - 5,
                    0,
                    Math.PI * 2
                );

                ctx.clip();

                ctx.drawImage(
                    avatar,
                    node.x - radius + 5,
                    node.y - radius + 5,
                    (radius - 5) * 2,
                    (radius - 5) * 2
                );

                ctx.restore();

            } catch {}

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 22px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                user.username,
                node.x,
                node.y + 85
            );

        } else {

            ctx.fillStyle = "#ffffff";
            ctx.font = "18px Arial";
            ctx.textAlign = "center";

            ctx.fillText(
                node.id,
                node.x,
                node.y
            );

        }

    }

}
