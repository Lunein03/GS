import { useState, useCallback, type ChangeEvent } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

type CepInputProps = {
	value: string;
	onChange: (value: string) => void;
	onAddressFound?: (address: CepAddress) => void;
	error?: string;
	disabled?: boolean;
};

type CepAddress = {
	cep?: string;
	logradouro?: string;
	complemento?: string;
	bairro?: string;
	localidade?: string;
	uf?: string;
};

function formatCep(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 8);

	if (digits.length <= 5) {
		return digits;
	}

	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

async function fetchAddressFromCep(cep: string): Promise<CepAddress | null> {
	try {
		const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if ('erro' in data) {
			return null;
		}

		return data as CepAddress;
	} catch (error) {
		console.error('Erro ao buscar CEP:', error);
		return null;
	}
}

export function CepInput({ value, onChange, onAddressFound, error, disabled }: CepInputProps) {
	const [isFetching, setIsFetching] = useState(false);
	const [lookupFailed, setLookupFailed] = useState(false);

	const digits = value.replace(/\D/g, '');
	const canLookup = digits.length === 8 && !isFetching;

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const formatted = formatCep(event.target.value);
		onChange(formatted);
		setLookupFailed(false);
	};

	const handleLookup = useCallback(async () => {
		if (!canLookup) {
			return;
		}

		setIsFetching(true);

		const address = await fetchAddressFromCep(digits);

		setLookupFailed(!address);

		if (address && onAddressFound) {
			onAddressFound(address);
		}

		setIsFetching(false);
	}, [canLookup, digits, onAddressFound]);

	return (
		<div className="space-y-2">
			<Label htmlFor="cep">CEP *</Label>
			<div className="flex gap-2">
				<Input
					id="cep"
					value={value}
					onChange={handleChange}
					placeholder="00000-000"
					maxLength={9}
					disabled={disabled}
					className={cn(error && 'border-red-500')}
					onBlur={handleLookup}
				/>
				<Button
					type="button"
					variant="outline"
					onClick={handleLookup}
					disabled={!canLookup || disabled}
				>
					{isFetching ? 'Buscando...' : 'Buscar'}
				</Button>
			</div>
			{error && <p className="text-sm text-red-600">{error}</p>}
			{!error && lookupFailed && !isFetching && digits.length === 8 && (
				<p className="text-sm text-muted-foreground">Endereço não encontrado para este CEP.</p>
			)}
		</div>
	);
}


