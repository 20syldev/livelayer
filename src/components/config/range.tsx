"use client";

import { Slider } from "radix-ui";

interface Props {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label: string;
    valueText?: string;
    id?: string;
}

/**
 * Cancels touch presses that land on the track so that touch drags must start on the thumb: a swipe over the
 * track scrolls the panel instead of moving the value. Touch pointers are captured implicitly and Radix slides
 * on any captured move, so the capture is released as well as the event cancelled.
 *
 * @param event - Pointer down received by the slider root; mouse, pen and touches on the thumb are left alone
 */
function ignoreTrackTouch(event: React.PointerEvent<HTMLSpanElement>) {
    const target = event.target as Element;
    if (event.pointerType !== "touch" || target.closest('[role="slider"]')) return;

    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    event.preventDefault();
}

/**
 * Single-thumb slider with a 44px tall hit area.
 *
 * @param value - Current value, between min and max
 * @param min - Lowest value, reached at the left end of the track
 * @param max - Highest value, reached at the right end of the track
 * @param step - Increment between two values, 1 when omitted
 * @param onChange - Called with the new value on every move of the thumb
 * @param label - Accessible name of the thumb, since the slider has no visible label of its own
 * @param valueText - Spoken form of the value, e.g. "12 hearts per minute"; the raw number is read when omitted
 * @param id - DOM id of the thumb so an external label can target it with htmlFor
 */
export function Range({ value, min, max, step = 1, onChange, label, valueText, id }: Props) {
    return (
        <Slider.Root
            value={[value]}
            min={min}
            max={max}
            step={step}
            onValueChange={([next]) => onChange(next)}
            onPointerDown={ignoreTrackTouch}
            className="relative -my-1.5 flex h-11 w-full touch-pan-y items-center select-none data-[disabled]:opacity-50"
        >
            <Slider.Track className="relative h-1 grow overflow-hidden rounded-full bg-raised">
                <Slider.Range className="absolute h-full bg-pink" />
            </Slider.Track>
            <Slider.Thumb
                id={id}
                aria-label={label}
                aria-valuetext={valueText}
                className="relative block size-[22px] touch-none rounded-full bg-white shadow-knob-lg transition-shadow outline-none after:absolute after:-inset-[11px] after:content-[''] focus-visible:ring-4 focus-visible:ring-pink/60"
            />
        </Slider.Root>
    );
}
