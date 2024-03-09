const inquirer = require("inquirer");

const inquirerPrompt = () => {
    return new Promise((resolve, reject) => {
      inquirer
        .prompt([
          {
            type: "input",
            name: "note",
            message: "注释说明",
            default: "test注释",
          }
        ])
        .then((answers) => {
          resolve({
            ...answers,
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
module.exports = inquirerPrompt;