# 📚 Documentação da API

## Endpoints Base

`http://localhost:3000/api`

---

## 🎲 Rifas

### GET `/campanhas`
Retorna todas as rifas.

**Query Parameters:**
- `status?` - Filtrar por status (open, closed, drawn)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Rifa do iPhone 15",
    "description": "string",
    "image": "url",
    "images": ["url1", "url2"],
    "prizeAmount": 7000,
    "totalQuotas": 100,
    "soldQuotas": 45,
    "quotaPrice": 0.50,
    "status": "open",
    "winner": null,
    "creatorId": "uuid",
    "creator": {
      "name": "João Silva",
      "email": "joao@teste.com"
    },
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

---

### POST `/campanhas`
Cria uma nova rifa.

**Request Body:**
```json
{
  "title": "Rifa do iPhone 15",
  "description": "iPhone 15 Pro Max 256GB",
  "prizeAmount": 7000,
  "totalQuotas": 100,
  "quotaPrice": 0.50,
  "images": ["data:image/..."]
}
```

**Response:** *(201 Created)*
```json
{
  "id": "uuid",
  "title": "Rifa do iPhone 15",
  ...
}
```

---

### GET `/campanhas/[id]`
Retorna detalhes de uma rifa específica.

**Response:**
```json
{
  "id": "uuid",
  "title": "Rifa do iPhone 15",
  ...
  "purchases": [
    {
      "id": "uuid",
      "quotas": 10,
      "amount": 5.00,
      "status": "completed",
      "user": {
        "name": "Maria",
        "email": "maria@teste.com"
      }
    }
  ]
}
```

---

## 👥 Compradores

### GET `/top-buyers`
Retorna os top 5 compradores.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "totalSpent": 150.00,
    "totalQuotas": 300,
    "raffleBought": 5,
    "createdAt": "2024-01-20T10:00:00Z"
  }
]
```

---

## 🔐 Autenticação

*Implementar com NextAuth.js*

Endpoints futuros:
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/me`

---

## 💳 Pagamentos

*Implementar com Mercado Pago*

Endpoints futuros:
- POST `/payments/create`
- GET `/payments/[id]`
- POST `/payments/webhook`

---

## 📧 Emails

*Implementar com SendGrid/Nodemailer*

Endpoints futuros:
- POST `/emails/confirm-purchase`
- POST `/emails/raffle-winner`

---

## 🤖 WhatsApp

*Implementar com Twilio/WhatsApp Business API*

Endpoints futuros:
- POST `/whatsapp/send`
- POST `/whatsapp/webhook`

---

## Códigos de Status HTTP

| Status | Significado |
|--------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## 🧪 Exemplos cURL

### Listar todas as rifas
```bash
curl http://localhost:3000/api/rifas
```

### Pegar uma rifa específica
```bash
curl http://localhost:3000/api/campanhas/[id]
```

### Top compradores
```bash
curl http://localhost:3000/api/top-buyers
```

---

## 🔄 Fluxo de Compra (Futuro)

1. Cliente clica "Comprar Cotas"
2. Sistema gera QR Code via Mercado Pago
3. Cliente escaneia QR e paga no Pix
4. Webhook recebe confirmação
5. Sistema libera cotas automaticamente
6. Email enviado ao cliente
7. Mensagem WhatsApp opcional

---

## 🎯 TODO

- [ ] Adicionar autenticação JWT
- [ ] Criar endpoints para operações CRUD completas
- [ ] Implementar rate limiting
- [ ] Adicionar cache Redis
- [ ] Testes automatizados
- [ ] Documentação OpenAPI/Swagger
