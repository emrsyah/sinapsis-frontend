import z from "zod";

export const PublishResponseSchema = z.object({
    share_url: z.string().url(),
    share_token: z.string(),
})