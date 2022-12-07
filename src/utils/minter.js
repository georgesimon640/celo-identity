import {Web3Storage} from 'web3.storage/dist/bundle.esm.min.js'
import axios from "axios";
import { ethers } from "ethers";

// initialize IPFS
const getAccessToken = () => { return process.env.REACT_APP_STORAGE_API_KEY }
const makeStorageClient = () => { return new Web3Storage({ token: getAccessToken() })}

const upload = (file) => {
  const client = makeStorageClient();
  const file_cid = client.put(file);

  return file_cid;
}

const makeFileObjects = (file, file_name) => {
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" })
  const files = [new File([blob], `${file_name}.json`)]

  return files
}



// mint an NFT
export const createNft = async (
  minterContract,
  performActions,
  { name, about, ipfsImage }
) => {
  await performActions(async (kit) => {
    if (!name || !about || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      about,
      image: ipfsImage,
      owner: defaultAccount,
    });

    try {
      // save NFT metadata to IPFS
      const files = makeFileObjects(data, name);
      const file_cid = await upload(files);

      const url = `https://${file_cid}.ipfs.w3s.link/${name}.json`;


      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .mint(url)
        .send({ from: defaultAccount });
        console.log(url);

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};




export const uploadImage = async (e) => {
  const image = e.target.files;
  const image_name = image[0].name;

  if (!image) return;
  // Pack files into a CAR and send to web3.storage
  const cid = await upload(image) // Promise<CIDString>
  const image_url = `https://${cid}.ipfs.w3s.link/${image_name}`

  return image_url;
};

// fetch all NFTs on the smart contract
export const getNfts = async (minterContract) => {
  try {
    const nfts = [];
    const nftsLength = await minterContract.methods.totalSupply().call();
    // contract starts minting from index 1
    for (let i = 1; i <= Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const Inft = await minterContract.methods.getIdentities(i).call();
        const res = await minterContract.methods.tokenURI(Inft[0]).call();
        const meta = await fetchNftMeta(res);
        //const owner = await fetchNftOwner(minterContract, i); 
        resolve({
          index: i,
          reputation: Inft[2],
          name: meta.name,
          image: meta.image,
          about: meta.about,
          owner: meta.owner,
        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    const data = JSON.parse(meta.data)
    return data;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};


export const increaseReputation = async (
  minterContract,
  performActions,
  index,
) => {
  try {
    await performActions(async (kit) => {
      try {
        const price = ethers.utils.parseUnits(String(0.02), "ether");
        const { defaultAccount } = kit;
        await minterContract.methods.increaseRep(index).send({ from: defaultAccount, value: price});
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

