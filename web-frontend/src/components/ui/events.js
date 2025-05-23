import va from "@vercel/analytics";
import { z } from "zod";
const eventSchema = z.object({
    name: z.enum([
        "copy_npm_command",
        "copy_usage_import_code",
        "copy_usage_code",
        "copy_primitive_code",
        "copy_theme_code",
        "copy_block_code",
        "copy_chunk_code",
        "enable_lift_mode",
    ]),
    // declare type AllowedPropertyValues = string | number | boolean | null
    properties: z
        .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
        .optional(),
});
export function trackEvent(input) {
    const event = eventSchema.parse(input);
    if (event) {
        va.track(event.name, event.properties);
    }
}
