import * as zod from "zod";

export const referralCodeParamsSchema = zod.object({
  referralCode: zod.string().nonempty("Referral code is required").trim(),
});

export type TReferralCodeParams = zod.infer<typeof referralCodeParamsSchema>;
