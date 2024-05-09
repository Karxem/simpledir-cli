const fse = require("fs-extra");
const path = require("path");

export class DirectoryManager {
  static async createDirectory(filePath: string) {
    try {
      await fse.mkdir(filePath);
      console.log(`Directory ${path.basename(filePath)} created successfully.`);
    } catch (error) {
      throw error;
    }
  }

  static async moveFileOrDirectory(filePath: string, targetPath: string) {
    try {
      await fse.move(filePath, `${targetPath}/${path.basename(filePath)}`);
      console.log(`Moved ${path.basename(filePath)} to ${targetPath}`);
    } catch (error) {
      throw error;
    }
  }

  static async listDirectoryContent(filePath: string) {
    try {
      const files = await fse.readdir(filePath);
      const detailedFilesPromises = files.map(async (file: string) => {
        const fileDetails = await fse.lstat(path.resolve(filePath, file));
        const { size, birthtime } = fileDetails;

        return { filename: file, "size (kb)": (size / 1024).toFixed(3), created_at: birthtime };
      });
      const detailedFiles = await Promise.all(detailedFilesPromises);
      console.table(detailedFiles);
    } catch (error) {
      throw error;
    }
  }

  static async deleteFileOrDirectoryByName(
    filePath: string,
    recursive: boolean
  ) {
    try {
      // Check if recursive deletion is disabled and the path is a directory
      if (!recursive) {
        const stats = await fse.lstat(filePath);
        if (stats.isDirectory()) {
          throw new Error(`Cannot delete '${path.basename(filePath)}': It's a directory.`);
        }
      }

      await fse.rm(filePath, { recursive: recursive });

      console.log(
        `File or directory ${path.basename(filePath)} deleted successfully.`
      );
    } catch (error) {
      throw error; // Re-throw the error to propagate it to the caller
    }
  }
}
