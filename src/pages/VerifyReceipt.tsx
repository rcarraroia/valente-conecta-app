import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, ArrowLeft, Download } from 'lucide-react';

const VerifyReceipt = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hash) {
      verifyReceipt(hash);
    }
  }, [hash]);

  const verifyReceipt = async (verificationHash: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('receipts')
        .select('*')
        .eq('verification_hash', verificationHash)
        .single();

      if (fetchError || !data) {
        setError('Recibo não encontrado ou hash inválido');
        return;
      }

      setReceipt(data);
    } catch (err: any) {
      setError('Erro ao verificar recibo');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = async () => {
    if (!receipt) return;

    try {
      const { data, error } = await supabase.functions.invoke('generate-receipt-pdf', {
        body: { receiptId: receipt.id }
      });

      if (error) throw error;

      // Abrir HTML em nova aba (por enquanto)
      const blob = new Blob([data], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cv-off-white flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cv-coral"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cv-off-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-heading">
              Verificação de Recibo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h3 className="text-xl font-semibold mb-2">Recibo Não Encontrado</h3>
                <p className="text-cv-gray-light">{error}</p>
              </div>
            ) : receipt ? (
              <div className="space-y-6">
                <div className="text-center py-6 bg-green-50 rounded-lg">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <h3 className="text-xl font-semibold mb-2 text-green-700">
                    Recibo Autêntico
                  </h3>
                  <p className="text-sm text-green-600">
                    Este recibo foi verificado e é válido
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-cv-off-white p-4 rounded-lg">
                    <p className="text-sm text-cv-gray-light mb-1">Número do Recibo</p>
                    <p className="font-semibold text-lg">{receipt.receipt_number}</p>
                  </div>

                  <div className="bg-cv-off-white p-4 rounded-lg">
                    <p className="text-sm text-cv-gray-light mb-1">Valor</p>
                    <p className="font-semibold text-lg text-cv-coral">
                      {formatCurrency(receipt.amount)}
                    </p>
                  </div>

                  <div className="bg-cv-off-white p-4 rounded-lg">
                    <p className="text-sm text-cv-gray-light mb-1">Doador</p>
                    <p className="font-semibold">{receipt.donor_name}</p>
                  </div>

                  <div className="bg-cv-off-white p-4 rounded-lg">
                    <p className="text-sm text-cv-gray-light mb-1">Data do Recebimento</p>
                    <p className="font-semibold">{formatDate(receipt.payment_date)}</p>
                  </div>

                  {receipt.payment_method && (
                    <div className="bg-cv-off-white p-4 rounded-lg">
                      <p className="text-sm text-cv-gray-light mb-1">Forma de Pagamento</p>
                      <p className="font-semibold">{receipt.payment_method}</p>
                    </div>
                  )}

                  <div className="bg-cv-off-white p-4 rounded-lg">
                    <p className="text-sm text-cv-gray-light mb-1">Data de Emissão</p>
                    <p className="font-semibold">{formatDate(receipt.generated_at)}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">Sobre o Recibo</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>✓ Este recibo é válido para fins de comprovação de doação</li>
                    <li>✓ Pode ser utilizado para declaração de Imposto de Renda</li>
                    <li>✓ Emitido pela ONG Coração Valente (CNPJ: 42.044.102/0001-59)</li>
                  </ul>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-cv-coral hover:bg-cv-coral/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Recibo em PDF
                  </Button>
                </div>

                <div className="text-center text-xs text-cv-gray-light mt-6">
                  <p>Hash de Verificação:</p>
                  <p className="font-mono break-all">{receipt.verification_hash}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-cv-gray-light">
          <p>ONG Coração Valente</p>
          <p>CNPJ: 42.044.102/0001-59</p>
          <p>contato@coracaovalente.org.br | (31) 8600-9095</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyReceipt;
