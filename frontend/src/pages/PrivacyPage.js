import React from 'react';
import { Container, Typography, Box, Paper, Alert, Divider } from '@mui/material';

const PrivacyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          Persónuvernd
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          Persónuverndarstefna
        </Typography>
        <Typography variant="body1" paragraph>
          Þingpúls er ábyrgur fyrir að vernda persónuupplýsingar notenda og fylgja 
          gildandi lögum um persónuvernd, þar á meðal lögum um persónuvernd og meðferð 
          persónuupplýsinga.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hvaða upplýsingar söfnum við?
        </Typography>
        <Typography variant="body1" paragraph>
          Við söfnum og vinnum með eftirfarandi tegundir persónuupplýsinga:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            Upplýsingar sem þú gefur okkur beint, svo sem nafn, netfang og önnur 
            upplýsingar sem þú gefur upp við skráningu eða notkun á vefnum
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Upplýsingar um notkun á vefnum, svo sem IP-tölur, vafrakökur og notkunarsaga
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Upplýsingar sem birtast opinberlega á Alþingi, svo sem nöfn þingmanna og 
            tengdar upplýsingar
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hvernig notum við upplýsingarnar?
        </Typography>
        <Typography variant="body1" paragraph>
          Við notum persónuupplýsingar til að:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            Veita og bæta þjónustu okkar
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Taka á móti og svara ábendingum og spurningum
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Fylgjast með notkun á vefnum til að bæta notendaupplifun
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Fylgja lögum og reglugerðum
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Verndun gagna
        </Typography>
        <Typography variant="body1" paragraph>
          Við notum viðeigandi tæknilegar og skipulagslegar öryggisráðstafanir til að vernda 
          persónuupplýsingar gegn óheimilum aðgangi, breytingum, afhendingu eða eyðingu.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Réttur þinn
        </Typography>
        <Typography variant="body1" paragraph>
          Samkvæmt lögum um persónuvernd hefur þú rétt á að:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            Fá aðgang að persónuupplýsingum sem við höfum um þig
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Krefjast leiðréttingar á rangar eða ófullnægjandi upplýsingar
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Krefjast eyðingar á persónuupplýsingum
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Mótmæla meðferð persónuupplýsinga
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hafðu samband
        </Typography>
        <Typography variant="body1" paragraph>
          Ef þú hefur spurningar um persónuvernd eða vilt nýta rétt þinn, vinsamlegast hafðu 
          samband við okkur á <a href="mailto:mhmehf@mhmehf.is" style={{ color: 'inherit' }}>mhmehf@mhmehf.is</a>.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Alert severity="warning" sx={{ mt: 4 }}>
          <Typography variant="body1" fontWeight="bold" gutterBottom>
            Mikilvægt: Um gagnsæi gagna
          </Typography>
          <Typography variant="body2" paragraph>
            Þessi vefur ábyrgist ekki nákvæmni eða heilleika gagnanna sem birtast hér. 
            Gögnin geta verið röng, ófullnægjandi eða úrelt. Fyrir nákvæmustu og nýjustu 
            upplýsingarnar, vinsamlegast farðu á 
            <a href="https://www.althingi.is" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '4px', color: 'inherit', textDecoration: 'underline' }}>
              althingi.is
            </a>.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default PrivacyPage;

