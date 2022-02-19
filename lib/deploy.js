import { DeployToSftp } from 'easy-sftp-deploy'; 
import * as fs from 'fs';

// First argument
const options = readOptions(process.argv[2]);

await DeployToSftp(options);

function readOptions(configFile) {
  // Check if configFile exists
  if (!fs.existsSync(configFile)) {
    throw new Error(`Config file ${configFile} does not exist`);
  }

  // Read configFile
  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

  const options = {
    credentials: {
      main: {
        username: config.username,
        password: config.password,
      },
    },
    hosts: {
      main: {
        host: config.host,
        credentialsID: 'main',
      },
    },
    sourceFolders: {
      dist: {
        folder: './dist',
      },
    },
    deployments: [
      {
        hostID: 'main',
        srcID: 'dist',
        dstFolder: config.path,
  
        clear: true,
        dryRun: config.dryRun,
      },
    ],
  }

  return options;
}
