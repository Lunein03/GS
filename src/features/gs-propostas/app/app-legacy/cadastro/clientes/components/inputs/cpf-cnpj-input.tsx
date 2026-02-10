import { useState, useCallback, type ChangeEvent } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { Check, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { fetchCNPJDataWithCache, isCNPJError } from '@/shared/lib/api-services';
import { validateCPF, validateCNPJ } from '@/shared/lib/validators';

type CpfCnpjInputProps = {
	tipo: 'fisica' | 'juridica';
	value: string;
	onChange: (value: string) => void;
	onValidationComplete?: (isValid: boolean, data?: unknown) => void;
	error?: string;
	disabled?: boolean;
};

function formatDocument(tipo: 'fisica' | 'juridica', value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, tipo === 'fisica' ? 11 : 14);

	if (tipo === 'fisica') {
		return digits
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d)/, '$1.$2')
			.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
	}

	return digits
		.replace(/(\d{2})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1.$2')
		.replace(/(\d{3})(\d)/, '$1/$2')
		.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function CpfCnpjInput({ tipo, value, onChange, onValidationComplete, error, disabled }: CpfCnpjInputProps) {
	const [isConsulting, setIsConsulting] = useState(false);

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const formatted = formatDocument(tipo, event.target.value);
		onChange(formatted);
	};

	const handleBlur = useCallback(() => {
		const digits = value.replace(/\D/g, '');
		if (digits.length === (tipo === 'fisica' ? 11 : 14)) {
			const isValid = tipo === 'fisica' ? validateCPF(digits) : validateCNPJ(digits);
			if (!isValid) {
				onValidationComplete?.(false);
			}
		}
	}, [tipo, value, onValidationComplete]);

	const handleConsult = async () => {
		const digits = value.replace(/\D/g, '');

		if (tipo === 'fisica') {
			if (digits.length !== 11) {
				toast.error('Informe um CPF completo.');
				return;
			}
			if (!validateCPF(digits)) {
				toast.error('CPF inválido.');
				onValidationComplete?.(false);
				return;
			}
			toast.success('CPF validado com sucesso.');
			onValidationComplete?.(true);
			return;
		}

		if (digits.length !== 14) {
			toast.error('Informe um CNPJ completo para consultar.');
			return;
		}

		if (!validateCNPJ(digits)) {
			toast.error('CNPJ inválido.');
			onValidationComplete?.(false);
			return;
		}

		try {
			setIsConsulting(true);
			const result = await fetchCNPJDataWithCache(digits);

			if (isCNPJError(result)) {
				toast.error(typeof result.error === 'string' ? result.error : 'Erro ao consultar CNPJ.');
				onValidationComplete?.(false);
				return;
			}

			toast.success('Dados recuperados com sucesso!');
			onValidationComplete?.(true, result);
		} catch (err) {
			console.error('Erro ao consultar CNPJ:', err);
			toast.error('Não foi possível consultar o CNPJ. Tente novamente.');
			onValidationComplete?.(false);
		} finally {
			setIsConsulting(false);
		}
	};

	const digits = value.replace(/\D/g, '');
	const canConsult = tipo === 'fisica'
		? digits.length === 11
		: digits.length === 14;

	return (
		<div className="space-y-2">
			<Label htmlFor="cpfCnpj">{tipo === 'fisica' ? 'CPF' : 'CNPJ'} *</Label>
			<div className="relative">
				<Input
					id="cpfCnpj"
					value={value}
					onChange={handleChange}
					onBlur={handleBlur}
					placeholder={tipo === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
					maxLength={tipo === 'fisica' ? 14 : 18}
					disabled={disabled || isConsulting}
					className={cn(
						"w-full", 
						error && 'border-red-500',
						tipo === 'juridica' && "pr-28" // Espaço para o botão
					)}
				/>
				{tipo === 'juridica' && (
					<div className="absolute right-1 top-1 bottom-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-full px-3 gap-1.5 hover:bg-muted"
							onClick={handleConsult}
							disabled={disabled || isConsulting || !canConsult}
							title="Consultar CNPJ"
						>
							{isConsulting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Search className="h-3.5 w-3.5" />
							)}
							<span className="text-xs font-medium">
								{isConsulting ? 'Consultando' : 'Consultar'}
							</span>
						</Button>
					</div>
				)}
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}
