
import { supabase } from "@/shared/lib/supabase-client";
import { ProposalFormData, ProposalData } from "../ui/components/proposta-unificada/types";

export const proposalsApi = {
  async getById(id: string) {
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: items, error: itemsError } = await supabase
      .from('proposal_items')
      .select('*')
      .eq('proposal_id', id);

    if (itemsError) throw itemsError;

    return { ...proposal, items };
  },

  async create(data: ProposalFormData) {
    // 1. Inserir proposta
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        code: data.code,
        title: data.name,
        status: 'DRAFT', // Default para nova
        client_name: data.clientName || "Cliente Desconhecido",
        company_name: data.companyName,
        company_cnpj: data.companyCnpj,
        company_address: data.companyAddress,
        company_neighborhood: data.companyNeighborhood,
        company_city: data.companyCity,
        company_state: data.companyState,
        company_zip: data.companyZip,
        company_email: data.companyEmail,
        company_phone: data.companyPhone,
        responsible_user: data.responsibleName,
        contact_name: data.contactName, // Verificar se existe na coluna
        payment_mode: data.paymentMode,
        valid_until: data.validity ? new Date(data.validity).toISOString() : null,
        total_value: (data.items || []).reduce((acc, item) => acc + (item.quantity * item.unitValue), 0),
        notes: data.internalNotes,
        observations: data.observations, // Verificar mapeamento
        logo_url: data.logoUrl,
        logo_position: data.logoPosition,
        client_id: data.clientId,
        company_id: data.companyId,
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Inserir itens
    if (data.items && data.items.length > 0) {
      const itemsToInsert = data.items.map((item, index) => ({
        proposal_id: proposal.id,
        type: 'service',
        name: item.description,
        description: item.itemObservation || "",
        quantity: item.quantity,
        unit_price: item.unitValue,
        total: item.quantity * item.unitValue,
        unit: item.unit || 'hora',
        "order": index
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return proposal;
  },

  async update(id: string, data: ProposalFormData) {
    // 1. Atualizar proposta
    const { data: proposal, error } = await supabase
      .from('proposals')
      .update({
        code: data.code,
        title: data.name,
        // status não atualizamos aqui diretamente se for edição, ou sim? 
        // Manter o que veio ou atualizar? Geralmente edição mantém status ou volta pra draft? 
        // Vamos assumir que mantém o status atual se não vier, mas o formData não tem status.
        client_name: data.clientName,
        company_name: data.companyName,
        company_cnpj: data.companyCnpj,
        company_address: data.companyAddress,
        company_neighborhood: data.companyNeighborhood,
        company_city: data.companyCity,
        company_state: data.companyState,
        company_zip: data.companyZip,
        company_email: data.companyEmail,
        company_phone: data.companyPhone,
        responsible_user: data.responsibleName,
        contact_name: data.contactName,
        payment_mode: data.paymentMode,
        valid_until: data.validity ? new Date(data.validity).toISOString() : null,
        total_value: (data.items || []).reduce((acc, item) => acc + (item.quantity * item.unitValue), 0),
        notes: data.internalNotes,
        observations: data.observations,
        logo_url: data.logoUrl,
        logo_position: data.logoPosition,
        client_id: data.clientId,
        company_id: data.companyId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 2. Atualizar itens (Delete all + Insert)
    // Primeiro removemos os existentes
    const { error: deleteError } = await supabase
      .from('proposal_items')
      .delete()
      .eq('proposal_id', id);

    if (deleteError) throw deleteError;

    // Inserir novos
    if (data.items && data.items.length > 0) {
      const itemsToInsert = data.items.map((item, index) => ({
        proposal_id: id,
        type: 'service',
        name: item.description,
        description: item.itemObservation || "",
        quantity: item.quantity,
        unit_price: item.unitValue,
        total: item.quantity * item.unitValue,
        unit: item.unit || 'hora',
        "order": index
      }));

      const { error: itemsError } = await supabase
        .from('proposal_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return proposal;
  }
};
