const { spawn } = require("child_process");
const path = require("path");
const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, () => {
            const port = server.address().port;
            server.close(() => {
                resolve(true);
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false);
            } else {
                reject(err);
            }
        });
    });
}

// Get the absolute path to server.js
const serverPath = path.join(__dirname, "express.js");


async function startApplication() {
    try {
        // Check if port 3000 is available
        const portAvailable = await isPortAvailable(3000);
        
        if (!portAvailable) {
            console.error('Port 3000 is already in use. Please close other instances.');
            return;
        }

        // Spawn the Express server
        const server = spawn("node", [serverPath], { 
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Log server output
        server.stdout.on("data", (data) => {
            console.log(`[Server] ${data.toString().trim()}`);
        });

        server.stderr.on("data", (data) => {
            console.error(`[Server Error] ${data.toString().trim()}`);
        });

        server.on('error', (err) => {
            console.error('Failed to start server:', err);
        });

        // Wait and launch NW.js window
        setTimeout(() => {
            nw.Window.open('http://localhost:3000', {
                width: 1200,
                height: 800,
                title: 'Biozagora App'
            }, (win) => {
                console.log('NW.js window launched');

                win.on('close', () => {
                    console.log('Closing application');
                    server.kill('SIGTERM');
                    win.close(true);
                });
            });
        }, 2000); // Give server time to start

    } catch (error) {
        console.error('Startup error:', error);
    }
}

// Start the application
startApplication();