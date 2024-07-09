const {ApplicationCommandOptionType} = require('discord.js');
const {useMainPlayer} = require('discord-player');
const {isInVoiceChannel} = require('../utils/voicechannel');
const fs = require('fs');
const { joinVoiceChannel, createAudioResource, createAudioPlayer } = require('@discordjs/voice');

module.exports = {
    name: 'praise',
    description: 'Похвалить хорошего человека',
    async execute(interaction) {
        const {default: Conf} = await import('conf');
        try {
            const audioUrl = './commands/praise'
            const commandFiles = fs.readdirSync(audioUrl).filter(file => file.endsWith('.mp3'));

            console.log(commandFiles)
            const randomElement = commandFiles[Math.floor(Math.random() * commandFiles.length)];

            await interaction.deferReply();

            const player = createAudioPlayer();


            try {
                const config = new Conf({projectName: 'volume'});
                
                const connection = joinVoiceChannel(
                    {
                        channelId: interaction.member.voice.channel.id,
                        guildId: interaction.guild.id,
                        adapterCreator: interaction.guild.voiceAdapterCreator
                    })
                    
                const resource = createAudioResource(`${audioUrl}/${randomElement}`);

                connection.subscribe(player);

                player.play(resource)

                player.on('stateChange', (oldState, newState) => {
                    if (newState.status === 'idle') connection.destroy();
                });

                await interaction.followUp({
                    content: 'Хвалим...',
                });
            } catch (error) {
                await interaction.editReply({
                    content: 'An error has occurred!',
                });
                return console.log(error);
            }
        } catch (error) {
            await interaction.reply({
                content: 'There was an error trying to execute that command: ' + error.message,
            });
        }
    },
};
