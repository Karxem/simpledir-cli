import { dir } from "console";
import { DirectoryManager } from "./directory-manager";
import fse from "fs-extra";
import path from "path";

describe("DirectoryManager", () => {
  describe("createDirectory", () => {
    it("should create a directory", async () => {
      const directoryPath = path.join(__dirname, "test-directory");
      await DirectoryManager.createDirectory(directoryPath);

      const isDirectory = await fse
        .stat(directoryPath)
        .then((stats) => stats.isDirectory());
      expect(isDirectory).toBe(true);

      await fse.rmdir(directoryPath);
    });

    it("should handle errors when creating a directory", async () => {
      // Mock fs.mkdir to throw an error
      const mockMkdir = jest.spyOn(fse, "mkdir");

      // Expect DirectoryManager.createDirectory to throw an error
      await expect(
        DirectoryManager.createDirectory("/invalid/path")
      ).rejects.toThrow(
        "ENOENT: no such file or directory, mkdir '/invalid/path'"
      );

      mockMkdir.mockRestore(); // Restore fs.mkdir to its original implementation
    });
  });

  describe("listDirectoryContent", () => {
    it("should list directory contents", async () => {
      // Create a test directory with some files
      const directoryPath = path.join(__dirname, "test-directory");
      await fse.mkdir(directoryPath);
      await fse.writeFile(
        path.join(directoryPath, "test-file.txt"),
        "Test file content"
      );

      // Call listDirectoryContent and capture console.table output
      const consoleTableSpy = jest
        .spyOn(console, "table")
        .mockImplementation(() => {});
      await DirectoryManager.listDirectoryContent(directoryPath);

      // Assert that console.table was called with the expected output
      expect(consoleTableSpy).toHaveBeenCalled();

      // Clean up: delete the test directory
      await fse.rmdir(directoryPath, { recursive: true });
    });

    it("should handle errors when listing directory contents", async () => {
      // Mock fs.readdir to throw an error
      const mockReaddir = jest.spyOn(fse, "readdir");

      // Expect DirectoryManager.listDirectoryContent to throw an error
      await expect(
        DirectoryManager.listDirectoryContent("/invalid/path")
      ).rejects.toThrow(
        "ENOENT: no such file or directory, scandir '/invalid/path'"
      );

      mockReaddir.mockRestore(); // Restore fs.readdir to its original implementation
    });
  });

  describe("moveFileOrDirectory", () => {
    it("moves the designated file or directory", async () => {
      // Create a test directory with a file
      const directoryPath = path.join(__dirname, "test-directory");
      await fse.mkdir(directoryPath);
      await fse.writeFile(
        path.join(__dirname, "test-file.txt"),
        "Test file content"
      );

      await DirectoryManager.moveFileOrDirectory(
        path.join(__dirname, "test-file.txt"),
        directoryPath
      );

      const exists = await fse
        .access(path.join(directoryPath, "test-file.txt"))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);

      // Clean up: delete the test directory
      await fse.rmdir(directoryPath, { recursive: true });
    });

    it("throws a error when the target path is invalid", async () => {
      // Create a test directory with a file
      const directoryPath = path.join(__dirname, "test-directory");
      await fse.mkdir(directoryPath);

      await expect(
        DirectoryManager.moveFileOrDirectory(directoryPath, "invalid/file/path")
      ).rejects.toThrow("");

      // Clean up: delete the test directory
      await fse.rmdir(directoryPath, { recursive: true });
    });
  });

  describe("deleteFileOrDirectoryByName", () => {
    it("should delete a file or directory", async () => {
      // Create a test directory with a file
      const directoryPath = path.join(__dirname, "test-directory");
      await fse.mkdir(directoryPath);
      await fse.writeFile(
        path.join(directoryPath, "test-file.txt"),
        "Test file content"
      );

      // Call deleteByName and assert that the file is deleted
      await DirectoryManager.deleteFileOrDirectoryByName(
        path.join(directoryPath, "test-file.txt"),
        false
      );
      const exists = await fse
        .access(path.join(directoryPath, "test-file.txt"))
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(false);

      // Clean up: delete the test directory
      await fse.rmdir(directoryPath, { recursive: true });
    });

    it("returns a error when recursion is on but a directory is passed", async () => {
      const mockRm = jest.spyOn(fse, "rm");

      // Create a test directory
      const directoryPath = path.join(__dirname, "test-directory");
      await fse.mkdir(directoryPath);

      await expect(
        DirectoryManager.deleteFileOrDirectoryByName(directoryPath, false)
      ).rejects.toThrow("Cannot delete 'test-directory': It's a directory.");

      // Clean up: delete the test directory
      await fse.rmdir(directoryPath, { recursive: true });

      mockRm.mockRestore();
    });

    it("should handle errors when file path is invalid", async () => {
      // Mock fs.rm to throw an error
      const mockRm = jest.spyOn(fse, "rm");

      // Expect DirectoryManager.deleteFileOrDirectoryByName to throw an error
      try {
        await DirectoryManager.deleteFileOrDirectoryByName(
          "/invalid/path",
          false
        );
      } catch (error) {
        // Assert that the error message matches the expected value
        expect(error);
      }

      mockRm.mockRestore(); // Restore fs.rm to its original implementation
    });
  });
});
