'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmpresaForm } from '../components/forms/empresa-form';
import { getEmpresaById, updateEmpresa } from '../actions/empresa-actions';
import type { Empresa, EmpresaFormData } from '../types/empresa';

interface EditarEmpresaPageProps {
  params: { id: string };
}

export default function EditarEmpresaPage({ params }: EditarEmpresaPageProps) {
  const router = useRouter();
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEmpresa() {
      try {
        setLoading(true);
        const result = await getEmpresaById({ id: params.id });

        if (result?.data?.success && result.data.data) {
          setEmpresa(result.data.data);
        } else if (result?.serverError) {
          setError(result.serverError);
          toast.error(result.serverError);
        } else if (result?.data && !result.data.success) {
          setError(result.data.error?.message || 'Empresa não encontrada');
          toast.error(result.data.error?.message || 'Empresa não encontrada');
        } else {
          setError('Empresa não encontrada');
          toast.error('Empresa não encontrada');
        }
      } catch (err) {
        console.error('Erro ao carregar empresa:', err);
        setError('Erro ao carregar dados da empresa');
        toast.error('Erro ao carregar dados da empresa');
      } finally {
        setLoading(false);
      }
    }

    loadEmpresa();
  }, [params.id]);

  const handleSubmit = async (data: EmpresaFormData) => {
    try {
      const result = await updateEmpresa({
        id: params.id,
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

      if (result?.data?.success) {
        toast.success('Empresa atualizada com sucesso!');
        router.push('/gs-propostas/cadastro/empresas');
      } else if (result?.serverError) {
        toast.error(result.serverError);
      } else if (result?.data && !result.data.success) {
        toast.error(result.data.error?.message || 'Erro ao atualizar empresa');
      } else {
        toast.error('Erro ao atualizar empresa');
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      toast.error('Erro inesperado ao atualizar empresa');
    }
  };

  const handleCancel = () => {
    router.push('/gs-propostas/cadastro/empresas');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados da empresa...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-destructive text-lg mb-4">{error || 'Empresa não encontrada'}</p>
            <button
              onClick={() => router.push('/gs-propostas/cadastro/empresas')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Voltar para listagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Empresa</h1>
        <p className="text-muted-foreground mt-2">
          Atualize os dados da empresa {empresa.tipo === 'fisica' ? empresa.nome : empresa.razaoSocial}
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <EmpresaForm
          initialData={empresa}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
