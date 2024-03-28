import { getMerkleRoot } from '/utils/merkle.js'

const allowlist = require('/data/UBAllowlistMint.json');

const handler = async (req, res) => {

  if (req.method !== 'GET') {
    res.status(400).json({});
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=15552000');
  res.status(200).json( {
    root: getMerkleRoot(allowlist)
  });

}

export default handler