import React, { useEffect, useState, useRef } from 'react';
import { Box, Grid } from '@mui/material';
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  MenuButtonStrikethrough,
  MenuButtonHorizontalRule,
  MenuSelectTextAlign,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonEditLink,
  MenuButtonUnderline,
  MenuButtonUndo,
  MenuButtonRedo,
  RichTextEditorProvider,
  RichTextField,
} from "mui-tiptap";


function Seafreights() {
  const defaultMail = `
    <p>Hello {{name}},</p>
    <br>
    <p>As a freight forwarder we can organize your shipment of {{containers}} containers loaded with {{containersProducts}}, from {{haulageType}} {{loadingCity}} up to arrival {{destinationPort}} at a total cost of {{currency}} {{totalPrice}}</p>
    <br>
    <p>Inclusive of:</p> 
    <p>{{freetime}} loading included for each container, after which {{overtimeTariff}} {{currency}} / hour is charged.</p>
    <p>{{services}} included</p>
    <br>
    <p>Not included:</p>
    <p>Costs related to customs inspection, if required</p>
    <p>Detention, demurrage, storage</p>
    <br>
    <p>Offer based on ETD {{departure}} {{departureDate}}</p>
    <br>
    <p>Sailing time {{departure}} to {{destination}} approx. {{transitTime}} days</p>
    <br>
    <p>This offer remains valid today, to be confirmed at the time of your booking.</p>
    <br>
    <p>We also send per attached pdf our order confirmation and invoice terms & conditions</p>
    <br>
    <br>
    <p>Best regards,</p>
    <br>
    <p>JEFFRY COOLS</p>`;
    
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultMail,
  });
  

  return (
    <Grid container>
      <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <RichTextEditorProvider editor={editor}>
                <RichTextField
                  controls={
                    <MenuControlsContainer>
                      <MenuSelectHeading />
                      <MenuDivider />
                      <MenuButtonBold />
                      <MenuButtonItalic />
                      {/* <MenuButtonUnderline /> */}
                      <MenuButtonStrikethrough />
                      <MenuButtonOrderedList />
                      <MenuButtonBulletedList />
                      <MenuSelectTextAlign />
                      <MenuButtonEditLink />
                      <MenuButtonHorizontalRule />
                      <MenuButtonUndo />
                      <MenuButtonRedo />
                      {/* Add more controls of your choosing here */}
                    </MenuControlsContainer>
                  }
                />
              </RichTextEditorProvider>
            </Box>
        </Grid>
    </Grid>
  );
}

export default Seafreights;
