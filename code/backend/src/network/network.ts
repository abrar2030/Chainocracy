import { randomUUID } from "node:crypto";
import * as readline from "node:readline";
import BlockChain from "../../../blockchain/src/core/blockchain";
import { connectToDB } from "../../../blockchain/src/leveldb";
import baseConfig from "../config";

const axios = require("axios");
const express = require("express");
const app = express();
const http = require("node:http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io_client = require("socket.io-client");
const P2pNetwork = require("./p2p");
const io = new Server(server);

const PARAM = process.argv[2];
const SERVER_PORT =
  PARAM ??
  process.env.SERVER_PORT ??
  process.env.PORT ??
  baseConfig.DEFAULT_PORT_SERVER;
const LOCALHOST = "http://localhost:";
const HOSTNAME_ADDRESS = LOCALHOST + SERVER_PORT;

const peerId = randomUUID().split("-").join("").substring(0, 4);
const NODE_ADDRESS = PARAM ?? peerId;

let allNodes = [NODE_ADDRESS];
const p2p = new P2pNetwork();

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/health", (_req: any, res: any) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// ── Blockchain initialisation ─────────────────────────────────────────────────

let blockchain: BlockChain;

const initBlockchain = async () => {
  try {
    await connectToDB();
    blockchain = new BlockChain();
    await blockchain.setNodeAddress(NODE_ADDRESS.toString());

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    // Pass getAllNodes itself (not allNodes) so the router always resolves
    // the current peer list -- allNodes is reassigned to a new array on
    // every join/leave (see addNode below), and a plain array reference
    // captured here would stay frozen at whatever it was at this instant.
    const redirectRoute = (text: string) =>
      require(text)(blockchain, getAllNodes);
    app.use("/api", redirectRoute("../api/index"));
    console.log("Blockchain initialised for P2P node", NODE_ADDRESS);
  } catch (err: unknown) {
    console.error("Failed to initialise blockchain:", err);
    process.exit(1);
  }
};

// ── Node list helpers ─────────────────────────────────────────────────────────

const getAllNodes = () => [...new Set(allNodes)].sort();
const isCurrentNode = (n: any) => n === NODE_ADDRESS;
const removeDuplicated = (list: any[]) => [...new Set(list)];

const addNode = (node: any) => {
  if (isCurrentNode(node)) return;
  allNodes = removeDuplicated([...allNodes, node]);
};

const isUpdated = (nodeList: any[]) => {
  const a = [...getAllNodes()].sort();
  const b = [...nodeList].sort();
  return JSON.stringify(a) === JSON.stringify(b);
};

const areEqualUpdated = (a: any[], b: any[]) => {
  if (!a || !b) return false;
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
};

// ── Network routes ────────────────────────────────────────────────────────────

app.get("/network", (_req: any, res: any) =>
  res.status(200).json({ network: getAllNodes() }),
);

app.post("/update_nodes", (req: any, res: any) => {
  req.body.urls.forEach((n: any) => addNode(n));
  requestConnection(getAllNodes(), getAllNodes());
  setTimeout(
    () =>
      res.status(200).json({
        node: "New node added successfully!",
        currentUrl: NODE_ADDRESS,
        myUrls: getAllNodes(),
      }),
    50,
  );
});

app.post("/connect_node", (req: any, res: any) => {
  const { urls } = req.body;
  if (!urls) return res.status(401).json({ error: "URLs required" });
  urls.forEach((url: any) => newClient(url));
  setTimeout(
    () =>
      res.status(201).json({
        node: "New node added successfully!",
        currentUrl: NODE_ADDRESS,
        myUrls: getAllNodes(),
      }),
    100,
  );
});

// ── P2P synchronisation ───────────────────────────────────────────────────────

const requestSingleConnection = (url: any, nodes: any) => {
  axios
    .post(`${LOCALHOST + url}/update_nodes`, { urls: nodes })
    .catch((e: any) => console.error(e));
};

const requestConnection = (thisAllNodes: any, destines: any) => {
  thisAllNodes = removeDuplicated([...thisAllNodes, ...getAllNodes()]);
  const fullUpdated: Record<string, any> = {};

  const requests = destines.map((url: any) =>
    axios
      .post(`${LOCALHOST + url}/connect_node`, { urls: thisAllNodes })
      .then((r: any) => {
        fullUpdated[url] = r.data.myUrls;
      })
      .catch((e: any) => console.error(e)),
  );

  Promise.all(requests)
    .then(() => {
      let allGood = true;
      let newNodes: any[] = [];
      thisAllNodes.forEach((el: any) => {
        if (!fullUpdated[el] || fullUpdated[NODE_ADDRESS]) return;
        if (!areEqualUpdated(fullUpdated[el], fullUpdated[NODE_ADDRESS])) {
          newNodes = removeDuplicated([
            ...newNodes,
            ...fullUpdated[NODE_ADDRESS],
            ...fullUpdated[el],
          ]);
          allGood = false;
          const merged = [...fullUpdated[el], ...fullUpdated[NODE_ADDRESS]];
          requestSingleConnection(el, merged);
          requestSingleConnection(NODE_ADDRESS, merged);
        }
      });
      if (!allGood) requestConnection(newNodes, newNodes);
    })
    .catch((e: any) => console.error(e));
};

// ── Socket.IO ─────────────────────────────────────────────────────────────────

const clientConnected = (socket: any) => {
  socket.emit("post-nodes", getAllNodes(), NODE_ADDRESS, false);
  requestConnection(getAllNodes(), getAllNodes());

  socket.on("post-nodes", (nodes: any, node: any, firstTime: any) => {
    addNode(node);
    nodes.forEach((n: any) => addNode(n));
    requestConnection(getAllNodes(), getAllNodes());

    if (!firstTime || !isUpdated(nodes)) {
      socket.emit("post-nodes", getAllNodes(), NODE_ADDRESS, true);
    }

    requestConnection(getAllNodes(), getAllNodes());
  });
};

io.on("connection", (socket: any) => clientConnected(socket));

const clients: Record<string, any> = {};

const newClient = (url: any) => {
  if (!clients[url]) clients[url] = io_client.connect(url);
  clients[url].on("connect", () => {
    console.log("P2P client connected to", url);
    clientConnected(clients[url]);
  });
};

// ── Interactive CLI ───────────────────────────────────────────────────────────

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  // Only run the interactive CLI menu when attached to a terminal. In
  // non-interactive environments (containers, CI) stdin is not a TTY and
  // readline would throw ERR_USE_AFTER_CLOSE, so the server runs headless.
  if (!process.stdin.isTTY) return;
  console.log('Press "M" or "m" to open the menu.');
  rl.question("", (answer) => {
    if (answer.toLowerCase() === "m") printHeader();
    else serverDisplay();
  });
};

