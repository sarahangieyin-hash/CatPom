import { logger } from "../utils/logger.js";


export const botConfig = {

  presence: {
    status: "online",

    activities: [
      {
        name: "Custom Status",
        state: "stalking",
        type: 4,
      },
    ],
  },


  commands: {

    owners:
      process.env.OWNER_IDS
        ?.split(",")
        .map(id => id.trim())
        .filter(Boolean) || [],


    defaultCooldown: 3,

    deleteCommands: false,


    testGuildId:
      process.env.TEST_GUILD_ID || null,


    maintenanceMode:
      process.env.MAINTENANCE_MODE === "true",


    prefix:
      process.env.PREFIX || "visca",
  },


  applications: {

    defaultQuestions: [
      {
        question: "What is your name?",
        required: true
      },
      {
        question: "How old are you?",
        required: true
      },
      {
        question: "Why do you want to join?",
        required: true
      }
    ],


    statusColors: {

      pending: "#F1C40F",

      approved: "#57F287",

      denied: "#ED4245",

    },


    applicationCooldown: 24,

    deleteDeniedAfter: 7,

    deleteApprovedAfter: 30,


    managerRoles: [],
  },


  embeds: {

    colors: {

      primary:"#F4D35E",

      secondary:"#2B2D31",

      success:"#57F287",

      error:"#ED4245",

      warning:"#FEE75C",

      info:"#F7DC6F",

      light:"#FFFFFF",

      dark:"#202225",

      gray:"#99AAB5",

      blurple:"#5865F2",

      green:"#57F287",

      yellow:"#F4D35E",

      red:"#ED4245",

      black:"#000000",


      giveaway:{
        active:"#F4D35E",
        ended:"#ED4245"
      },


      ticket:{
        open:"#57F287",
        claimed:"#FAA61A",
        closed:"#ED4245",
        pending:"#99AAB5"
      },


      economy:"#F7DC6F",

      birthday:"#E91E63",

      moderation:"#9B59B6",


      priority:{
        none:"#95A5A6",
        low:"#3498db",
        medium:"#2ecc71",
        high:"#f1c40f",
        urgent:"#e74c3c"
      }

    },


    footer:{
      text:"Visca Bot",
      icon:null
    },


    thumbnail:null,


    author:{
      name:null,
      icon:null,
      url:null
    }

  },


  economy: {

    currency: {

      name:"puntos",

      namePlural:"puntos",

      symbol:"⭐ Pt"

    },


    startingBalance:0,


    baseBankCapacity:100000,


    dailyAmount:100,


    workMin:10,

    workMax:100,


    begMin:5,

    begMax:50,


    cooldowns:{

      daily:86400000,

      work:3600000,

      crime:7200000,

      rob:14400000

    },


    robSuccessRate:0.4,


    robFailJailTime:3600000

  },
    shop: {

  },


  tickets: {

    defaultCategory: null,

    supportRoles: [],


    priorities: {

      none: {
        emoji: "⚪",
        color: "#95A5A6",
        label: "None",
      },


      low: {
        emoji: "🟢",
        color: "#2ECC71",
        label: "Low",
      },


      medium: {
        emoji: "🟡",
        color: "#F4D35E",
        label: "Medium",
      },


      high: {
        emoji: "🔴",
        color: "#E74C3C",
        label: "High",
      },


      urgent: {
        emoji: "🚨",
        color: "#E91E63",
        label: "Urgent",
      },

    },


    defaultPriority: "none",

    archiveCategory: null,

    logChannel: null,

  },


  giveaways: {

    defaultDuration: 86400000,

    minimumWinners: 1,

    maximumWinners: 10,


    minimumDuration: 300000,

    maximumDuration: 2592000000,


    allowedRoles: [],

    bypassRoles: [],

  },


  birthday: {

    defaultRole: null,

    announcementChannel: null,

    timezone: "UTC",

  },


  verification: {

    defaultMessage:
      "Click the button below to verify yourself and gain access to the server!",


    defaultButtonText:
      "Verify",


    autoVerify: {

      defaultCriteria:
        "none",


      defaultAccountAgeDays:
        7,


      serverSizeThreshold:
        1000,


      minAccountAge:
        1,


      maxAccountAge:
        365,


      sendDMNotification:
        true,


      criteria: {

        account_age:
          "Account must be older than specified days",


        server_size:
          "All users if server has less than 1000 members",


        none:
          "All users immediately",

      },

    },


    verificationCooldown:
      5000,


    maxVerificationAttempts:
      3,


    attemptWindow:
      60000,


    maxCooldownEntries:
      10000,


    maxAttemptEntries:
      10000,


    cooldownCleanupInterval:
      300000,


    maxAuditMetadataBytes:
      4096,


    maxInMemoryAuditEntries:
      1000,


    logAllVerifications:
      true,


    keepAuditTrail:
      true,

  },


  welcome: {

    defaultWelcomeMessage:
      "Welcome {user} to {server}! We now have {memberCount} members!",


    defaultGoodbyeMessage:
      "{user} has left the server. We now have {memberCount} members.",


    defaultWelcomeChannel:
      null,


    defaultGoodbyeChannel:
      null,

  },
    counters: {

    defaults: {

      name: "{name} Counter",

      description: "Server {name} counter",

      type: "voice",

      channelName: "{name}-{count}",

    },


    permissions: {

      deny: [
        "VIEW_CHANNEL"
      ],


      allow: [
        "VIEW_CHANNEL",
        "CONNECT",
        "SPEAK",
      ],

    },


    messages: {

      created:
        "✅ Created counter **{name}**",

      deleted:
        "🗑️ Deleted counter **{name}**",

      updated:
        "🔄 Updated counter **{name}**",

    },


    types: {

      members: {

        name: "👥 Members",

        description:
          "Total members in the server",

        getCount: (guild) =>
          guild.memberCount.toString(),

      },


      bots: {

        name: "🤖 Bots",

        description:
          "Total bot accounts in the server",

        getCount: (guild) =>
          guild.members.cache
            .filter(m => m.user.bot)
            .size
            .toString(),

      },


      members_only: {

        name: "👤 Humans",

        description:
          "Total human members",

        getCount: (guild) =>
          guild.members.cache
            .filter(m => !m.user.bot)
            .size
            .toString(),

      },

    },

  },


  messages: {

    noPermission:
      "You do not have permission to use this command.",


    cooldownActive:
      "Please wait {time} before using this command again.",


    errorOccurred:
      "An error occurred while executing this command.",


    missingPermissions:
      "I am missing required permissions to perform this action.",


    commandDisabled:
      "This command has been disabled.",


    maintenanceMode:
      "The bot is currently in maintenance mode.",

  },


  features: {

    economy: true,

    leveling: true,

    moderation: true,

    logging: true,

    welcome: true,

    tickets: true,

    giveaways: true,

    birthday: true,

    counter: true,

    verification: true,

    reactionRoles: true,

    joinToCreate: true,

    voice: true,

    search: true,

    tools: true,

    utility: true,

    community: true,

    fun: true,

    music: true,

  },


};



