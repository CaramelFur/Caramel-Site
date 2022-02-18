import SftpUpload from 'sftp-upload';
import { readFile } from 'fs/promises';
const config = JSON.parse(await readFile('deploy.config.json', 'utf8'));

const options = {
  host: config.host,
  username: config.username,
  password: config.password,
  path: './dist/',
  basePath: './dist',
  remoteDir: config.path,
};

const sftp = new SftpUpload(options);

sftp
  .on('error', function (err) {
    throw err;
  })
  .on('uploading', function (progress) {
    console.log('Uploading', progress.file);
    console.log(progress.percent + '% completed');
  })
  .on('completed', function () {
    console.log('Upload Completed');
  })
  .upload();
