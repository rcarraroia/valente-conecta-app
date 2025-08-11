import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Info, ExternalLink } from 'lucide-react';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  showDetails?: boolean;
  className?: string;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  checked,
  onCheckedChange,
  required = true,
  error,
  showDetails = true,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id="data-sharing-consent"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
        <div className="flex-1">
          <Label 
            htmlFor="data-sharing-consent" 
            className="text-sm leading-relaxed cursor-pointer"
          >
            Autorizo o compartilhamento dos meus dados com o Instituto Coração Valente
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          <p className="text-xs text-gray-600 mt-1">
            Seus dados serão utilizados para campanhas de captação de recursos e 
            comunicação sobre projetos sociais.
          </p>

          {showDetails && (
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Ver detalhes sobre o compartilhamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Compartilhamento de Dados com Instituto Coração Valente</DialogTitle>
                    <DialogDescription>
                      Informações sobre como seus dados serão utilizados
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Dados Compartilhados</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Nome completo</li>
                        <li>• Endereço de e-mail</li>
                        <li>• Número de telefone</li>
                        <li>• CPF (para validação)</li>
                        <li>• Origem do cadastro (Projeto Visão Itinerante)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Finalidade do Uso</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Campanhas de captação de recursos direcionadas</li>
                        <li>• Comunicação sobre projetos e ações sociais</li>
                        <li>• Convites para eventos e atividades</li>
                        <li>• Relatórios de impacto social</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Seus Direitos</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Revogar o consentimento a qualquer momento</li>
                        <li>• Solicitar exclusão dos seus dados</li>
                        <li>• Atualizar informações pessoais</li>
                        <li>• Receber cópia dos dados armazenados</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Segurança</h4>
                      <p className="text-sm text-gray-600">
                        Seus dados são transmitidos de forma criptografada e armazenados 
                        com segurança pelo Instituto Coração Valente, seguindo as melhores 
                        práticas de proteção de dados pessoais.
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Importante:</strong> O consentimento é necessário para que 
                        possamos compartilhar seus dados. Sem ele, seus dados permanecerão 
                        apenas no sistema do Projeto Visão Itinerante.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                      <span>
                        Para mais informações, consulte a 
                        <Button variant="link" className="p-0 h-auto ml-1">
                          Política de Privacidade
                        </Button>
                      </span>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {required && !checked && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-800 text-sm">
            O consentimento é obrigatório para prosseguir com o cadastro.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};