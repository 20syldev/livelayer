"use client";

import { Switch } from "radix-ui";

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
    id?: string;
}

/**
 * Accessible 48x28 switch; the ::after pad extends the hit area to 44px tall.
 *
 * @param checked - Current state, controlled by the parent
 * @param onChange - Called with the next state when the user flips the switch
 * @param label - Accessible name, since the switch shows no text of its own
 * @param disabled - Blocks interaction and dims the switch, e.g. while a permission prompt is pending
 * @param id - DOM id so an external label can target the switch with htmlFor
 */
export function Toggle({ checked, onChange, label, disabled, id }: Props) {
    return (
        <Switch.Root
            id={id}
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            aria-label={label}
            className="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-raised p-0.5 transition-colors outline-none after:absolute after:-inset-2 after:content-[''] focus-visible:ring-2 focus-visible:ring-pink focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-pink"
        >
            <Switch.Thumb className="pointer-events-none block size-6 rounded-full bg-white shadow-knob transition-transform data-[state=checked]:translate-x-5" />
        </Switch.Root>
    );
}
