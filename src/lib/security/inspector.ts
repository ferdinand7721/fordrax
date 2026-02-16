import { z, ZodSchema } from "zod";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export class Inspector {
    public static sanitize(input: string): string {
        return purify.sanitize(input);
    }

    public static validate<T>(schema: ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: any } {
        const result = schema.safeParse(data);
        if (result.success) {
            return { success: true, data: result.data };
        }
        console.error("[INSPECTOR] Validation Failed:", result.error);
        return { success: false, error: result.error };
    }
}
