import React, { useState } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import Ledger from "@daml/ledger";
import { useStreamQueries, useLedger, useParty } from "@daml/react";
import { ContractId } from "@daml/types";
import { Offer, Token, TokenOffer } from "@daml.js/daml-nft-0.0.1/lib/Token"
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";

// How to READ from the ledger +++
export default function Report() {
  const classes = useStyles();
  const party = useParty(); // useParty hook gives you the current party. Depending on whether a party is signatory/observer/controller, the contracts that the party has right to will be returned from the useStreamQueries function
  const ledger : Ledger = useLedger(); // useLedger hook to construct a ledger object; realization of the ledger from the point of view of the party
  const tokens = useStreamQueries(Token).contracts; // could've been called "assets"
  // Token is the template name from the codegen generated code
  // useStreamQueries(Token).contracts will return all the active contracts of type Token that the current party has the right to see
  // chain methods such as "where" to further specify what Token

  const defaultOfferProps : InputDialogProps<Offer> = {
    open: false,
    title: "Offer NFT",
    defaultValue: { 
      newOwner : "",
      price: "" 
    },
    fields: {
      newOwner : {
        label: "New Owner",
        type: "text"
      },
      price: {
        label: "Offer Price",
        type: "number"
      }
    },
    onClose: async function() {}
  };

  const [ offerProps, setOfferProps ] = useState(defaultOfferProps);
  // One can pass the original contracts CreateEvent
  function showOffer(token : Token.CreateEvent) {
    async function onClose(state : Offer | null) {
      setOfferProps({ ...defaultOfferProps, open: false});
      // if you want to use the contracts payload
      if (!state || token.payload.owner === state.newOwner) return;
      await ledger.exercise(Token.Offer, token.contractId, state);
      // How to WRITE to the ledger +++
      // I can exercise the Offer choice on the Token contract; I can specify the contractId on which the choice is meant to be exercised
      // "state" is a parameter that was taken from the dialogue box (??) [Q/A] what is the dialogue box??
      // showOffer pops up the dialogue box and when you click "Enter" this command will be exercised.
    };
    setOfferProps({ ...defaultOfferProps, open: true, onClose})
  };

  // the way the contracts are displayed: loop through all of the Tokens retreived by the useStreamQueries and display them
  return (
    <>
      <InputDialog { ...offerProps } />
      <Table size="small">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>Issuer</TableCell>
            <TableCell key={1} className={classes.tableCell}>Owner</TableCell>
            <TableCell key={2} className={classes.tableCell}>Description</TableCell>
            <TableCell key={3} className={classes.tableCell}>Issued</TableCell>
            <TableCell key={4} className={classes.tableCell}>Last Price</TableCell>
            <TableCell key={5} className={classes.tableCell}>Currency</TableCell>
            <TableCell key={6} className={classes.tableCell}>Royalty</TableCell>
            <TableCell key={7} className={classes.tableCell}>Offer</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tokens.map(t => (
            <TableRow key={t.contractId} className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>{t.payload.issuer}</TableCell>
              <TableCell key={1} className={classes.tableCell}>{t.payload.owner}</TableCell>
              <TableCell key={2} className={classes.tableCell}>{t.payload.description}</TableCell>
              <TableCell key={3} className={classes.tableCell}>{t.payload.issued}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{t.payload.lastPrice}</TableCell>
              <TableCell key={5} className={classes.tableCell}>{t.payload.currency}</TableCell>
              <TableCell key={6} className={classes.tableCell}>{t.payload.royaltyRate}</TableCell>
              <TableCell key={7} className={classes.tableCellButton}>
                <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={t.payload.owner !== party} onClick={() => showOffer(t)}>Give</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  ); 
}

// t.payload.owner !== party to make sure that the button is distabled unless the current party is the authorized party
// @daml/react - useParty, useLedger, useStreamQueries
// @daml/ledger - all the ways to modify the ledger; basically all the json api
// @daml/types - daml types that corresponds with the JS types


// new components to explore : MyTokens, MyWorks, Payments, UserAdmin, wellKnownParties