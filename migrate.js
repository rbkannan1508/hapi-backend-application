const Sequelize = require('sequelize');
const Umzug = require('umzug');
const JSONStorage = require('umzug/lib/storages/json');
const argv = require('process');
const sequelize = new Sequelize({
  dialect: 'postgres',
  storage: 'postgres',
  user: "bharathikannan",
  host: "localhost",
  database: "postgres",
  password: "",
  port: 5432
});

const umzug = new Umzug({
  migrations: { path: './migrations/', pattern: /\.js$/ ,params:[sequelize] },
  context: sequelize.getQueryInterface(),
  storage: new JSONStorage,
  // storageOptions: { sequelize: sequelize , },
  logger: console,
});

(async () => {
  let mode = argv.argv;
  console.log(mode[mode.length-1], 'mode');
  mode[mode.length-1] === 'up' ? await umzug.up() : await umzug.down();
})();