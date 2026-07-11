# SIF - App Cliente

Aplicativo mobile do SIF para motoristas/usuários da frota municipal. O app permite autenticação, consulta de veículos, criação e acompanhamento de solicitações, acompanhamento de viagens, envio de localização durante rotas, notificações e gerenciamento básico do perfil.

O cliente foi construído com Expo, React Native, TypeScript e Expo Router. Ele consome dois serviços HTTP:

- `core-service`: autenticação, usuário, frota, solicitações, viagens, notificações e push tokens.
- `tracking-service`: recebimento dos pontos de localização das viagens em andamento.

## Principais funcionalidades

- Login com email institucional e senha.
- Sessão persistida no dispositivo com `expo-secure-store` em mobile e `localStorage` na web.
- Home com resumo de viagens de hoje, próximas viagens e veículos disponíveis.
- Consulta da frota com busca por modelo/placa e filtros por status.
- Solicitação de veículo com seleção de data, horário, veículo, destino e finalidade.
- Edição de solicitações enquanto estiverem pendentes.
- Visualização e filtragem das solicitações por status.
- Listagem de viagens agendadas, em andamento e concluídas.
- Início e finalização de viagem, com descrição obrigatória no encerramento.
- Envio periódico da localização durante viagens em andamento.
- Fila local para reenvio de pontos de localização quando houver falha de rede.
- Notificações in-app e registro do Expo Push Token após login.
- Marcação de notificações como lidas.
- Perfil do usuário com edição de nome completo e telefone.

## Tecnologias

- Expo `~54`
- React Native `0.81`
- React `19`
- TypeScript com modo `strict`
- Expo Router
- TanStack React Query
- React Native Paper
- Expo Location, Task Manager e Background Task
- Expo Notifications
- Expo Secure Store
- EAS Build

## Estrutura do projeto

```text
App-client/
  README.md
  Frontend/
    app/                 Rotas e telas do Expo Router
    components/          Componentes reutilizáveis
    config/              Configuração das APIs
    constants/           Tipos, status e metadados de domínio
    contexts/            Contexto de autenticação
    hooks/               Hooks de funcionalidades do app
    services/            Comunicação com APIs e recursos nativos
    storage/             Persistência local auxiliar
    styles/              Estilos globais
    assets/              Imagens e ícones
```

## Telas e rotas

| Rota | Tela | Descrição |
| --- | --- | --- |
| `/` | Login | Autentica o usuário e redireciona para a home. |
| `/home` | Início | Mostra resumo de viagens e veículos disponíveis. |
| `/vehicles` | Veículos | Lista a frota com busca e filtros de disponibilidade. |
| `/solicitacoes` | Solicitações | Lista solicitações, abre detalhes e permite editar pendentes. |
| `/addrequest` | Nova/editar solicitação | Cria ou atualiza uma solicitação de veículo. |
| `/avisos` | Notificações | Lista avisos e permite marcar notificações como lidas. |
| `/perfil` | Perfil | Mostra dados do usuário, permite editar nome/telefone e sair. |
| `/trips` | Minhas viagens | Lista viagens por status e data. |
| `/trips/[id]` | Detalhe da viagem | Inicia/finaliza viagem e controla tracking de localização. |

A navegação é protegida em `app/_layout.tsx`: usuários sem token voltam para `/`, e usuários autenticados são redirecionados da tela de login para `/home`.

## Configuração de ambiente

Crie o arquivo `.env` dentro de `App-client/Frontend` a partir do exemplo:

```bash
cd App-client/Frontend
cp .env.example .env
```

Variáveis esperadas:

```env
EXPO_PUBLIC_API_BASE_URL=http://IP_DA_MAQUINA:3333
EXPO_PUBLIC_TRACKING_API_URL=http://IP_DA_MAQUINA:8080
```

Use um IP acessível pelo dispositivo/emulador. Em aparelho físico, normalmente é o IP da máquina na rede local, por exemplo `http://192.168.0.10:3333`. O login bloqueia URLs como `localhost`, `127.0.0.1` e `host.docker.internal`, porque elas não funcionam corretamente a partir de um celular físico.

## Como executar

Pré-requisitos:

- Node.js LTS e npm.
- Backend `core-service` rodando e acessível.
- Backend `tracking-service` rodando e acessível.
- Android Studio/SDK para Android ou ambiente iOS configurado em macOS.
- Dispositivo físico ou development build para testar push notifications e localização em segundo plano.

