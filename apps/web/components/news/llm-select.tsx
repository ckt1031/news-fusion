import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { availableFrontendCallModels } from '@ckt1031/config';
import type { Control } from 'react-hook-form';

interface Props {
	formControl: Control<
		{
			llmModel?: string;
		},
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		any
	>;
}

export default function LLMSelect({ formControl }: Props) {
	return (
		<FormField
			control={formControl}
			name="llmModel"
			render={({ field }) => (
				<FormItem className="mb-4">
					<FormLabel htmlFor={field.name}>Model</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
							<SelectTrigger className="w-full mb-2">
								<SelectValue placeholder="Select a model" />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{availableFrontendCallModels.map(({ value, label }) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
