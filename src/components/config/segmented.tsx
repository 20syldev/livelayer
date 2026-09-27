"use client";

import { RadioGroup } from "radix-ui";

import { CHIP } from "@/components/config/chip";
import { cn } from "@/lib/utils";

interface Props<T extends string> {
    value: T;
    options: { value: T; label: React.ReactNode; aria?: string }[];
    onChange: (value: T) => void;
    label: string;
    className?: string;
}

/**
 * Single choice among a few options: an accessible radiogroup shown as a row of chips.
 *
 * @param value - Value of the selected option
 * @param options - Choices in display order; aria replaces the accessible name when the label is an icon
 * @param onChange - Called with the value of the option the user picked
 * @param label - Accessible name of the whole group, since the chips show no shared caption
 * @param className - Extra classes merged onto the group wrapper, e.g. to change its layout
 */
export function Segmented<T extends string>({ value, options, onChange, label, className }: Props<T>) {
    return (
        <RadioGroup.Root
            value={value}
            onValueChange={(next) => onChange(next as T)}
            orientation="horizontal"
            aria-label={label}
            className={cn("flex flex-wrap gap-2", className)}
        >
            {options.map((option) => (
                <RadioGroup.Item
                    key={option.value}
                    value={option.value}
                    aria-label={option.aria}
                    className={cn(CHIP, "flex min-w-11 items-center justify-center gap-1.5")}
                >
                    {option.label}
                </RadioGroup.Item>
            ))}
        </RadioGroup.Root>
    );
}
