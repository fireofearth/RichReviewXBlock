/**
 * Cron jobs to schedule periodically
 *
 * Created by Colin
 */

// Importing node modules
const child_process = require('child_process');

/**
 * Importing npm modules
 * https://github.com/kelektiv/node-cron
 */
const CronJob = require('cron').CronJob;

const helpers = require('./helpers');
const moment  = require('moment');

let backup_azure_str_lock = 0;
function backup_azure_str_launch() {
  helpers.log(`pinging job backup_azure_str, received ${backup_azure_str_lock}`);
  if(backup_azure_str_lock) {
    return;
  } else {
    backup_azure_str_lock = 1;
    helpers.log("starting job backup_azure_str");
  }

  const nd = child_process.spawn(
    'node',
    [__dirname + '/jobs/backup_azure_storage.js'],
    {
	cwd: __dirname
    }
  );

  nd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  nd.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  nd.on('close', (code) => {
    console.log(`child process closed with code ${code}`);
    backup_azure_str_lock = 0;
  });

  nd.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  nd.on('error', (err) => {
    console.error(`child process has error ${err}`);
  });
}

let backup_redis_cache_lock = 0;
function backup_redis_cache_launch() {
  helpers.log(`pinging job backup_redis_cache, received ${backup_redis_cache_lock}`);
  if(backup_redis_cache_lock) {
    return;
  } else {
    backup_redis_cache_lock = 1;
    helpers.log("starting job backup_redis_cache");
  }

  const nd = child_process.spawn(
    'node',
    [__dirname + '/jobs/backup_redis_cache.js'],
    {
	cwd: __dirname
    }
  );

  nd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  nd.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  nd.on('close', (code) => {
    console.log(`child process closed with code ${code}`);
    backup_redis_cache_lock = 0;
  });

  nd.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  nd.on('error', (err) => {
    console.error(`child process has error ${err}`);
  });
}

let backup_log_files_lock = 0;
function backup_log_files_launch() {
  helpers.log(`pinging job backup_logs, received ${backup_log_files_lock}`);
  if(backup_log_files_lock) {
    return;
  } else {
    backup_log_files_lock = 1;
    helpers.log("starting job backup_logs");
  }

  const nd = child_process.spawn(
    'node',
    [__dirname + '/jobs/backup_logs.js'],
    {
	cwd: __dirname
    }
  );

  nd.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  nd.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  nd.on('close', (code) => {
    console.log(`child process closed with code ${code}`);
    backup_redis_cache_lock = 0;
  });

  nd.on('exit', (code) => {
    console.log(`child process exited with code ${code}`);
  });

  nd.on('error', (err) => {
    console.error(`child process has error ${err}`);
  });
}

/**
 * TIME SEQUENCE
 * seconds minutes hours day/mth months day/wk
 * ' *       *       *      *      *      *'
 */
helpers.log("starting jobs...");

/**
 * Note it's possible to implement locks to ensure when a job is happening, another instance does not run.
 */
let test_lock = 0;
const test_job_lock = new CronJob(
  "*/1 * * * * *",
  function() {
    if(test_lock) {
      helpers.log("test is already running");
      return;
    }
    test_lock = 1;
    helpers.log("running test");
    setTimeout(() => {
      test_lock = 0;
      helpers.log("test complete");
    }, 4000)

  },
  null,
  false
);

const log_date_job = new CronJob(
  "0 30 1 * * *",
  function() {
    const time = moment().format('MMMM Do YYYY, h:mm:ss a');
    helpers.log(`It is now ${time}`);
  },
  null,
  false
);

const backup_azure_str_job = new CronJob(
   /* seconds minutes hours day/mth months day/wk */
   /* ' *       *       *      *      *      *'   */
   /* 2 AM everyday */
  "0 0 2 * * *",
  backup_azure_str_launch,
  null,
  false
);

const backup_redis_cache_job = new CronJob(
  /* seconds minutes hours day/mth months day/wk */
  /* ' *       *       *      *      *      *'   */
  /* 1 AM everyday */
  "0 0 1 * * *",
  backup_redis_cache_launch,
  null,
  false
);

const backup_logs_job = new CronJob(
  /* seconds minutes hours day/mth months day/wk */
  /* ' *       *       *      *      *      *'   */
  /* 1:30 AM on Everyday                         */
  "0 30 1 * * *",
  backup_log_files_launch,
  null,
  false
);

log_date_job.start();
backup_azure_str_job.start();
backup_redis_cache_job.start();
backup_logs_job.start();