Instale as dependências:

```bash
cd App-client/Frontend
npm install
```

Inicie o Expo:

```bash
npm run start
```

Ou execute diretamente em uma plataforma:

```bash
npm run android
npm run ios
npm run web
```

Observação: a versão web ajuda em testes rápidos de interface, mas o tracking nativo em segundo plano não fica disponível na web.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run start` | Inicia o Expo. |
| `npm run android` | Gera/executa o app Android com Expo dev client. |
| `npm run ios` | Gera/executa o app iOS. |
| `npm run web` | Inicia o app no navegador. |
| `npm run lint` | Executa o lint do Expo. |
| `npm run reset-project` | Executa o script local de reset do projeto. |

## Integrações com API

### Core service

O app usa `EXPO_PUBLIC_API_BASE_URL` para montar as chamadas principais:

- `POST /auth`: login.
- `GET /me`: dados do perfil.
- `PATCH /me`: atualização de nome e telefone.
- `GET /vehicles`: listagem da frota.
- `GET /vehicles/available`: veículos disponíveis por período/data.
- `GET /me/requests`: solicitações do usuário.
- `POST /me/requests`: criação de solicitação.
- `PATCH /me/requests/:requestId`: edição de solicitação.
- `GET /requests/:vehicleId/schedule`: horários ocupados de um veículo.
- `GET /me/trips`: viagens do usuário.
- `GET /me/trips/:routeId`: detalhe da viagem.
- `PATCH /me/trips/:routeId/start`: início da viagem.
- `PATCH /me/trips/:routeId/finish`: finalização da viagem.
- `GET /notifications`: notificações.
- `PATCH /notifications/read-all`: marca todas como lidas.
- `PATCH /notifications/:notificationId/read`: marca uma notificação como lida.
- `POST /push-tokens`: salva o Expo Push Token do dispositivo.

As rotas protegidas enviam `Authorization: Bearer <token>`.

### Tracking service

O app usa `EXPO_PUBLIC_TRACKING_API_URL` para enviar localização:

- `POST /routes/:routeId/tracking`

Payload enviado:

```json
{
  "latitude": -3.7319,
  "longitude": -38.5267,
  "capturedAt": "2026-07-11T12:00:00.000Z"
}
```

Quando o envio falha, o ponto é salvo em uma fila local (`storage/trackingQueue.ts`) e sincronizado novamente quando possível.

## Permissões e recursos nativos

O app solicita permissões de localização para acompanhar viagens em andamento. No Android, o `app.json` declara:

- `ACCESS_COARSE_LOCATION`
- `ACCESS_FINE_LOCATION`
- `ACCESS_BACKGROUND_LOCATION`
- `FOREGROUND_SERVICE`
- `FOREGROUND_SERVICE_LOCATION`

No iOS, o app define mensagens de permissão para localização em uso e localização em segundo plano.

Push notifications dependem de dispositivo físico ou build nativo. O arquivo `google-services.json` já está referenciado no `app.json` para Android.

## Regras importantes do fluxo

- Apenas usuários autenticados acessam as telas internas.
- Solicitações só podem ser editadas enquanto estiverem com status `PENDING`.
- A solicitação exige data futura, horário inicial, horário final posterior ao inicial, veículo, destino e finalidade.
- Ao iniciar uma viagem, o app impede que outra rota já esteja em andamento.
- A finalização da viagem exige uma descrição.
- O logout limpa a sessão, limpa o cache do React Query e tenta parar o tracking ativo.

## Qualidade e validação

Execute o lint antes de abrir PR ou gerar build:

```bash
npm run lint
```

Para build com EAS, os perfis disponíveis estão em `Frontend/eas.json`:

- `development`: build interno com development client.
- `preview`: build interno.
- `production`: build de produção com auto incremento.

Exemplo:

```bash
eas build --profile preview --platform android
```

## Pontos de atenção

- Não versione o arquivo `.env` com URLs locais.
- Em celular físico, use IP da rede local em vez de `localhost`.
- O intervalo de tracking está configurado em 30 segundos para testes. Os comentários no código indicam voltar para `10 * 60 * 1000` em produção.
- Notificações push podem não gerar token no Expo Go; prefira development build ou EAS build.
- Se imagens retornarem com `localhost`, o app tenta normalizar a URL para o mesmo host configurado na API.
