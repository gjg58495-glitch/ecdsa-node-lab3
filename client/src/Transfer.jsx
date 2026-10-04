import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";

function transactionHash(sender, amount, recipient) {
  // Homework requirement: ALL transaction fields are signed.
  const payload = JSON.stringify({ sender, amount, recipient });
  return keccak256(utf8ToBytes(payload));
}

function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const amount = Number.parseInt(sendAmount, 10);
    const cleanRecipient = recipient.trim();

    if (!privateKey || !address) {
      alert("Enter a valid private key first.");
      return;
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Amount must be a positive integer.");
      return;
    }

    if (!cleanRecipient) {
      alert("Enter recipient address.");
      return;
    }

    try {
      const hash = transactionHash(address, amount, cleanRecipient);
      const signature = secp.secp256k1.sign(hash, privateKey);

      const transaction = {
        sender: address,
        amount,
        recipient: cleanRecipient,
        hexSign: signature.toCompactHex(),
      };

      console.log("Signed transaction:", transaction);

      const {
        data: { balance },
      } = await server.post("send", transaction);

      setBalance(balance);
      setSendAmount("");
      setRecipient("");
    } catch (ex) {
      const message = ex?.response?.data?.message || ex.message || "Transaction failed";
      alert(message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        />
      </label>

      <label>
        Recipient
        <input
          placeholder="Paste recipient public address"
          value={recipient}
          onChange={setValue(setRecipient)}
        />
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
