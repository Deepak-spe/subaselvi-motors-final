const { spawn } = require("child_process");

function startTunnel() {
  console.log("Starting localtunnel...");
  const lt = spawn("npx", ["localtunnel", "--port", "3000", "--subdomain", "subaselvi-motors-bill"], {
    shell: true,
    stdio: "inherit"
  });

  lt.on("close", (code) => {
    console.log(`localtunnel process exited with code ${code}. Restarting in 2 seconds...`);
    setTimeout(startTunnel, 2000);
  });
}

startTunnel();
