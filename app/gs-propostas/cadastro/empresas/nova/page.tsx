'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmpresaForm } from '../components/forms/empresa-form';
import { createEmpresa } from '../actions/empresa-actions';
import type { EmpresaFormData } from '../types/empresa';

export default function NovaEmpresaPage() {
  const router = useRouter();

  const handleSubmit = async (data: EmpresaFormData) => {
    try {
      const result = await createEmpresa({
        tipo: data.tipo,
        cpfCnpj: data.cpfCnpj,
        nome: data.nome || undefined,
        razaoSocial: data.razaoSocial || undefined,
        nomeFantasia: data.nomeFantasia || undefined,
        logo: data.logo || undefined,
        contatoNome: data.contatoNome,
        contatoEmail: data.contatoEmail,
        contatoTelefone: data.contatoTelefone,
        cep: data.cep,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento || undefined,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        ativo: data.ativo === 1,
      });

      if (result.data?.success) {
        toast.success('Empresa cadastrada com sucesso!');
        router.push('/gs-propostas/cadastro/empresas');
        return;
      }

      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result.data && !result.data.success) {
        toast.error(result.data.error?.message || 'Erro ao cadastrar empresa');
        return;
      }

      toast.error('Erro ao cadastrar empresa');
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      toast.error('Erro inesperado ao cadastrar empresa');
    }
  };

  const handleCancel = () => {
    router.push('/gs-propostas/cadastro/empresas');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cadastrar Nova Empresa</h1>
        <p className="text-muted-foreground mt-2">
          Preencha os dados abaixo para cadastrar uma nova empresa no sistema
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <EmpresaForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
