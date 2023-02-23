const { exec } = require("child_process");

const startMongo = () => {

    exec("mongod", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    console.log('Mongod (=) Started.')
}

module.exports = startMongo