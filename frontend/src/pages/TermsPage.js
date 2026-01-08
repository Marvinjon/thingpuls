import React from 'react';
import { Container, Typography, Box, Paper, Alert, Divider } from '@mui/material';

const TermsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" gutterBottom>
          Skilmálar
        </Typography>
        
        <Divider sx={{ my: 3 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
          Notkun vefsins
        </Typography>
        <Typography variant="body1" paragraph>
          Með notkun Þingpúls samþykkir þú eftirfarandi skilmála. Ef þú samþykkir ekki 
          þessa skilmála, vinsamlegast notaðu ekki vefinn.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Notkun á gögnum
        </Typography>
        <Typography variant="body1" paragraph>
          Gögnin sem birtast á Þingpúls eru að mestu leyti sótt úr opinberum gagnagrunnum 
          Alþingis. Við reynum að halda gögnunum uppfærðum en getum ekki ábyrgst að allar 
          upplýsingar séu nákvæmar eða nýjastar.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Ábyrgð
        </Typography>
        <Typography variant="body1" paragraph>
          Þingpúls veitir vefinn "eins og hann er" án nokkurrar ábyrgðar, hvort sem er 
          beint eða óbeint, um nákvæmni, heilleika eða tímanlegan eiginleika upplýsinga. 
          Við tökum ekki ábyrgð á neinum skaða sem getur orðið af notkun eða ógetu til að 
          nota vefinn.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hugverk
        </Typography>
        <Typography variant="body1" paragraph>
          Efni vefsins, þar á meðal texti, myndir, merki og önnur efni, er verndað af 
          höfundarrétti og öðrum hugverkaréttindum. Notkun efnisins er háð viðeigandi 
          höfundarréttarlögum.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Tenglar
        </Typography>
        <Typography variant="body1" paragraph>
          Vefurinn getur innihaldið tengla á aðra vefi. Við tökum ekki ábyrgð á efni eða 
          persónuverndarstefnu annarra vefja.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Breytingar á skilmálum
        </Typography>
        <Typography variant="body1" paragraph>
          Við áskiljum okkur rétt til að breyta þessum skilmálum hvenær sem er. Breytingar 
          taka gildi um leið og þær eru birtar á vefnum. Áframhaldandi notkun vefsins eftir 
          breytingar telst vera samþykki á nýjum skilmálum.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Gildandi lög
        </Typography>
        <Typography variant="body1" paragraph>
          Þessir skilmálar eru háðir íslenskum lögum. Öll deilur sem koma upp vegna þessara 
          skilmála eða notkunar á vefnum skulu leystar af íslenskum dómstólum.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Hafðu samband
        </Typography>
        <Typography variant="body1" paragraph>
          Ef þú hefur spurningar um þessa skilmála, vinsamlegast hafðu samband við okkur á 
          <a href="mailto:mhmehf@mhmehf.is" style={{ marginLeft: '4px', color: 'inherit' }}>mhmehf@mhmehf.is</a>.
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

export default TermsPage;

