import { getMerkleProof } from '/utils/merkle.js'

const allowlist = require('/data/UBAllowlistMint.json');

const handler = async (req, res) => {

  const {address} = req.query;

  if (req.method !== 'GET') {
    res.status(400).json({});
    return;
  }

  if (!address) {
    res.status(400).json({ error: "address is required" });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=15552000');
  res.status(200).json( {
    proof: getMerkleProof(allowlist, address),
    valid: getMerkleProof(allowlist, address).length > 0,
  });

}

export default handler