const serverDisplay = () => {
  console.clear();
  console.log(
    `SOCKET: listening on *:${SERVER_PORT} | NODE ADDRESS: ${NODE_ADDRESS}`,
  );
  p2p.setMyPeerData({ peerId: NODE_ADDRESS, url: HOSTNAME_ADDRESS });
  if (blockchain) {
    blockchain
      .setNodeAddress(NODE_ADDRESS.toString())
      .catch((e: any) => console.error("Failed to set node address:", e));
  }
  askQuestion();
};

const printHeader = () => {
  console.clear();
  console.log(
    [
      "=======================================================================",
      `QuantumBallot P2P Data Center | ${new Date().toUTCString()}`,
      "=======================================================================",
      ":: WELCOME TO THE ELECTION DATA CENTER ::",
      "OPTIONS:",
      "\t:: A - Add new node(s) ::",
      "\t:: L - List nodes ::",
      "\t:: R - Remove nodes ::",
      "\t:: C - Close Data Center ::",
    ].join("\n"),
  );
  askOption();
};

const addNewNode = () => {
  rl.question("<node1, node2, ...> Enter the node(s) to add: ", (input) => {
    const nodes = input
      .trim()
      .split(",")
      .map((x) => x.trim());
    axios
      .post(`${LOCALHOST + SERVER_PORT}/connect_node`, {
        urls: nodes.map((u) => LOCALHOST + u),
      })
      .then((r: any) => {
        if (r.status === 201) console.log("Nodes added.");
      })
      .catch((_: any) => console.error("Failed to add nodes."));
    setTimeout(listNodes, 500);
  });
};

const listNodes = () => {
  console.log("Nodes connected:", getAllNodes());
  setTimeout(printHeader, 5000);
};

const removeNode = () => {
  rl.question("<node1, node2, ...> Enter the node(s) to remove: ", (input) => {
    const nodes = input
      .trim()
      .split(",")
      .map((x) => x.trim());
    allNodes = allNodes.filter((x) => !nodes.includes(x) || x === NODE_ADDRESS);
    nodes.forEach((url) => {
      if (clients[url]) {
        clients[url].disconnect();
        clients[url] = null;
      }
    });
    setTimeout(listNodes, 500);
  });
};

const askOption = () => {
  rl.question("Enter the option: ", (input) => {
    switch (input.trim().toUpperCase().charAt(0)) {
      case "L":
        listNodes();
        break;
      case "C":
        dismiss();
        break;
      case "R":
        removeNode();
        break;
      case "A":
        addNewNode();
        break;
      default:
        console.log("!!! ALERT !!! ==> Invalid operation <==");
        setTimeout(printHeader, 1000);
    }
  });
};

const dismiss = () => {
  console.log("Network shut down. Any further requests will be denied ...");
  console.log(`Thank you for using QuantumBallot :) ${new Date()}`);
  setTimeout(serverDisplay, 2000);
};

// ── Startup ───────────────────────────────────────────────────────────────────

initBlockchain().then(() => {
  server.listen(SERVER_PORT, () => serverDisplay());
});
