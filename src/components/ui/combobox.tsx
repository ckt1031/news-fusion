'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/app/utils/cn';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

interface ComboboxProps {
	value: string;
	setValue: (value: string) => void;

	values: { value: string; label: string }[];
	placeholder: string;
}

export function Combobox({
	value,
	setValue,
	values,
	placeholder,
}: ComboboxProps) {
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[250px] justify-between"
				>
					{value ? values.find((v) => v.value === value)?.label : placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[250px] p-0">
				<Command>
					<CommandInput placeholder="Search" />
					<CommandEmpty>No value found.</CommandEmpty>
					<CommandGroup>
						<CommandList>
							{values.map((d) => (
								<CommandItem
									key={d.value}
									value={d.value}
									onSelect={(currentValue: string) => {
										setValue(currentValue === value ? '' : currentValue);
										setOpen(false);
									}}
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											value === d.value ? 'opacity-100' : 'opacity-0',
										)}
									/>
									{d.label}
								</CommandItem>
							))}
						</CommandList>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
