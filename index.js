const fs = require('fs');
const path = require('path');

const rootFolder = '/Users/usa/development/repos/Layer/alizz-app/flutter/lib';
const searchPattern = /(?<=\s)as(?=\s)/;


function findFilesWithAs(dir, filesToFind) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(err);
          return;
        }

        if (stats.isDirectory()) {
          findFilesWithAs(filePath, filesToFind);
        } else if (stats.isFile()) {
          if (filesToFind.includes(file)) {
            fs.readFile(filePath, 'utf8', (err, content) => {
              if (err) {
                console.error(err);
                return;
              }
              saveFilesBySize(filePath, stats.size);
              const lines = content.split('\n');
              lines.forEach((line, index) => {
                const match = line.match(searchPattern);
                if (match) {
                  console.log(`Found in: ${filePath}`);
                  console.log(`Line number: ${index + 1}`);
                  console.log(`Matched line: ${line}`);
                  console.log(`Matched: ${match[0]}`);
                  
                }
              });
            });
          }
        }
      });
    });
  });
}

const foundFiles = {
    larger_than_1kb: new Set(),
    smaller_or_equal_to_1kb: new Set(),
  };
  
  function saveFilesBySize(filePath, size) {
    const setSize = size > 1200 ? 'larger_than_1kb' : 'smaller_or_equal_to_1kb';
    foundFiles[setSize].add(`import  '${filePath}'`);
  }
  
  function writeFilesBySize() {
    Object.keys(foundFiles).forEach(setName => {
      const outputPath = path.join(__dirname, `${setName}.js`);
      const sortedFiles = Array.from(foundFiles[setName]).sort();
      const fileContent = sortedFiles.join('\n');
      fs.writeFileSync(outputPath, fileContent);
    });
  }

function readFilesFromTxt(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return fileContent.split('\n').filter((line) => line.trim() !== '');
}

const filesTxtPath = path.join(__dirname, 'files.txt');
const filesToFind = readFilesFromTxt(filesTxtPath);
findFilesWithAs(rootFolder, filesToFind);
process.on('exit', writeFilesBySize);
