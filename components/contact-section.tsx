"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { ErrorTooltip } from "@/components/ui/error-tooltip";

export function ContactSection() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const validarNome = (nome: string) => {
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    return regex.test(nome);
  };

  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateForm = (values: typeof formState) => {
    const fieldErrors: { [k: string]: string } = {};

    if (!values.name || values.name.trim().length < 3 || !validarNome(values.name)) {
      fieldErrors.name = "Nome deve ter pelo menos 3 letras e conter apenas letras e espaços.";
    }

    if (!values.email || !validarEmail(values.email)) {
      fieldErrors.email = "E-mail deve ser válido.";
    }

    const cleanedPhone = values.phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      fieldErrors.phone = "Telefone deve ser válido.";
    }

    if (!values.message || values.message.trim().length === 0) {
      fieldErrors.message = "Mensagem é obrigatória.";
    }

    return fieldErrors;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormState((prev) => {
      const updated = { ...prev, [name]: value };
      setErrors(validateForm(updated));
      return updated;
    });
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    handleFieldChange("name", valor);
  };

  // Função para formatar telefone
  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "");
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0,2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7,11)}`;
  }

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const valor = formatarTelefone(e.target.value);
    handleFieldChange("phone", valor);
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFieldChange("email", e.target.value);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange("message", e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors({});
    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    // Simular envio
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormState({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
      setErrors({});
      setTimeout(() => { setIsSubmitted(false); }, 5000);
    }, 1500);
  };

  return (
    <section id="contact" className="section-padding bg-muted/50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Entre em contato</h2>
            <p className="text-muted-foreground mb-8">
              Estamos prontos para atender suas necessidades. Entre em contato para tirar dúvidas,
              solicitar orçamentos ou agendar uma visita ao nosso estúdio.
            </p>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 font-inter">E-mail</h3>
                  <a 
                    href="mailto:comercial@gsproducao.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    comercial@gsproducao.com
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 font-inter">WhatsApp</h3>
                  <a 
                    href="https://wa.me/5521968199637"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +55 21 96819-9637
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1 font-inter">Endereço</h3>
                  <p className="text-muted-foreground">
                    Rio de Janeiro, RJ - Brasil
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h3 className="text-xl font-medium mb-6 font-inter">Envie uma mensagem</h3>
            
            {isSubmitted ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded mb-4">
                <p className="font-medium">Mensagem enviada com sucesso!</p>
                <p className="text-sm mt-1">Entraremos em contato em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleNameChange}
                    placeholder="Seu nome completo"
                    required
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className="w-full"
                  />
                  {errors.name && (
                    <span id="name-error" className="text-red-500 text-xs mt-1 block break-words" role="alert" tabIndex={0}>
                      {errors.name}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4 relative">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleEmailChange}
                    placeholder="seu@email.com"
                    required
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className="w-full"
                  />
                  <ErrorTooltip
                    show={!!errors.email && !formState.email}
                    message="Preencha este campo."
                  />
                  {errors.email && formState.email && (
                    <span
                      id="email-error"
                      className="text-red-500 text-xs mt-1 block break-words"
                      role="alert"
                    >
                      {errors.email}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4 relative">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formState.phone}
                    onChange={handlePhoneChange}
                    placeholder="(00) 00000-0000"
                    required
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                    className="w-full"
                  />
                  <ErrorTooltip
                    show={!!errors.phone && !formState.phone}
                    message="Preencha este campo."
                  />
                  {errors.phone && formState.phone && (
                    <span id="phone-error" className="text-red-500 text-xs mt-1 block break-words" role="alert">
                      {errors.phone}
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleMessageChange}
                    placeholder="Como podemos ajudar?"
                    rows={4}
                    required
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className="w-full"
                  />
                  {errors.message && (
                    <span id="message-error" className="text-red-500 text-xs mt-1 block break-words" role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-dark text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting || (submitted && Object.keys(errors).length > 0)}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> Enviar mensagem
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}