import { useContractKit } from '@celo-tools/use-contractkit';
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import AddNfts from "./Add";
import Nft from "./Card";
import Loader from "../../ui/Loader";
import { NotificationSuccess, NotificationError } from "../../ui/Notifications";
import {
  getNfts,
  createNft,
  increaseReputation,

} from "../../../utils/minter";
import { Row } from "react-bootstrap";

const NftList = ({ minterContract, name, updateBalance }) => {
  /* performActions : used to run smart contract interactions in order
   *  address : fetch the address of the connected wallet
   */
  const { performActions, address } = useContractKit();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);


  const getAssets = useCallback(async () => {
    try {
      setLoading(true);

      // fetch all nfts from the smart contract
      const allNfts = await getNfts(minterContract);
      if (!allNfts) return;
      await updateBalance();
      setNfts(allNfts);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [minterContract, updateBalance]);

  const addNft = async (data) => {
    try {
      setLoading(true);

      // create an nft functionality
      await createNft(minterContract, performActions, data);
      toast(<NotificationSuccess text="Updating NFT list...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create an NFT." />);
    } finally {
      setLoading(false);
    }
  };


 

  const increaseRep = useCallback(async (index) => {
    try {
      setLoading(true);

      await increaseReputation(minterContract, performActions, index);

      toast(<NotificationSuccess text="Increasing reputation...." />);
      getAssets();
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to increase reputation" />);
    } finally {
      setLoading(false);
    }
  }, [getAssets, minterContract,performActions]);

  

  useEffect(() => {
    try {
      if (minterContract && address) {
        getAssets();
      }
    } catch (error) {
      console.log({ error });
    }
  }, [minterContract, address, getAssets, increaseRep]);
  if (address) {
    return (
      <>
        {!loading ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="fs-4 fw-bold mb-0">{name}</h1>

              <AddNfts save={addNft} address={address} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3  mb-5 g-xl-4 g-xxl-5">
              {/* display all NFTs */}
              {nfts.map((_nft) => (
                <Nft
                  key={_nft.index}
                 
                  nft={{
                    ..._nft,
                  }}
                  isOwner={_nft.owner === address}
                  increaseRep={() => increaseRep(_nft.index)}
                />
              ))}
            </Row>
          </>
        ) : (
          <Loader />
        )}
      </>
    );
  }
  return null;
};

NftList.propTypes = {
  // props passed into this component
  minterContract: PropTypes.instanceOf(Object),
  updateBalance: PropTypes.func.isRequired,
};

NftList.defaultProps = {
  minterContract: null,

};

export default NftList;