export function validateConfig(config) {

  const errors = [];


  const token =
    process.env.DISCORD_TOKEN ||
    process.env.TOKEN;


  const clientId =
    process.env.CLIENT_ID;


  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_DATABASE_URL ||
    process.env["Postgres.DATABASE_URL"];



  if (!token) {

    errors.push(
      "Missing Discord token"
    );

  }



  if (!clientId) {

    errors.push(
      "Missing CLIENT_ID"
    );

  }



  if (
    process.env.NODE_ENV === "production" &&
    !databaseUrl
  ) {

    logger.warn(
      "PostgreSQL DATABASE_URL missing. Using degraded mode."
    );

  }



  logger.info(
    "Environment:",
    {
      token:
        Boolean(token),

      client:
        Boolean(clientId),

      database:
        Boolean(databaseUrl),

      node:
        process.env.NODE_ENV
    }
  );


  return errors;

}



const configErrors =
  validateConfig(botConfig);



if (configErrors.length > 0) {

  logger.error(
    "Bot configuration errors:",
    JSON.stringify(
      configErrors,
      null,
      2
    )
  );


  // NO CRASH LOOP
  // Se deja iniciar para ver errores reales

}



export const BotConfig =
  botConfig;



const COMMAND_CATEGORY_FEATURE_MAP = {

  birthday: "birthday",

  community: "community",

  economy: "economy",

  fun: "fun",

  giveaway: "giveaways",

  jointocreate: "joinToCreate",

  leveling: "leveling",

  logging: "logging",

  moderation: "moderation",

  music: "music",

  reaction_roles: "reactionRoles",

  search: "search",

  serverstats: "counter",

  ticket: "tickets",

  tools: "tools",

  utility: "utility",

  verification: "verification",

  welcome: "welcome",

};



function normalizeCategoryKey(category) {

  return String(category || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

}



export function getCommandPrefix() {

  return botConfig.commands?.prefix ?? "visca";

}



export function getBotOwners() {

  return (
    botConfig.commands?.owners ?? []
  )
    .map(id => String(id).trim())
    .filter(Boolean);

}



export function isBotOwner(userId) {

  return getBotOwners()
    .includes(
      String(userId)
    );

}



export function isMaintenanceMode() {

  return botConfig.commands?.maintenanceMode === true;

}



export function getBotMessage(
  key,
  replacements = {}
) {

  let message =
    botConfig.messages?.[key] || key;


  for (
    const [placeholder,value]
    of Object.entries(replacements)
  ) {

    message =
      message.replace(
        new RegExp(
          `\\{${placeholder}\\}`,
          "g"
        ),
        String(value)
      );

  }


  return message;

}



export function isFeatureEnabled(featureKey) {

  return (
    botConfig.features?.[featureKey]
    !== false
  );

}



export function isCommandCategoryEnabled(category) {

  const normalized =
    normalizeCategoryKey(category);


  const feature =
    COMMAND_CATEGORY_FEATURE_MAP[normalized];


  if (!feature)
    return true;


  return isFeatureEnabled(feature);

}



export function getColor(
  path,
  fallback = "#99AAB5"
) {


  if (
    typeof path === "number"
  )
    return path;



  if (
    typeof path === "string" &&
    path.startsWith("#")
  ) {

    return parseInt(
      path.replace("#",""),
      16
    );

  }



  const result =
    path
      .split(".")
      .reduce(
        (obj,key)=>
          obj &&
          obj[key] !== undefined
            ? obj[key]
            : fallback,

        botConfig.embeds.colors
      );



  if (
    typeof result === "string" &&
    result.startsWith("#")
  ) {

    return parseInt(
      result.replace("#",""),
      16
    );

  }


  return result;

}



export function getRandomColor() {

  const colors =
    Object.values(
      botConfig.embeds.colors
    )
    .flatMap(color =>
      typeof color === "string"
        ? color
        : Object.values(color)
    );


  return colors[
    Math.floor(
      Math.random() * colors.length
    )
  ];

}



export function getDefaultApplicationQuestions() {

  return [
    {
      question:"What is your name?",
      required:true
    },
    {
      question:"How old are you?",
      required:true
    },
    {
      question:"Why do you want to join?",
      required:true
    }
  ];

}



export default botConfig;
