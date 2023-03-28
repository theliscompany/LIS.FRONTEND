import { Box, Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import '../../App.css';

function Privacy() {
  
    return (
        <Box sx={{ maxWidth: "lg", margin: "0 auto" }}>
            <Grid container my={5}>
                <Grid item xs={12} fontSize={17} mx={5}>
                <h2 className="my-3">Politique de confidentialité</h2>
                <h4 className="my-3">Introduction</h4>
                Dans le cadre de son activité, la société OMNIFREIGHT, dont le siège social est situé à 2000 Antwerp - Belgium, est amenée à collecter et à traiter des informations dont certaines sont qualifiées de "données personnelles". OMNIFREIGHT attache une grande importance au respect de la vie privée, et n’utilise que des données de manière responsable et confidentielle et dans une finalité précise.
                &nbsp;
                <h4 className="my-3">Données personnelles</h4>
                Sur le site web OMNIFREIGHT, il y a 2 types de données susceptibles d’être recueillies :
                <ul className="pl-3">
                    <li>
                        Les données transmises directement
                        Ces données sont celles que vous nous transmettez directement, via un formulaire de contact ou bien par contact direct par email. Sont obligatoires dans le formulaire de contact les champs « prénom et nom », « entreprise ou organisation »,numéro de téléphone et « email ».
                    </li>
                    <li>
                        Les données collectées automatiquement
                        Lors de vos visites, une fois votre consentement donné, nous pouvons recueillir des informations de type « web analytics » relatives à votre navigation, la durée de votre consultation, votre adresse IP, votre type et version de navigateur. La technologie utilisée est le cookie.
                    </li>
                </ul>
                <h4 className="my-3">Utilisation des données</h4>
                Les données que vous nous transmettez directement sont utilisées dans le but de vous re-contacter et/ou dans le cadre de la demande que vous nous faites. Les données « web analytics » sont collectées de forme anonyme (en enregistrant des adresses IP anonymes) par Google Analytics, et nous permettent de mesurer l'audience de notre site web, les consultations et les éventuelles erreurs afin d’améliorer constamment l’expérience des utilisateurs. Ces données sont utilisées par OMNIFREIGHT, responsable du traitement des données, et ne seront jamais cédées à un tiers ni utilisées à d’autres fins que celles détaillées ci-dessus.
                &nbsp;
                <h4 className="my-3">Base légale</h4>
                Les données personnelles ne sont collectées qu’après consentement obligatoire de l’utilisateur. Ce consentement est valablement recueilli (boutons et cases à cocher), libre, clair et sans équivoque.
                &nbsp;
                <h4 className="my-3">Durée de conservation</h4>
                Les données seront sauvegardées durant une durée maximale de 3 ans.
                &nbsp;
                <h4 className="my-3">Cookies</h4>
                Voici la liste des cookies utilisées et leur objectif :
                <ul className="pl-3">
                    <li>Cookies Google Analytics (<span style={{color: '#008b97'}}><a style={{color: '#008b97'}} href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage">liste exhaustive</a></span>) : Web analytics</li>
                    <li>Autres cookies : Permet de garder en mémoire le fait que vous acceptez les cookies afin de ne plus vous importuner lors de votre prochaine visite.</li>
                </ul>
                <h4 className="my-3">Vos droits concernant les données personnelles</h4>
                Vous avez le droit de consultation, demande de modification ou d’effacement sur l’ensemble de vos données personnelles. Vous pouvez également retirer votre consentement au traitement de vos données.
                &nbsp;
                <h4 className="my-3">Contact délégué à la protection des données</h4>
                Email : transport@omnifreight.eu - Numéro de téléphone : (+32)3.295.38.82
                &nbsp;
                </Grid>
            </Grid>
        </Box>
    );
}

export default Privacy;
