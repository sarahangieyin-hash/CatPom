import 'dotenv/config';
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { REST } from '@discordjs/rest';
import express from 'express';

import config from './config/bot.js';
import { initializeDatabase } from './utils/database.js';
import { logger, startupLog, shutdownLog } from './utils/logger.js';
import { loadCommands, registerCommands as registerSlashCommands } from './handlers/loaders/commandLoader.js';
import { handleTaskError, ErrorCodes } from './utils/errorHandler.js';
import pkg from '../package.json' with { type: 'json' };


console.log("APP STARTED");


const BOT_TOKEN =
    process.env.DISCORD_TOKEN ||
    process.env.TOKEN;


const CLIENT_ID =
    process.env.CLIENT_ID;


console.log(
    "TOKEN EXISTS:",
    Boolean(BOT_TOKEN)
);


console.log(
    "CLIENT ID EXISTS:",
    Boolean(CLIENT_ID)
);



class CatPom extends Client {


    constructor() {

        super({

            intents: [

                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,

            ],

        });


        this.config = config;

        this.commands = new Collection();

        this.buttons = new Collection();

        this.selectMenus = new Collection();


        this.family = {

            graph: null,

            managers: {}

        };


        this.db = null;


        this.rest = new REST({

            version: '10'

        })
        .setToken(BOT_TOKEN);

    }



    async start() {

        try {


            startupLog(
                'Starting CatPom...'
            );


            startupLog(
                'Initializing database...'
            );


            const dbInstance =
                await initializeDatabase();


            this.db =
                dbInstance.db;



            startupLog(
                'Loading commands...'
            );


            await loadCommands(this);


            startupLog(
                `Commands loaded: ${this.commands.size}`
            );



            startupLog(
                'Initializing family system...'
            );


            const { FamilyGraph } =
                await import(
                    './family/utils/graph.js'
                );


            const { FamilyManager } =
                await import(
                    './family/managers/familyManager.js'
                );


            const { MarriageManager } =
                await import(
                    './family/managers/marriageManager.js'
                );


            const { AdoptionManager } =
                await import(
                    './family/managers/adoptionManager.js'
                );


            const { RelationshipManager } =
                await import(
                    './family/managers/relationshipManager.js'
                );



            this.family.graph =
                new FamilyGraph();



            this.family.managers.family =
                new FamilyManager(
                    this.family.graph
                );


            this.family.managers.marriage =
                new MarriageManager(
                    this.family.graph
                );


            this.family.managers.adoption =
                new AdoptionManager(
                    this.family.graph
                );


            this.family.managers.relationship =
                new RelationshipManager(
                    this.family.graph
                );



            startupLog(
                'Family system ready'
            );



            startupLog(
                'Loading handlers...'
            );


            await this.loadHandlers();



            startupLog(
                'Starting web server...'
            );


            this.startWebServer();



            startupLog(
                'Logging into Discord...'
            );


            await this.login(
                BOT_TOKEN
            );



            startupLog(
                'Registering slash commands...'
            );


            await this.registerCommands();



            startupLog(

                `ONLINE ✅ | ${this.commands.size} commands | ${this.buttons.size} buttons | ${this.selectMenus.size} menus`

            );



        } catch(error) {


            logger.error(
                'Failed to start bot:',
                error
            );


            console.error(error);


            process.exit(1);


        }

    }





    startWebServer() {


        const app =
            express();


        const port =
            Number(
                process.env.PORT || 3000
            );


        app.get(
            '/',
            (req,res)=>{

                res.json({

                    message:
                        'CatPom online',

                    version:
                        pkg.version

                });

            }
        );


        app.get(
            '/health',
            (req,res)=>{

                res.json({

                    status:
                        'healthy',

                    uptime:
                        process.uptime()

                });

            }
        );


        this.webServer =
            app.listen(
                port,
                ()=>{

                    startupLog(
                        `Web server running on port ${port}`
                    );

                }
            );

    }





    async loadHandlers(){


        const handlers = [

            'loaders/events',
            'loaders/interactions'

        ];



        for(
            const handler of handlers
        ){


            const module =
                await import(
                    `./handlers/${handler}.js`
                );



            if(
                typeof module.default === 'function'
            ){


                await module.default(this);


                startupLog(
                    `Loaded ${handler}`
                );

            }

        }

    }





    async registerCommands(){


        try{


            await registerSlashCommands(

                this,

                {

                    clientId:
                        CLIENT_ID

                }

            );


        }catch(error){


            logger.error(

                'Command registration failed:',

                error

            );


        }


    }





    async shutdown(
        reason='UNKNOWN'
    ){


        shutdownLog(

            `CatPom shutting down: ${reason}`

        );


        try{


            if(this.webServer){

                this.webServer.close();

            }


            if(this.db?.db?.pool){

                await this.db.db.pool.end();

            }


            this.destroy();


            process.exit(0);



        }catch(error){


            logger.error(

                'Shutdown error:',

                error

            );


            process.exit(1);


        }

    }


}




const bot =
    new CatPom();



process.on(
    'SIGTERM',
    ()=>bot.shutdown('SIGTERM')
);


process.on(
    'SIGINT',
    ()=>bot.shutdown('SIGINT')
);



process.on(
    'uncaughtException',
    error=>{


        console.error(
            '💥 UNCAUGHT EXCEPTION'
        );


        console.error(error);



        handleTaskError(

            'uncaught_exception',

            error,

            {
                fatal:true
            }

        );


    }
);



process.on(
    'unhandledRejection',
    reason=>{


        console.error(
            '💥 UNHANDLED REJECTION'
        );


        console.error(reason);



        handleTaskError(

            'unhandled_rejection',

            reason instanceof Error
                ? reason
                : new Error(
                    String(reason)
                ),

            {

                errorCode:
                    ErrorCodes.UNHANDLED_REJECTION

            }

        );


    }
);



bot.start();



export default CatPom;
