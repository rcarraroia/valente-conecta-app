/**
 * Templates de Email - Instituto Coração Valente
 * Templates HTML para envio de recibos e notificações
 */

interface ReceiptEmailData {
  donorName: string;
  receiptNumber: string;
  amount: string;
  paymentDate: string;
  pdfUrl: string;
  verificationUrl: string;
}

export const receiptEmailTemplate = (data: ReceiptEmailData): string => {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Doação - Instituto Coração Valente</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7FE5E5;
    }
    .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    h1 {
      color: #9B8FD4;
      margin: 10px 0;
      font-size: 24px;
    }
    .receipt-number {
      background: linear-gradient(135deg, #9B8FD4, #7FE5E5);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin: 10px 0;
    }
    .content {
      margin: 20px 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(155, 143, 212, 0.1), rgba(127, 229, 229, 0.1));
      padding: 20px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: center;
    }
    .amount {
      font-size: 32px;
      font-weight: bold;
      color: #9B8FD4;
      margin: 10px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #9B8FD4, #7FE5E5);
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .button:hover {
      opacity: 0.9;
    }
    .info-box {
      background: #f9f9f9;
      padding: 15px;
      border-left: 4px solid #7FE5E5;
      margin: 20px 0;
      font-size: 14px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
    }
    .thank-you {
      background: linear-gradient(135deg, rgba(155, 143, 212, 0.1), rgba(127, 229, 229, 0.1));
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      margin: 20px 0;
      color: #9B8FD4;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">❤️</div>
      <h1>Recibo de Doação</h1>
      <div class="receipt-number">${data.receiptNumber}</div>
    </div>
    
    <div class="content">
      <p>Olá, <strong>${data.donorName}</strong>!</p>
      
      <p>Agradecemos imensamente pela sua generosa doação ao Instituto Coração Valente. Sua contribuição faz toda a diferença em nossas ações sociais!</p>
      
      <div class="highlight-box">
        <p style="margin: 0; font-size: 14px; color: #666;">Valor da Doação</p>
        <div class="amount">${data.amount}</div>
        <p style="margin: 0; font-size: 14px; color: #666;">Recebido em ${data.paymentDate}</p>
      </div>
      
      <div class="thank-you">
        💜 Sua doação nos ajuda a continuar transformando vidas!
      </div>
      
      <p style="text-align: center;">
        <a href="${data.pdfUrl}" class="button">📄 Baixar Recibo em PDF</a>
      </p>
      
      <div class="info-box">
        <strong>📋 Sobre o Recibo:</strong><br>
        • Este recibo é válido para fins de comprovação de doação<br>
        • Pode ser utilizado para declaração de Imposto de Renda<br>
        • Guarde-o em local seguro para seus registros<br>
        • Número do recibo: <strong>${data.receiptNumber}</strong>
      </div>
      
      <p style="font-size: 14px; color: #666;">
        <strong>Verificação de Autenticidade:</strong><br>
        Você pode verificar a autenticidade deste recibo acessando:<br>
        <a href="${data.verificationUrl}" style="color: #9B8FD4;">${data.verificationUrl}</a>
      </p>
    </div>
    
    <div class="footer">
      <p>
        <strong>Instituto Coração Valente</strong><br>
        CNPJ: 42.044.102/0001-59<br>
        Rua Primeiro de Janeiro, nº 35, Sala 401 - Centro<br>
        Timóteo - MG - CEP: 35.180-032<br>
        Tel: (31) 8600-9095 | contato@coracaovalente.org.br
      </p>
      <p style="margin-top: 20px; font-size: 11px;">
        Este é um email automático. Por favor, não responda.<br>
        Se tiver dúvidas, entre em contato conosco através dos canais acima.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

export const receiptEmailSubject = (receiptNumber: string): string => {
  return `Recibo de Doação ${receiptNumber} - Instituto Coração Valente`;
};
