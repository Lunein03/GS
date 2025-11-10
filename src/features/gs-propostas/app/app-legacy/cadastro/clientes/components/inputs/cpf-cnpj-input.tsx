import { useCallback, type ChangeEvent } from 'react';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';

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

function validateCpf(cpf: string): boolean {
	const digits = cpf.replace(/\D/g, '');
	if (digits.length !== 11 || /^([0-9])\1+$/.test(digits)) {
		return false;
	}

	const calcCheckDigit = (slice: number) => {
		const sum = digits
			.slice(0, slice)
			.split('')
			.reduce((acc, curr, idx) => acc + Number(curr) * (slice + 1 - idx), 0);
		const mod = (sum * 10) % 11;
		return mod === 10 ? 0 : mod;
	};

	const d1 = calcCheckDigit(9);
	const d2 = calcCheckDigit(10);

	return d1 === Number(digits[9]) && d2 === Number(digits[10]);
}

function validateCnpj(cnpj: string): boolean {
	const digits = cnpj.replace(/\D/g, '');
	if (digits.length !== 14 || /^([0-9])\1+$/.test(digits)) {
		return false;
	}

	const calcCheckDigit = (slice: number) => {
		const factors = slice === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
		const sum = digits
			.slice(0, slice)
			.split('')
			.reduce((acc, curr, idx) => acc + Number(curr) * factors[idx], 0);
		const mod = sum % 11;
		return mod < 2 ? 0 : 11 - mod;
	};

	const d1 = calcCheckDigit(12);
	const d2 = calcCheckDigit(13);

	return d1 === Number(digits[12]) && d2 === Number(digits[13]);
}

export function CpfCnpjInput({ tipo, value, onChange, onValidationComplete, error, disabled }: CpfCnpjInputProps) {
	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		const formatted = formatDocument(tipo, event.target.value);
		onChange(formatted);
	};

	const handleBlur = useCallback(() => {
		const digits = value.replace(/\D/g, '');
		if (digits.length === (tipo === 'fisica' ? 11 : 14)) {
			const isValid = tipo === 'fisica' ? validateCpf(digits) : validateCnpj(digits);
			onValidationComplete?.(isValid);
		} else {
			onValidationComplete?.(false);
		}
	}, [tipo, value, onValidationComplete]);

	return (
		<div className="space-y-2">
			<Label htmlFor="cpfCnpj">{tipo === 'fisica' ? 'CPF' : 'CNPJ'} *</Label>
			<Input
				id="cpfCnpj"
				value={value}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={tipo === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
				maxLength={tipo === 'fisica' ? 14 : 18}
				disabled={disabled}
				className={cn(error && 'border-red-500')}
			/>
			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
}


