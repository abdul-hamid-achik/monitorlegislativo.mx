import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl() {
  return process.env.NODE_ENV === "production"
    ? process.env.VERCEL_URL || "https://monitorlegislativo.mx"
    : "http://localhost:3000"
}
