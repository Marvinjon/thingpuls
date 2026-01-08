import React from 'react';
import { Container, Typography, Box, Paper, Alert, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          Um verkefnið
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            <Typography variant="body1" fontWeight="bold" gutterBottom>
              Vefurinn er í þróun
            </Typography>
            <Typography variant="body2">
              Þessi vefur er í stöðugri þróun og nýjar eiginleikar bætast við reglulega. 
              Ef þú hefur ábendingar eða tillögur, vinsamlegast sendu okkur línu á 
              <a href="mailto:mhmehf@mhmehf.is" style={{ marginLeft: '4px', color: 'inherit' }}>
                mhmehf@mhmehf.is
              </a>.
            </Typography>
          </Alert>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Um Þingpúls
        </Typography>
        <Typography variant="body1" paragraph>
          Þingpúls er gagnsætt verkfæri sem miðar að því að gera störf Alþingis aðgengilegri 
          og skiljanlegri fyrir almenning. Vefurinn veitir aðgang að upplýsingum um þingmenn, 
          þingmál, atkvæðagreiðslur og fleira sem tengist störfum þingsins.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hvers vegna var þessi vefur búinn til?
        </Typography>
        <Typography variant="body1" paragraph>
          Ég vildi vita betur hvernig fólkið sem að ég kaus væri í rauninni að haga sér á 
          alþingi og mér fannst það ekki nógu aðgengilegt á alþingis síðunni þannig hér tók 
          ég saman nokkur gögn frá þeirri síðu til að geta skoðað betur.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Markmið
        </Typography>
        <Typography variant="body1" paragraph>
          Markmið Þingpúls er að:
        </Typography>
        <Box component="ul" sx={{ pl: 3 }}>
          <Typography component="li" variant="body1" paragraph>
            Auka gagnsæi í stjórnmálum með aðgangi að upplýsingum um störf þingsins
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Auðvelda fyrir almenning að fylgjast með störfum þingmanna
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Búa til tækifæri fyrir þátttöku almennings í lýðræðislegri umræðu
          </Typography>
          <Typography component="li" variant="body1" paragraph>
            Veita tölfræðilegar greiningar á þingstörfum
          </Typography>
        </Box>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hafðu samband
        </Typography>
        <Typography variant="body1" paragraph>
          Ef þú hefur spurningar, ábendingar eða tillögur um verkefnið, vinsamlegast hafðu samband við okkur:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <EmailIcon />
          <Typography variant="body1">
            <a href="mailto:mhmehf@mhmehf.is" style={{ color: 'inherit' }}>
              mhmehf@mhmehf.is
            </a>
          </Typography>
        </Box>

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

export default AboutPage;

