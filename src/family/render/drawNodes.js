import { loadImage } from 'canvas';

export async function drawNodes(
    ctx,
    layout
) {

    for (const node of layout.nodes) {

        const member =
            await layout.guild.members.fetch(node.id).catch(() => null);

        const user =
            member?.user;

        const displayName =
            member?.displayName ??
            user?.displayName ??
            user?.username ??
            node.id;

        const radius = 55;

        ctx.beginPath();

        ctx.arc(
            node.x,
            node.y,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
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
                    radius - 4,
                    0,
                    Math.PI * 2
                );

                ctx.clip();

                ctx.drawImage(
                    avatar,
                    node.x - radius + 4,
                    node.y - radius + 4,
                    (radius - 4) * 2,
                    (radius - 4) * 2
                );

                ctx.restore();

            } catch {}

        }

        ctx.fillStyle = "#000000";
        ctx.font = "bold 22px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";

        let name = displayName;

        if (name.length > 14)
            name = name.slice(0, 11) + "...";

        ctx.fillText(
            name,
            node.x,
            node.y + 70
        );

    }

}
