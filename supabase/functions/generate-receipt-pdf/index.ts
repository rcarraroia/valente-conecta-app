import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratePDFRequest {
  receiptId: string;
}

const ORG_DATA = {
  razao_social: "ORGANIZAÇÃO DA SOCIEDADE CIVIL CORAÇÃO VALENTE",
  cnpj: "42.044.102/0001-59",
  endereco: "Rua Primeiro de Janeiro, nº 35, Sala 401",
  bairro: "Centro",
  cidade: "Timóteo",
  estado: "MG",
  cep: "35.180-032",
  telefone: "(31) 8600-9095",
  email: "contato@coracaovalente.org.br",
  assinaturas: {
    presidente: {
      nome: "Adriane Aparecida Carraro Alves",
      cpf: "059.514.586-84",
      cargo: "Presidente"
    },
    tesoureiro: {
      nome: "Roberto Cirilo",
      cpf: "458.379.106-20",
      cargo: "1º Tesoureiro"
    }
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar service_role para acesso total (função interna)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Aceitar tanto GET (query param) quanto POST (body)
    let receiptId: string;
    let hash: string | null = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      receiptId = url.searchParams.get('receiptId') || '';
      hash = url.searchParams.get('hash'); // Hash de verificação para segurança
    } else {
      const body: GeneratePDFRequest = await req.json();
      receiptId = body.receiptId;
    }
    
    if (!receiptId) {
      throw new Error('receiptId é obrigatório');
    }

    // Buscar dados do recibo
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (error || !receipt) {
      throw new Error('Recibo não encontrado');
    }

    // 🔒 SEGURANÇA: Validar hash se fornecido (previne acesso não autorizado)
    if (hash && hash !== receipt.verification_hash) {
      throw new Error('Hash de verificação inválido');
    }

    // Verificar se PDF já existe no storage
    if (receipt.pdf_url) {
      console.log('✅ PDF já existe, redirecionando:', receipt.pdf_url);
      return Response.redirect(receipt.pdf_url, 302);
    }

    // Gerar HTML do recibo
    const html = generateReceiptHTML(receipt);

    // 📄 RETORNAR HTML DIRETAMENTE (navegador renderiza como PDF)
    // Usuário pode usar Ctrl+P para salvar como PDF
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="Recibo-${receipt.receipt_number}.html"`,
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Erro ao gerar PDF:', error);
    
    // Retornar página de erro amigável
    const errorHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Erro - Recibo não encontrado</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .error-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #e74c3c; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>❌ Erro ao carregar recibo</h1>
        <p>${error.message}</p>
        <p>Se você recebeu este link por email, entre em contato conosco.</p>
        <a href="https://coracaovalente.org.br" class="button">Voltar ao site</a>
    </div>
</body>
</html>`;
    
    return new Response(errorHtml, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
    });
  }
};

