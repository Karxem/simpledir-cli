const fse = require('fs-extra');
const path = require('path');

export class FileManager {
  static async createFile(filePath: string, extension: string | undefined) {
    try {
      if (extension) {
        // List of recognized extensions
        const recognizedExtensions = [
          'js',
          'txt',
          'json',
          'html',
          'css',
          'md',
          'yml',
          'xml',
          'csv',
        ];

        if (!recognizedExtensions.includes(extension)) {
          throw new Error(`Unknown extension: ${extension}`);
        }

        filePath = `${filePath}.${extension}`; // Adjust filePath to include the extension
      }

      await fse.writeFile(filePath, "");
      if (extension) {
        console.log(
          `File ${path.basename(
            filePath
          )} with extension ${extension} created successfully.`
        );
      } else {
        console.log(`File ${path.basename(filePath)} created successfully.`);
      }
    } catch (error) {
      throw error;
    }
  }
}

