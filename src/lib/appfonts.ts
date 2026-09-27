import { Inter } from "next/font/google";

import { bricolage, jakarta } from "./fonts";

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const appFontVariables = `${inter.variable} ${bricolage.variable} ${jakarta.variable}`;