function generateReceiptHTML(receipt: any): string {
  const qrCodeData = `https://coracaovalente.org.br/verificar/${receipt.verification_hash}`;
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recibo de Doação - Coração Valente</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20mm;
            background: white;
            color: #333;
        }
        
        .receipt-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 30px;
            border: 2px solid #9B8FD4;
            border-radius: 10px;
            background: linear-gradient(to bottom right, rgba(155, 143, 212, 0.02), rgba(127, 229, 229, 0.02));
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #7FE5E5;
        }
        
        .logo-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #9B8FD4, #7FE5E5);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
        }
        
        h1 {
            color: #9B8FD4;
            margin: 10px 0;
            font-size: 28px;
            font-weight: 600;
        }
        
        .receipt-number {
            background: #9B8FD4;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            display: inline-block;
            font-weight: bold;
            font-size: 18px;
            margin-top: 10px;
        }
        
        .org-info {
            text-align: center;
            font-size: 11px;
            color: #666;
            margin-top: 10px;
            line-height: 1.4;
        }
        
        .section {
            margin: 25px 0;
            padding: 15px;
            background: rgba(155, 143, 212, 0.05);
            border-radius: 8px;
        }
        
        .section-title {
            color: #9B8FD4;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px dotted #ddd;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .label {
            font-weight: 600;
            color: #666;
            font-size: 13px;
        }
        
        .value {
            color: #333;
            font-size: 14px;
        }
        
        .amount-box {
            background: linear-gradient(135deg, #9B8FD4, #7FE5E5);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 25px 0;
        }
        
        .amount-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .amount-value {
            font-size: 36px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        .declaration {
            background: #f9f9f9;
            padding: 20px;
            border-left: 4px solid #7FE5E5;
            margin: 25px 0;
            font-size: 13px;
            line-height: 1.6;
            color: #555;
            text-align: justify;
        }
        
        .signatures {
            margin-top: 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        .signature-block {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
        }
        
        .signature-name {
            font-weight: bold;
            font-size: 13px;
            color: #333;
        }
        
        .signature-title {
            font-size: 11px;
            color: #666;
            margin-top: 3px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
        }
        
        .qr-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-top: 20px;
        }
        
        .qr-code {
            width: 80px;
            height: 80px;
            border: 2px solid #9B8FD4;
            border-radius: 8px;
            padding: 5px;
            background: white;
        }
        
        .verification-info {
            text-align: left;
            font-size: 11px;
            color: #666;
        }
        
        .verification-code {
            font-family: monospace;
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            word-break: break-all;
        }
        
        .thank-you {
            background: linear-gradient(135deg, rgba(155, 143, 212, 0.1), rgba(127, 229, 229, 0.1));
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            color: #9B8FD4;
            font-style: italic;
        }
        
        @media print {
            body {
                padding: 10mm;
            }
            .receipt-container {
                border: 2px solid #9B8FD4;
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <div class="logo-container">
                <div class="logo">❤️</div>
            </div>
            <h1>RECIBO DE DOAÇÃO</h1>
            <div class="receipt-number">Nº ${receipt.receipt_number}</div>
            <div class="org-info">
                ${ORG_DATA.razao_social}<br>
                CNPJ: ${ORG_DATA.cnpj}<br>
                ${ORG_DATA.endereco} - ${ORG_DATA.bairro}<br>
                ${ORG_DATA.cidade} - ${ORG_DATA.estado} - CEP: ${ORG_DATA.cep}<br>
                Tel: ${ORG_DATA.telefone} | ${ORG_DATA.email}
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Dados do Doador</div>
            <div class="info-row">
                <span class="label">Nome:</span>
                <span class="value">${receipt.donor_name}</span>
            </div>
            ${receipt.donor_document ? `
            <div class="info-row">
                <span class="label">CPF/CNPJ:</span>
                <span class="value">${receipt.donor_document}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="label">E-mail:</span>
                <span class="value">${receipt.donor_email}</span>
            </div>
        </div>
        
        <div class="amount-box">
            <div class="amount-label">Valor da Doação</div>
            <div class="amount-value">R$ ${formatCurrency(receipt.amount)}</div>
            <div class="amount-label">${receipt.amount_in_words}</div>
        </div>
        
        <div class="section">
            <div class="section-title">Detalhes da Doação</div>
            <div class="info-row">
                <span class="label">Data do Recebimento:</span>
                <span class="value">${formatDate(receipt.payment_date)}</span>
            </div>
            <div class="info-row">
                <span class="label">Forma de Pagamento:</span>
                <span class="value">${receipt.payment_method || 'Não informado'}</span>
            </div>
            ${receipt.transaction_id ? `
            <div class="info-row">
                <span class="label">ID da Transação:</span>
                <span class="value">${receipt.transaction_id}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="label">Finalidade:</span>
                <span class="value">Apoio às ações sociais de defesa de direitos</span>
            </div>
        </div>
        
        <div class="declaration">
            <strong>DECLARAÇÃO:</strong> Declaramos para os devidos fins legais que recebemos a importância acima mencionada a título de doação voluntária, sem qualquer contraprestação de bens ou serviços, em conformidade com a Lei nº 9.249/1995, Lei nº 9.532/1997 e demais normas aplicáveis. Esta doação destina-se exclusivamente ao cumprimento dos objetivos sociais desta organização.
        </div>
        
        <div class="thank-you">
            💜 Agradecemos sua generosidade e confiança em nosso trabalho! 
            Sua doação faz a diferença na vida de muitas pessoas.
        </div>
        
        <div class="signatures">
            <div class="signature-block">
                <div class="signature-line">
                    <div class="signature-name">${ORG_DATA.assinaturas.presidente.nome}</div>
                    <div class="signature-title">${ORG_DATA.assinaturas.presidente.cargo}<br>CPF: ${ORG_DATA.assinaturas.presidente.cpf}</div>
                </div>
            </div>
            <div class="signature-block">
                <div class="signature-line">
                    <div class="signature-name">${ORG_DATA.assinaturas.tesoureiro.nome}</div>
                    <div class="signature-title">${ORG_DATA.assinaturas.tesoureiro.cargo}<br>CPF: ${ORG_DATA.assinaturas.tesoureiro.cpf}</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(qrCodeData)}" 
                     alt="QR Code" 
                     class="qr-code" />
                <div class="verification-info">
                    <strong>Verificação de Autenticidade:</strong><br>
                    Acesse: coracaovalente.org.br/verificar<br>
                    Código: <span class="verification-code">${receipt.verification_hash.substring(0, 16)}...</span>
                </div>
            </div>
            <div style="margin-top: 20px; font-size: 11px; color: #999;">
                ${ORG_DATA.cidade}-${ORG_DATA.estado}, ${formatDate(receipt.generated_at)}<br>
                Documento emitido eletronicamente • Válido sem assinatura física
            </div>
        </div>
    </div>
</body>
</html>`;
}

function formatCurrency(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

serve(handler);
