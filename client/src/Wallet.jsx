import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const nextPrivateKey = evt.target.value.trim();
    setPrivateKey(nextPrivateKey);

    if (!nextPrivateKey) {
      setAddress("");
      setBalance(0);
      return;
    }

    try {
      // The public key is derived locally. The private key is never sent to the server.
      const nextAddress = toHex(
        secp.secp256k1.getPublicKey(nextPrivateKey)
      );
      setAddress(nextAddress);

      const {
        data: { balance: nextBalance },
      } = await server.get(`balance/${nextAddress}`);
      setBalance(nextBalance);
    } catch (error) {
      setAddress("");
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type your private key"
          value={privateKey}
          onChange={onChange}
        />
      </label>

      <div className="balance">Balance: {balance}</div>

      {address && (
        <div className="address">
          <strong>Public address:</strong>
          <div style={{ overflowWrap: "anywhere", marginTop: "8px" }}>
            {address}
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;
