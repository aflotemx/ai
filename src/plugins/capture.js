import { readFile } from "fs";
const capture = (filePath) => {
  // Read the file content
  const captured = readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    // Define the JSON object
    const jsonObject = {
      name: filePath,
      content: data,
    };

    // Convert JSON object to string
    const jsonString = JSON.stringify(jsonObject, null, 2);

    // // Print the JSON document
    // console.log(jsonObject);

  });
};
export default capture;
