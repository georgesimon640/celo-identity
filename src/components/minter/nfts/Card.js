import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";
import { Button } from "react-bootstrap";


  const NftCard = ({ nft, isOwner, increaseRep }) => {
  const { name, about, image, owner, reputation,  index } = nft;

  

  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {reputation} Reputaion Points
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image}  style={{ objectFit: "cover" }} alt={about} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{about}</Card.Text>

          
      {isOwner !== true && (
            <>
              <Button variant="primary mt-2" onClick={() => increaseRep(index)}>
               Give Reputaion for 0.2 celo
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Col>

  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,

};

export default NftCard;
