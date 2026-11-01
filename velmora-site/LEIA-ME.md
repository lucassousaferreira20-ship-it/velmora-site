# Site de Velmora

Site estático (HTML, CSS e um pouco de JavaScript). Não precisa instalar nada.

## 1. Colocar no ar (GitHub Pages, grátis)

1. No GitHub, crie um repositório **público** chamado `velmora-site`.
2. Envie **todos os arquivos desta pasta** (inclusive a pasta `assets` e o arquivo `.nojekyll`).
3. No repositório: **Settings > Pages > Branch: main / (root) > Save**.
4. Em 1 a 2 minutos o site abre em `https://lucassousaferreira20-ship-it.github.io/velmora-site/`.

## 2. Preencher os links (único arquivo que você edita: `config.js`)

- `discord`: convite que nunca expira (Discord > Convidar pessoas > Editar link > Nunca).
- `tiktok`: endereço do perfil.
- Enquanto um campo estiver vazio, o botão aparece como "em breve" e não leva a lugar nenhum.

## 3. Botão de download do launcher

O botão aponta para `.../releases/latest/download/Velmora-Launcher.exe` no repositório `velmora-launcher-arquivos`. Para funcionar:

1. No seu Windows, rode o `criar-exe.bat` do launcher. O arquivo sai em `dist/`.
2. No repositório `velmora-launcher-arquivos`: **Releases > Draft a new release**, crie uma tag (ex.: `v1.0.0`) e **anexe o `Velmora-Launcher.exe`**. O nome do arquivo precisa ser exatamente esse.
3. **Publish release**. O link fixo passa a baixar sempre a versão mais nova.

Quando sair uma versão nova do launcher, repita o passo 2 com outra tag. O site e o bot não precisam mudar.

## 4. Link pelo bot

No `.env` do Sino de Velmora, preencha `SITE_URL` (endereço do site) e, se quiser, `CHANNEL_LAUNCHER`. No Discord, a Staff usa `/launcher painel canal:#launcher`. Depois disso `/launcher baixar` responde com o link só nesse canal.

## Observações

- As fontes vêm do Google Fonts: sem internet o site usa fontes do sistema, e continua legível.
- O Windows pode mostrar o aviso do SmartScreen no primeiro uso do `.exe` (ele não é assinado). O bot e o site orientam: **Mais informações > Executar assim mesmo**.
- Domínio próprio é opcional: Settings > Pages > Custom domain.
