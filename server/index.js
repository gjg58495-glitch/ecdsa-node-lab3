const express = require("express");
const cors = require("cors");
const { keccak256 } = require("ethereum-cryptography/keccak.js");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

// Public keys are used as account addresses.
// Matching private keys for this educational project are stored in client/private/keys.txt.
const balances = {
  "020c7931ca22ba21d1908b767210268acbcda7208c8ac59ea972e6639667261579": 100,
  "02df08f3ae6fd07a15eec3480b1eee7470b5ba21ed9e6c60686e49e0e07e4a8d45": 50,
  "03cce9c9391b7499c6738f09e4a66d97db0f3f7b6e99a28eb740fecf4043641d74": 75,
};

function transactionHash(sender, amount, recipient) {
  // Homework requirement: verify a signature over ALL transaction fields.
  const payload = JSON.stringify({ sender, amount, recipient });
  return keccak256(utf8ToBytes(payload));
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  try {
    const { sender, recipient, amount, hexSign } = req.body;

    if (
      typeof sender !== "string" ||
      typeof recipient !== "string" ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      typeof hexSign !== "string"
    ) {
      return res.status(400).send({ message: "Invalid transaction data!" });
    }

    const hash = transactionHash(sender, amount, recipient);
    const isSigned = secp256k1.verify(hexSign, hash, sender);

    console.log("Transaction:", { sender, recipient, amount });
    console.log("Is signed:", isSigned);

    if (!isSigned) {
      return res.status(400).send({ message: "Not signed!" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    }

    balances[sender] -= amount;
    balances[recipient] += amount;

    return res.send({ balance: balances[sender] });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ message: "Invalid signature or transaction!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (balances[address] === undefined) {
    balances[address] = 0;
  }
}
