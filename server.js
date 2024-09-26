import net from "net";
import colors from "colors";

let clients = [];
let colors_arr = [
  "bgRed",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  //   "bgCyan",
  "bgGray",
  "bgGrey",
];

function getRandomColor() {
  const ind = Math.floor(Math.random() * colors_arr.length);
  return colors_arr[ind];
}

const server = net.createServer((socket) => {
  console.log("New client connected".cyan);

  socket.write("Welcome to the chat room!\nEnter your username: ".cyan);

  let username = "";
  let color = "";

  socket.on("data", (data) => {
    const message = data.toString().trim();
    if (message == "" && username) {
      return;
    }
    if (!username) {
      message == "" ? (username = "anon") : (username = message);
      color = getRandomColor();

      socket.write(
        `Hi, `.cyan +
          colors[color](`${username}`) +
          `! You can start chatting now. Type `.cyan +
          `exit`.red +
          ` to leave.\n`.cyan
      );

      clients.push({ socket, username, color });

      broadcast(colors[color](`${username}`) + ` hopped on!`, socket);
    } else {
      if (message.toLowerCase() === "exit") {
        socket.end("kthxbye!\n".cyan);
        return;
      }

      broadcast(colors[color](`${username}`) + `: ${message}`, socket);
    }
  });

  socket.on("end", () => {
    console.log(colors[color](`${username}`) + ` disconnected`);

    clients = clients.filter((client) => client.socket !== socket);

    broadcast(colors[color](`${username}`) + ` dipped.`, socket);
  });

  socket.on("error", (err) => {
    console.log("Error:", err.message);
  });
});

function broadcast(message, senderSocket) {
  clients.forEach((client) => {
    if (client.socket !== senderSocket) {
      client.socket.write(`${message}\n`);
    }
  });
}

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
