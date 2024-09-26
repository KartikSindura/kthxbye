import net from "net";
import colors from "colors"; // Using the 'safe' version

let clients = [];
const colors_arr = [
  "bgRed",
  "bgYellow",
  "bgBlue",
  "bgMagenta",
  "bgGray",
  "bgGrey",
];

// Helper function to get a random color
function getRandomColor() {
  const index = Math.floor(Math.random() * colors_arr.length);
  return colors_arr[index];
}

const server = net.createServer((socket) => {
  console.log(colors.cyan("New client connected"));

  // Prompt for username on connection
  socket.write(colors.cyan("Welcome to the chat room!\nEnter your username: "));

  let username = "";
  let color = "";

  socket.on("data", (data) => {
    const message = data.toString().trim();

    if (!username) {
      // First input is treated as the username
      username = message === "" ? "anon" : message;
      color = getRandomColor(); // Assign random color

      // Check if the color function exists in 'colors'
      if (typeof colors[color] === "function") {
        socket.write(
          colors.cyan("Hi, ") +
            colors[color](username) + // Apply the random color to the username
            colors.cyan("! You can start chatting now. Type ") +
            colors.red("exit") +
            colors.cyan(" to leave.\n")
        );

        clients.push({ socket, username, color });

        // Broadcast that the user joined
        broadcast(colors[color](username) + " hopped on!", socket);
      } else {
        socket.write("Error: Invalid color assignment.\n".red);
      }
    } else {
      // Handle user messages
      if (message.toLowerCase() === "exit") {
        socket.end(colors.cyan("kthxbye!\n"));
        return;
      }

      // Broadcast the message to all other clients
      broadcast(colors[color](username) + `: ${message}`, socket);
    }
  });

  socket.on("end", () => {
    console.log(`${username} disconnected`);

    // Remove the client from the list
    clients = clients.filter((client) => client.socket !== socket);

    // Broadcast the user's disconnection
    broadcast(colors[color](username) + " dipped.", socket);
  });

  socket.on("error", (err) => {
    console.log("Error:", err.message);
  });
});

// Function to broadcast messages to all clients except the sender
function broadcast(message, senderSocket) {
  clients.forEach((client) => {
    if (client.socket !== senderSocket) {
      client.socket.write(`${message}\n`);
    }
  });
}

// Start the server on port 3000
server.listen(3000, () => {
  console.log("Server running on port 3000");
});