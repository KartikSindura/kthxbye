import net from "net";

let clients = [];

const server = net.createServer((socket) => {
  console.log("New client connected");

  socket.write("Welcome to the chat room!\nEnter your username: ");

  let username = "";

  socket.on("data", (data) => {
    const message = data.toString().trim();

    if (message == "" && username) {
      return;
    }
    if (!username) {
      message == "" ? (username = "anon") : (username = message);
      socket.write(`Hi, ${username}! You can start chatting now. Type exit to leave.\n`);

      clients.push({ socket, username });

      broadcast(`${username} hopped on!`, socket);
    } else {
      if (message.toLowerCase() === "exit") {
        socket.end("kthxbye!\n");
        return;
      }

      broadcast(`${username}: ${message}`, socket);
    }
  });

  socket.on("end", () => {
    console.log(`${username} dipped.`);

    clients = clients.filter((client) => client.socket !== socket);

    broadcast(`${username} has left the chat.`, socket);
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
  console.log("TCP chat server running on port 3000");
});
